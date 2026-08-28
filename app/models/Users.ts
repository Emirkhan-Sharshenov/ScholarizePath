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
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        // --- ПОЛЯ ДЛЯ ВЕРИФИКАЦИИ ПО 6-ЗНАЧНОМУ КОДУ ---
        isVerified: {
            type: Boolean,
            default: false,
        },

        verificationCode: {
            type: String,
            default: null,
        },

        verificationCodeExpires: {
            type: Date,
            default: null,
        },
        // ----------------------------------------------

        // Explicit, permanent flag — set once to true by /api/profile/setup and never reset.
        // Kept separate from the `profile.*` fields below because those can legitimately
        // stay null/empty later on and shouldn't be misread as "setup not done".
        profileSetupComplete: {
            type: Boolean,
            default: false,
        },

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
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);