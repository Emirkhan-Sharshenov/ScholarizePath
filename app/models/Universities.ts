import { Schema, model, models } from "mongoose";

const UniversitiesSchema = new Schema(
    {},
    {
        strict: false, 
        collection: "universities",
    }
);

export default models.Universities ||
    model("Universities", UniversitiesSchema);