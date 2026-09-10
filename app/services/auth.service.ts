import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { connectDB } from "../lib/mongodb";
import Users from "../models/Users";
import VerificationEmail from "../emails/VerificationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const REGISTRATION_SECRET = process.env.JWT_SECRET || "registration-secret-key";
const EMAIL_FROM =
    process.env.RESEND_FROM || "ScholarizePath <noreply@scholarizepath.xyz>";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_JWKS = createRemoteJWKSet(
    new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export async function register(request: Request) {
    await connectDB();

    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
        return NextResponse.json(
            { success: false, message: "All fields are required" },
            { status: 400 }
        );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Проверяем, нет ли УЖЕ подтвержденного пользователя в БД
    const existingUser = await Users.findOne({ email: cleanEmail });
    if (existingUser) {
        return NextResponse.json(
            { success: false, message: "User already exists" },
            { status: 409 }
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomInt(100000, 1000000).toString();

    // Отправка письма с кодом.
    // Resend SDK не бросает исключение на ошибку API — она приходит в поле `error`.
    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: cleanEmail,
            subject: "Your Verification Code - ScholarizePath",
            react: VerificationEmail({
                firstName,
                code: verificationCode,
            }),
        });

        if (error) {
            console.error("Resend rejected the verification email:", error);
            return NextResponse.json(
                { success: false, message: "Failed to send verification email" },
                { status: 500 }
            );
        }

        console.log("Verification email sent:", data?.id);
    } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        return NextResponse.json(
            { success: false, message: "Failed to send verification email" },
            { status: 500 }
        );
    }

 
    const registerSessionToken = jwt.sign(
        {
            firstName,
            lastName,
            email: cleanEmail,
            password: hashedPassword,
            verificationCode,
        },
        REGISTRATION_SECRET,
        { expiresIn: "15m" }
    );

    const response = NextResponse.json(
        {
            success: true,
            message: "Verification code sent! Please check your email.",
        },
        { status: 200 }
    );

   
    response.cookies.set({
        name: "register_session",
        value: registerSessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60,
        path: "/",
    });

    return response;
}

export async function verify(request: Request) {
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionCookie = cookieHeader
        .split("; ")
        .find((row) => row.startsWith("register_session="))
        ?.split("=")[1];

    if (!sessionCookie) {
        return NextResponse.json(
            { success: false, message: "Registration session expired. Please register again." },
            { status: 400 }
        );
    }

    let payload: any;
    try {
        payload = jwt.verify(sessionCookie, REGISTRATION_SECRET);
    } catch (err) {
        return NextResponse.json(
            { success: false, message: "Verification code expired or invalid session." },
            { status: 400 }
        );
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
        return NextResponse.json(
            { success: false, message: "Verification code is required" },
            { status: 400 }
        );
    }

    // Проверяем введенный код
    if (payload.verificationCode !== code.toString().trim()) {
        return NextResponse.json(
            { success: false, message: "Invalid verification code" },
            { status: 400 }
        );
    }

    await connectDB();
    const existingUser = await Users.findOne({ email: payload.email });
    if (existingUser) {
        return NextResponse.json(
            { success: false, message: "User already registered" },
            { status: 409 }
        );
    }

    const user = await Users.create({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
        isVerified: true,
    });
    const authToken = jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
            profileSetupComplete: user.profileSetupComplete,
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
    );

    const response = NextResponse.json(
        {
            success: true,
            message: "Email verified and account created successfully!",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        },
        { status: 201 }
    );

    response.cookies.set({
        name: "register_session",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
    });


    response.cookies.set({
        name: "token",
        value: authToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // "lax", not "strict" — a "strict" session cookie gets dropped by the
        // browser on top-level cross-site navigation (an email link, a QR
        // code, opening from another app), which looks exactly like "randomly
        // logged out" to a user even though the cookie is still valid.
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });

    return response;
}

export async function login(request: Request) {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
        return NextResponse.json(
            { success: false, message: "Email and password are required" },
            { status: 400 }
        );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await Users.findOne({ email: cleanEmail });

    if (!user) {
        return NextResponse.json(
            { success: false, message: "Invalid email or password" },
            { status: 401 }
        );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return NextResponse.json(
            { success: false, message: "Invalid email or password" },
            { status: 401 }
        );
    }

    const authToken = jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
            profileSetupComplete: user.profileSetupComplete,
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
    );

    const response = NextResponse.json(
        {
            success: true,
            message: "Logged in successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        },
        { status: 200 }
    );

    response.cookies.set({
        name: "token",
        value: authToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });

    return response;
}

