import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Users from "@/models/Users";
import Universities from "@/models/Universities";
import Scholarship from "@/models/Scholarship";
import { requireAdmin } from "@/lib/requireAdmin";
import { AuthRequest } from "@/types/auth";

interface ActivityItem {
    action: string;
    name: string;
    detail: string;
    time: string; // ISO date, formatted client-side
}

export async function GET(request: AuthRequest) {
    // Только для admin — раньше сюда мог зайти кто угодно без логина
    // и увидеть имена/фамилии последних зарегистрированных пользователей.
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) {
        return auth;
    }

    try {
        await connectDB();

        const [recentUsers, recentUniversities, recentScholarships] = await Promise.all([
            Users.find()
                .select({ firstName: 1, lastName: 1, createdAt: 1 })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            Universities.find()
                .select({ name: 1, "location.country": 1, createdAt: 1, updatedAt: 1 })
                .sort({ updatedAt: -1 })
                .limit(5)
                .lean(),
            Scholarship.find()
                .select({ scholarshipName: 1, country: 1, createdAt: 1, updatedAt: 1 })
                .sort({ updatedAt: -1 })
                .limit(5)
                .lean(),
        ]);

        const items: ActivityItem[] = [
            ...recentUsers.map((u: any) => ({
                action: "User Registration",
                name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "New user",
                detail: "—",
                time: u.createdAt,
            })),
            ...recentUniversities.map((u: any) => {
                const wasUpdatedAfterCreation =
                    u.updatedAt && u.createdAt && new Date(u.updatedAt) > new Date(u.createdAt);
                return {
                    action: wasUpdatedAfterCreation ? "University Updated" : "University Added",
                    name: u.name ?? "Unknown",
                    detail: u.location?.country ?? "—",
                    time: u.updatedAt ?? u.createdAt,
                };
            }),
            ...recentScholarships.map((s: any) => {
                const wasUpdatedAfterCreation =
                    s.updatedAt && s.createdAt && new Date(s.updatedAt) > new Date(s.createdAt);
                return {
                    action: wasUpdatedAfterCreation ? "Scholarship Updated" : "Scholarship Added",
                    name: s.scholarshipName ?? "Unknown",
                    detail: s.country ?? "—",
                    time: s.updatedAt ?? s.createdAt,
                };
            }),
        ];

        items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return NextResponse.json({
            success: true,
            activities: items.slice(0, 8),
        });
    } catch (error) {
        console.error("Recent activity API error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch recent activity" },
            { status: 500 }
        );
    }
}