import { Schema, model, models } from "mongoose";

const ScholarshipSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
        }
    },
    {
        strict: false,
        collection: "scholarships",
    }
);

export default models.Scholarships ||
    model("Scholarships", ScholarshipSchema);