import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Users from "@/models/Users";

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "30d"; // 7d | 30d | 90d | all

        const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
        const days = daysMap[range];

        const match: any = {};
        if (days) {
            const since = new Date();
            since.setDate(since.getDate() - days);
            match.createdAt = { $gte: since };
        }

        // Group by calendar day — cheap in MongoDB since it only touches
        // the createdAt index, never loads full user documents.
        const raw = await Users.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill in zero-count days so the chart doesn't show gaps
        const filled: { date: string; count: number }[] = [];
        const dayCount = days ?? (() => {
            if (raw.length === 0) return 0;
            const first = new Date(raw[0]._id);
            const diff = Math.ceil((Date.now() - first.getTime()) / 86400000);
            return diff + 1;
        })();

        const countMap = new Map(raw.map((r) => [r._id, r.count]));
        const cursor = new Date();
        cursor.setDate(cursor.getDate() - dayCount + 1);

        for (let i = 0; i < dayCount; i++) {
            const key = cursor.toISOString().slice(0, 10);
            filled.push({ date: key, count: countMap.get(key) ?? 0 });
            cursor.setDate(cursor.getDate() + 1);
        }

        const totalInRange = filled.reduce((sum, d) => sum + d.count, 0);

        return NextResponse.json({
            success: true,
            data: filled,
            totalInRange,
        });
    } catch (error) {
        console.error("User growth API error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch user growth" },
            { status: 500 }
        );
    }
}