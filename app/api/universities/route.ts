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

        // --- базовые фильтры (не трогают ranking/tuition) ---
        const baseMatch: any = {};

        if (search) {
            baseMatch.$or = [
                { name: { $regex: search, $options: "i" } },
                { searchKeywords: { $regex: search, $options: "i" } },
            ];
        }

        if (country && country !== "All Countries") {
            baseMatch["location.country"] = country;
        }

        if (programs && programs !== "All Programs") {
            baseMatch.programs = programs;
        }

        if (degreeLevel && degreeLevel !== "All Degree Levels") {
            baseMatch.degreeLevels = degreeLevel;
        }

        // --- вычисляем нормализованные rankingValue / tuitionValue ---
        // Универы без валидного значения получают null и уходят в конец
        // сортировки независимо от направления (asc/desc).
        const addComputedFields = {
            $addFields: {
                rankingValue: {
                    $switch: {
                        branches: [
                            {
                                case: { $and: [{ $ifNull: ["$ranking.global", false] }, { $gt: ["$ranking.global", 0] }] },
                                then: "$ranking.global",
                            },
                            {
                                case: { $and: [{ $ifNull: ["$ranking.qs", false] }, { $gt: ["$ranking.qs", 0] }] },
                                then: "$ranking.qs",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: [{ $type: "$ranking" }, "number"] },
                                        { $gt: ["$ranking", 0] },
                                    ],
                                },
                                then: "$ranking",
                            },
                        ],
                        default: null,
                    },
                },
                tuitionValue: {
                    $switch: {
                        branches: [
                            {
                                case: { $and: [{ $ifNull: ["$tuition.bachelor", false] }, { $gt: ["$tuition.bachelor", 0] }] },
                                then: "$tuition.bachelor",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: [{ $type: "$tuition" }, "number"] },
                                        { $gt: ["$tuition", 0] },
                                    ],
                                },
                                then: "$tuition",
                            },
                        ],
                        default: null,
                    },
                },
            },
        };

        const addHasFields = {
            $addFields: {
                hasRanking: { $cond: [{ $ne: ["$rankingValue", null] }, 1, 0] },
                hasTuition: { $cond: [{ $ne: ["$tuitionValue", null] }, 1, 0] },
            },
        };

        // --- диапазонные фильтры (только если явно заданы) ---
        const rangeMatch: any = {};

        if (minRanking || maxRanking) {
            rangeMatch.rankingValue = {};
            if (minRanking) rangeMatch.rankingValue.$gte = Number(minRanking);
            if (maxRanking) rangeMatch.rankingValue.$lte = Number(maxRanking);
        }

        if (minTuition || maxTuition) {
            rangeMatch.tuitionValue = {};
            if (minTuition) rangeMatch.tuitionValue.$gte = Number(minTuition);
            if (maxTuition) rangeMatch.tuitionValue.$lte = Number(maxTuition);
        }

        // --- направление сортировки ---
        // "hasRanking/hasTuition: -1" всегда кладёт N/A в конец,
        // независимо от направления сортировки по значению.
        const sortMap: Record<string, any> = {
            "Ranking: High to Low": { hasRanking: -1, rankingValue: 1 },
            "Ranking: Low to High": { hasRanking: -1, rankingValue: -1 },
            "Tuition: Low to High": { hasTuition: -1, tuitionValue: 1 },
            "Tuition: High to Low": { hasTuition: -1, tuitionValue: -1 },
        };
        const sort = sortMap[sortBy] || sortMap["Ranking: High to Low"];

        const pipeline: any[] = [
            { $match: baseMatch },
            addComputedFields,
            addHasFields,
        ];

        if (Object.keys(rangeMatch).length > 0) {
            pipeline.push({ $match: rangeMatch });
        }

        pipeline.push(
            { $sort: sort },
            {
                $facet: {
                    data: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                name: 1,
                                location: 1,
                                ranking: 1,
                                tuition: 1,
                                description: 1,
                            },
                        },
                    ],
                    totalCount: [{ $count: "count" }],
                },
            }
        );

        const result = await Universities.aggregate(pipeline);

        const data = result[0]?.data || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

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