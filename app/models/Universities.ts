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

UniversitiesSchema.index({ name: 1 });
UniversitiesSchema.index({ searchKeywords: 1 });
UniversitiesSchema.index({ "location.country": 1 });
UniversitiesSchema.index({ "ranking.global": 1 });
UniversitiesSchema.index({ "tuition.bachelor": 1 });
UniversitiesSchema.index({ programs: 1 });
UniversitiesSchema.index({ degreeLevels: 1 });

export default models.Universities ||
    model("Universities", UniversitiesSchema);