export async function logout(request: Request) {
    const response = NextResponse.json(
        { success: true, message: "Logged out successfully" },
        { status: 200 }
    );

    response.cookies.set({
        name: "token",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });

    return response;
}

function googleRedirectUri(request: Request) {
    return `${new URL(request.url).origin}/api/auth/google/callback`;
}

export async function googleLogin(request: Request) {
    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.redirect(
            new URL("/login?error=google_not_configured", request.url)
        );
    }

    const state = crypto.randomBytes(16).toString("hex");

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", googleRedirectUri(request));
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("prompt", "select_account");

    const response = NextResponse.redirect(authUrl);

    // sameSite must be "lax" (not "strict") — this cookie has to survive the
    // top-level redirect back from accounts.google.com to our callback.
    response.cookies.set({
        name: "google_oauth_state",
        value: state,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60,
        path: "/",
    });

    return response;
}

export async function googleCallback(request: Request) {
    const loginUrl = new URL("/login", request.url);

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        loginUrl.searchParams.set("error", "google_not_configured");
        return NextResponse.redirect(loginUrl);
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");

    const cookieHeader = request.headers.get("cookie") || "";
    const expectedState = cookieHeader
        .split("; ")
        .find((row) => row.startsWith("google_oauth_state="))
        ?.split("=")[1];

    const clearStateCookie = (response: NextResponse) => {
        response.cookies.set({
            name: "google_oauth_state",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        });
        return response;
    };

    if (oauthError || !code || !state || !expectedState || state !== expectedState) {
        loginUrl.searchParams.set("error", "google_auth_failed");
        return clearStateCookie(NextResponse.redirect(loginUrl));
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: googleRedirectUri(request),
            grant_type: "authorization_code",
        }),
    });

    if (!tokenResponse.ok) {
        console.error("Google token exchange failed:", await tokenResponse.text());
        loginUrl.searchParams.set("error", "google_auth_failed");
        return clearStateCookie(NextResponse.redirect(loginUrl));
    }

    const tokens = await tokenResponse.json();
    const idToken = tokens.id_token as string | undefined;

    if (!idToken) {
        loginUrl.searchParams.set("error", "google_auth_failed");
        return clearStateCookie(NextResponse.redirect(loginUrl));
    }

    let payload;
    try {
        const result = await jwtVerify(idToken, GOOGLE_JWKS, {
            issuer: ["https://accounts.google.com", "accounts.google.com"],
            audience: GOOGLE_CLIENT_ID,
        });
        payload = result.payload;
    } catch (err) {
        console.error("Invalid Google id_token:", err);
        loginUrl.searchParams.set("error", "google_auth_failed");
        return clearStateCookie(NextResponse.redirect(loginUrl));
    }

    const googleId = payload.sub as string;
    const email = (payload.email as string | undefined)?.toLowerCase().trim();
    const emailVerified = payload.email_verified as boolean | undefined;

    if (!email || emailVerified === false) {
        loginUrl.searchParams.set("error", "google_email_unverified");
        return clearStateCookie(NextResponse.redirect(loginUrl));
    }

    await connectDB();

    let user = await Users.findOne({ googleId });

    if (!user) {
        user = await Users.findOne({ email });

        if (user) {
            // Existing local (email/password) account with the same address —
            // link it so either sign-in method works from now on. Safe because
            // Google only reaches here once it has verified the email itself.
            user.googleId = googleId;
            if (!user.avatarUrl && typeof payload.picture === "string") {
                user.avatarUrl = payload.picture;
            }
            await user.save();
        } else {
            user = await Users.create({
                firstName: (payload.given_name as string) || "Google",
                lastName: (payload.family_name as string) || "User",
                email,
                googleId,
                authProvider: "google",
                isVerified: true,
                avatarUrl: (payload.picture as string) || null,
            });
        }
    }

    const authToken = jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
            profileSetupComplete: user.profileSetupComplete,
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
    );

    const destination = new URL(
        user.profileSetupComplete ? "/dashboard" : "/profile/setup",
        request.url
    );
    const response = clearStateCookie(NextResponse.redirect(destination));

    response.cookies.set({
        name: "token",
        value: authToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });

    return response;
}