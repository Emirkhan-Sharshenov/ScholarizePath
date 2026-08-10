import { Schema, model, models } from "mongoose";

const UniversitiesSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
        }
    },
    {
        strict: false, 
        collection: "universities",
    }
);

export default models.Universities ||
    model("Universities", UniversitiesSchema);