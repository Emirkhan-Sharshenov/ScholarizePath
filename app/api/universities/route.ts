import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Universities from "@/models/Universities";

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "5", 10)));
        const search = searchParams.get("search")?.trim() || "";
        const country = searchParams.get("country") || "";
        const minRanking = searchParams.get("minRanking");
        const maxRanking = searchParams.get("maxRanking");
        const minTuition = searchParams.get("minTuition");
        const maxTuition = searchParams.get("maxTuition");
        const programs = searchParams.get("programs") || "";
        const degreeLevel = searchParams.get("degreeLevel") || "";
        const sortBy = searchParams.get("sortBy") || "Ranking: High to Low";

        const match: any = {};

        if (search) {
            match.$or = [
                { name: { $regex: search, $options: "i" } },
                { searchKeywords: { $regex: search, $options: "i" } },
            ];
        }

        if (country && country !== "All Countries") {
            match["location.country"] = country;
        }

        if (minRanking || maxRanking) {
            match["ranking.global"] = {};
            if (minRanking) match["ranking.global"].$gte = Number(minRanking);
            if (maxRanking) match["ranking.global"].$lte = Number(maxRanking);
        }

        if (minTuition || maxTuition) {
            match["tuition.bachelor"] = {};
            if (minTuition) match["tuition.bachelor"].$gte = Number(minTuition);
            if (maxTuition) match["tuition.bachelor"].$lte = Number(maxTuition);
        }

        if (programs && programs !== "All Programs") {
            match.programs = programs;
        }

        if (degreeLevel && degreeLevel !== "All Degree Levels") {
            match.degreeLevels = degreeLevel;
        }

        const sortMap: Record<string, any> = {
            "Ranking: High to Low": { "ranking.global": 1 },
            "Ranking: Low to High": { "ranking.global": -1 },
            "Tuition: Low to High": { "tuition.bachelor": 1 },
            "Tuition: High to Low": { "tuition.bachelor": -1 },
        };
        const sort = sortMap[sortBy] || { "ranking.global": 1 };

        const projection = {
            name: 1,
            location: 1,
            ranking: 1,
            tuition: 1,
            description: 1,
        };

        const [data, totalCount] = await Promise.all([
            Universities.find(match)
                .select(projection)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Universities.countDocuments(match),
        ]);

        return NextResponse.json({
            data,
            totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (error) {
        console.error("Universities API error:", error);
        return NextResponse.json(
            { message: "Failed to fetch universities" },
            { status: 500 }
        );
    }
}