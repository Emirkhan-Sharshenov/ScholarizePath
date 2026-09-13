import { Schema, model, models } from "mongoose";

export const APPLICATION_STATUS_VALUES = [
    "not_started",
    "in_progress",
    "submitted",
    "waiting",
    "accepted",
    "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS_VALUES)[number];

const ApplicationSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
        },

        userId: {
            type: String,
            required: true,
        },

        itemType: {
            type: String,
            enum: ["university", "scholarship"],
            required: true,
        },

        // Id of the university/scholarship document being tracked.
        itemId: {
            type: String,
            required: true,
        },

        // Denormalized so the board can render without joining against
        // the (schema-less) universities/scholarships collections on every load.
        itemName: {
            type: String,
            required: true,
            trim: true,
        },

        itemSubtitle: {
            type: String,
            default: null,
            trim: true,
        },

        status: {
            type: String,
            enum: APPLICATION_STATUS_VALUES,
            default: "not_started",
        },

        deadline: {
            type: Date,
            default: null,
        },

        notes: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        collection: "applications",
        timestamps: true,
    }
);

ApplicationSchema.index({ userId: 1, createdAt: -1 });
// One tracked row per user per university/scholarship — re-tracking a
// favorite should update the existing row, not create a duplicate.
ApplicationSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });
ApplicationSchema.index({ userId: 1, deadline: 1 });

export default models.Application || model("Application", ApplicationSchema);
