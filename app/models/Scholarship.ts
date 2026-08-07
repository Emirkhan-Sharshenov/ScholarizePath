import { Schema, model, models } from "mongoose";

const ScholarshipSchema = new Schema(
    {},
    {
        strict: false, 
        collection: "scholarships",
    }
);

export default models.Scholarship ||
    model("Scholarship", ScholarshipSchema);