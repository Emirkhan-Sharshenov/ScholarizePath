import { Schema, model, models } from "mongoose";

const ScholarshipSchema = new Schema(
    {},
    {
        strict: false, // пока разрешаем любые поля из твоего JSON
        collection: "scholarships",
    }
);

export default models.Scholarship ||
    model("Scholarship", ScholarshipSchema);