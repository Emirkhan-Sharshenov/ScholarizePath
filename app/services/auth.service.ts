import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { connectDB } from "../lib/mongodb";
import Users from "../models/Users";
import VerificationEmail from "../emails/VerificationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const REGISTRATION_SECRET = process.env.JWT_SECRET || "registration-secret-key";

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

    // Отправка письма с кодом
    try {
        await resend.emails.send({
            from: "ScholarizePath <onboarding@resend.dev>",
            to: cleanEmail,
            subject: "Your Verification Code - ScholarizePath",
            react: VerificationEmail({
                firstName,
                code: verificationCode,
            }),
        });
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
        sameSite: "strict",
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
        sameSite: "strict",
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
        sameSite: "strict",
        maxAge: 0,
        path: "/",
    });

    return response;
}