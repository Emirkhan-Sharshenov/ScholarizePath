import { Schema, model, models } from "mongoose";

// One document per (user, item, deadline, daysBefore) reminder that was
// actually sent — the unique index is what stops the daily cron from
// emailing the same person twice about the same deadline.
const ReminderLogSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        itemType: {
            type: String,
            enum: ["scholarship", "university"],
            required: true,
        },
        itemId: {
            type: String,
            required: true,
        },
        deadlineLabel: {
            type: String,
            required: true,
        },
        daysBefore: {
            type: Number,
            required: true,
        },
        sentAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: "reminderlogs",
    }
);

ReminderLogSchema.index(
    { userId: 1, itemType: 1, itemId: 1, deadlineLabel: 1, daysBefore: 1 },
    { unique: true }
);

export default models.ReminderLog || model("ReminderLog", ReminderLogSchema);
