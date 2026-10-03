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
            // Not required for Google-authenticated accounts, which have no password.
            required: function (this: { authProvider?: string }) {
                return this.authProvider !== "google";
            },
        },

        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },

        // No `default: null` here on purpose: a sparse unique index only
        // excludes documents where the field is *absent*, not documents
        // where it's present-but-null. `default: null` would give every
        // local (non-Google) user an explicit googleId: null, and the
        // second such user to register would collide on the unique index.
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        avatarUrl: {
            type: String,
            default: null,
        },


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
        },

        deadlineReminders: {
            type: Boolean,
            default: true,
        },

        // Deadline reminders in Telegram. Set when the student opens the bot
        // from their profile (/start <token>); cleared by /stop, the profile
        // button, or when the bot can no longer reach them.
        telegram: {
            chatId: { type: String },
            username: { type: String },
            // Language of the bot's messages: the site language when they connected.
            locale: { type: String, enum: ["en", "ru"] },
            linkedAt: { type: Date },
        },

        // One-time link for connecting Telegram. Only a hash is stored; never
        // sent back to the client (see /api/auth/self).
        telegramLink: {
            tokenHash: { type: String },
            expiresAt: { type: Date },
            locale: { type: String, enum: ["en", "ru"] },
        },
    },
    {
        timestamps: true,
    }
);

// The bot looks users up by chat (/stop) and by link token (/start).
UserSchema.index({ "telegram.chatId": 1 }, { sparse: true });
UserSchema.index({ "telegramLink.tokenHash": 1 }, { sparse: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);