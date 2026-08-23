import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { connectDB } from "../lib/mongodb";
import Users from "../models/Users";
import { generateToken } from "../lib/jwt";
import { AuthRequest } from "../types/auth";
import { authMiddleware } from "../middleware/auth.middleware";

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

    const user = await Users.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
    });

    const token = generateToken(user._id.toString());
    const response = NextResponse.json(
        {
            success: true,
            message: "Account created",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        },
        { status: 201 }
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

    // Удаляем куку путем сброса значения и установки времени жизни в 0
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