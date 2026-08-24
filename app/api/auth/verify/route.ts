import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb"; // Проверьте правильность пути к connectDB
import Users from "@/models/Users"; // Проверьте правильность пути к вашей модели Users

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Verification token is missing" },
                { status: 400 }
            );
        }

        await connectDB();

        // Ищем пользователя с активным токеном, время жизни которого еще не истекло
        const user = await Users.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired verification token" },
                { status: 400 }
            );
        }

        // Подтверждаем почту и сбрасываем токены
        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save();

        // Редиректим пользователя обратно на форму входа с параметром успешной верификации
        const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        return NextResponse.redirect(`${domain}/?verified=true`);
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error during verification" },
            { status: 500 }
        );
    }
}