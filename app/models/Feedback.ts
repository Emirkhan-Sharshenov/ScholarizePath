
import { Schema, model, models } from "mongoose";

const FeedbackSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: ["bug", "suggestion"],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        steps: {
            type: String,
            trim: true,
        },

        suggestion: {
            type: String,
            trim: true,
        },

        benefit: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: ["open", "in_progress", "resolved", "closed"],
            default: "open",
        },
    },
    {
        strict: false,
        collection: "feedback",
        timestamps: true,
    }
);

FeedbackSchema.index({ type: 1 });
FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ createdAt: -1 });

export default models.Feedback ||
    model("Feedback", FeedbackSchema);


