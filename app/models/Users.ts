import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
        },

        lastName: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },

        // --- ПОЛЯ ДЛЯ ВЕРИФИКАЦИИ ПОЧТЫ ---
        isVerified: {
            type: Boolean,
            default: false,
        },

        verificationToken: {
            type: String,
            default: null,
        },

        verificationTokenExpires: {
            type: Date,
            default: null,
        },
        // ---------------------------------

        favoriteUniversities: {
            type: [String],
            default: [],
        },

        favoriteScholarships: {
            type: [String],
            default: [],
        },

        profile: {
            age: {
                type: Number,
                default: null,
            },

            nationality: {
                type: String,
                default: null,
            },

            gpa: {
                type: Number,
                default: null,
            },

            sat: {
                type: Number,
                default: null,
            },

            englishTest: {
                type: {
                    type: String,
                    enum: ["IELTS", "TOEFL", null],
                    default: null,
                },

                score: {
                    type: Number,
                    default: null,
                },
            },

            preferredField: {
                type: String,
                default: null,
            },

            preferredCountry: {
                type: String,
                default: null,
            },

            programLevel: {
                type: String,
                default: null,
            },
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);