import { Resend } from "resend";

import { connectDB } from "../lib/mongodb";
import Scholarships from "../models/Scholarship";
import Universities from "../models/Universities";
import Users from "../models/Users";
import ReminderLog from "../models/ReminderLog";
import DeadlineReminderEmail from "../emails/DeadlineReminderEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM =
    process.env.RESEND_FROM || "ScholarizePath <noreply@scholarizepath.xyz>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://scholarizepath.xyz";

const REMINDER_DAYS = [7, 1];

type ItemType = "scholarship" | "university";

interface DeadlineEntry {
    itemType: ItemType;
    itemId: string;
    itemName: string;
    deadlineLabel: string;
    deadlineDate: Date;
    daysUntil: number;
}

// Deadline dates come from hand-entered admin data (`strict: false` collections),
// so anything that doesn't parse into a real date is silently skipped rather than
// crashing the whole run.
function daysUntil(dateValue: unknown): number | null {
    if (!dateValue) return null;
    const date = new Date(dateValue as string);
    if (Number.isNaN(date.getTime())) return null;

    const todayUTC = Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate()
    );
    const deadlineUTC = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    );

    return Math.round((deadlineUTC - todayUTC) / (24 * 60 * 60 * 1000));
}

// Scholarship/University collections are `strict: false`, so lean docs have
// no fixed shape beyond `_id` — everything else is read defensively.
type LeanItemDoc = Record<string, unknown> & { _id: string };

function collectDueDeadlines(
    items: LeanItemDoc[],
    itemType: ItemType,
    nameField: string
): DeadlineEntry[] {
    const due: DeadlineEntry[] = [];

    for (const item of items) {
        const deadlines = Array.isArray(item.deadlines)
            ? (item.deadlines as Record<string, unknown>[])
            : [];
        const itemName = (item[nameField] as string) || "Unnamed";

        for (const deadline of deadlines) {
            const remaining = daysUntil(deadline?.date);
            if (remaining === null || !REMINDER_DAYS.includes(remaining)) continue;

            const label =
                (deadline?.name as string) || (deadline?.round as string) || "Application deadline";
            due.push({
                itemType,
                itemId: item._id,
                itemName,
                deadlineLabel: label,
                deadlineDate: new Date(deadline.date as string),
                daysUntil: remaining,
            });
        }
    }

    return due;
}

export async function sendDeadlineReminders() {
    await connectDB();

    const [scholarships, universities] = await Promise.all([
        Scholarships.find({}, { scholarshipName: 1, deadlines: 1 }).lean(),
        Universities.find({}, { name: 1, deadlines: 1 }).lean(),
    ]);

    const dueDeadlines = [
        ...collectDueDeadlines(scholarships, "scholarship", "scholarshipName"),
        ...collectDueDeadlines(universities, "university", "name"),
    ];

    let checked = 0;
    let sent = 0;
    let skipped = 0;

    for (const deadline of dueDeadlines) {
        checked += 1;

        const favField =
            deadline.itemType === "scholarship" ? "favoriteScholarships" : "favoriteUniversities";

        const favoritingUsers = await Users.find(
            { [favField]: deadline.itemId, deadlineReminders: { $ne: false } },
            { email: 1, firstName: 1 }
        ).lean();

        for (const user of favoritingUsers) {
            try {
                // Claim the (user, deadline, daysBefore) slot first via the unique
                // index — if it already exists, this throws and we skip the send.
                await ReminderLog.create({
                    userId: user._id,
                    itemType: deadline.itemType,
                    itemId: deadline.itemId,
                    deadlineLabel: deadline.deadlineLabel,
                    daysBefore: deadline.daysUntil,
                });
            } catch (err) {
                if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000) {
                    skipped += 1;
                    continue;
                }
                console.error("Failed to write reminder log:", err);
                continue;
            }

            try {
                const link = `${APP_URL}/${deadline.itemType === "scholarship" ? "scholarships" : "universities"}/${deadline.itemId}`;

                const { error } = await resend.emails.send({
                    from: EMAIL_FROM,
                    to: user.email,
                    subject: `Дедлайн через ${deadline.daysUntil} ${deadline.daysUntil === 1 ? "день" : "дней"}: ${deadline.itemName}`,
                    react: DeadlineReminderEmail({
                        firstName: user.firstName,
                        itemName: deadline.itemName,
                        itemType: deadline.itemType,
                        deadlineLabel: deadline.deadlineLabel,
                        deadlineDate: deadline.deadlineDate.toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }),
                        daysBefore: deadline.daysUntil,
                        link,
                    }),
                });

                if (error) {
                    console.error("Resend rejected a deadline reminder:", error);
                    continue;
                }

                sent += 1;
            } catch (emailError) {
                console.error("Failed to send deadline reminder:", emailError);
            }
        }
    }

    return { checked, sent, skipped };
}
