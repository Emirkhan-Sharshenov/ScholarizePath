import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { connectDB } from "../lib/mongodb";
import Users from "../models/Users";
import { generateToken } from "../lib/jwt";
import { AuthRequest } from "../types/auth";
import { authMiddleware } from "../middleware/auth.middleware";
import VerificationEmail from "../emails/VerificationEmail"; // Проверьте путь к вашему шаблону

const resend = new Resend(process.env.RESEND_API_KEY);

export async function register(request: Request) {
    await connectDB();

    const body = await request.json();

    const {
        firstName,
        lastName,
        email,
        password,
    } = body;

    if (!firstName || !lastName || !email || !password) {
        return NextResponse.json(
            {
                success: false,
                message: "All fields are required",
            },
            {
                status: 400,
            }
        );
    }

    const existingUser = await Users.findOne({ email });

    if (existingUser) {
        return NextResponse.json(
            {
                success: false,
                message: "User already exists",
            },
            {
                status: 409,
            }
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Генерация токена подтверждения (24 часа)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await Users.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        verificationTokenExpires,
    });

    // Формирование ссылки подтверждения
    const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${domain}/api/auth/verify?token=${verificationToken}`;

    // Отправка письма через Resend
    try {
        await resend.emails.send({
            from: "ScholarizePath <onboarding@resend.dev>",
            to: email,
            subject: "Verify Your Email Address - ScholarizePath",
            react: VerificationEmail({
                firstName,
                verifyUrl,
            }),
        });
    } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
    }

    // Возвращаем ответ БЕЗ установки куки авторизации, пока почта не подтверждена
    return NextResponse.json(
        {
            success: true,
            message: "Account created! Please check your email to verify your account.",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isVerified: user.isVerified,
            },
        },
        { status: 201 }
    );
}

export async function login(request: Request) {
    await connectDB();

    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
        return NextResponse.json(
            {
                success: false,
                message: "Email and password are required",
            },
            { status: 400 }
        );
    }

    const user = await Users.findOne({ email });

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid credentials",
            },
            { status: 401 }
        );
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid credentials",
            },
            { status: 401 }
        );
    }

    // 🔒 Проверка подтверждения почты
    if (!user.isVerified) {
        return NextResponse.json(
            {
                success: false,
                message: "Please verify your email address before logging in.",
            },
            { status: 403 }
        );
    }

    const token = generateToken(user._id.toString());

    const response = NextResponse.json(
        {
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                createdAt: user.createdAt,
            },
        },
        { status: 200 }
    );

    response.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });

    return response;
}

export async function me(request: AuthRequest) {
    await connectDB();

    const auth = await authMiddleware(request);

    if (auth instanceof NextResponse) {
        return auth;
    }

    const user = await Users.findById(auth).select("-password");
    if (!user) {
        return NextResponse.json(
            {
                success: false,
                message: "User not found",
            },
            {
                status: 404,
            }
        );
    }

    return NextResponse.json(
        {
            success: true,
            user,
        },
        {
            status: 200,
        }
    );
}

export async function logout() {
    const response = NextResponse.json(
        {
            success: true,
            message: "Logged out successfully",
        },
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