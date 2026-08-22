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

ScholarshipSchema.index({ scholarshipName: 1 });
ScholarshipSchema.index({ searchKeywords: 1 });
ScholarshipSchema.index({ country: 1 });
ScholarshipSchema.index({ studyLevel: 1 });

export default models.Scholarships ||
    model("Scholarships", ScholarshipSchema);