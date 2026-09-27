import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Scholarship from "@/models/Scholarship";

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "5", 10)));
        const search = searchParams.get("search")?.trim() || "";
        const country = searchParams.get("country") || "";
        const studyLevel = searchParams.get("studyLevel") || "";
        const fieldOfStudy = searchParams.get("fieldOfStudy") || "";
        const minAmount = searchParams.get("minAmount");
        const maxDeadline = searchParams.get("maxDeadline");
        const sortBy = searchParams.get("sortBy") || "Deadline (Earliest)";

        const match: any = {};

        if (search) {
            match.$or = [
                { scholarshipName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { searchKeywords: { $regex: search, $options: "i" } },
            ];
        }

        if (country && country !== "All Countries") {
            match.country = country;
        }

        if (studyLevel && studyLevel !== "All Study Levels") {
            match.studyLevel = studyLevel;
        }

        if (fieldOfStudy && fieldOfStudy !== "All Fields") {
            match.fieldOfStudy = { $regex: fieldOfStudy, $options: "i" };
        }

        if (minAmount) {
            match.$or = match.$or || [];
           
        }

     
        // Start of today (UTC): a deadline dated today still counts as open, matching the cards.
        const now = new Date(new Date().toISOString().slice(0, 10));
        const pipeline: any[] = [
            { $match: match },
            {
                // Exact deadline dates only: "Application Opens" entries aren't
                // deadlines, and free-text estimates ("varies, typically Jan 2027")
                // fail the conversion and are dropped.
                $addFields: {
                    _dates: {
                        $filter: {
                            input: {
                                $map: {
                                    input: {
                                        $filter: {
                                            input: { $ifNull: ["$deadlines", []] },
                                            as: "d",
                                            cond: { $not: [{ $regexMatch: { input: { $toString: { $ifNull: ["$$d.name", ""] } }, regex: "open", options: "i" } }] },
                                        },
                                    },
                                    as: "d",
                                    in: { $convert: { input: "$$d.date", to: "date", onError: null, onNull: null } },
                                },
                            },
                            as: "x",
                            cond: { $ne: ["$$x", null] },
                        },
                    },
                },
            },
            {
                $addFields: {
                    _nextDeadline: { $min: { $filter: { input: "$_dates", as: "x", cond: { $gte: ["$$x", now] } } } },
                    _lastDeadline: { $max: "$_dates" },
                },
            },
            {
                $addFields: {
                    // Upcoming deadline if there is one, otherwise the most recent past one.
                    _deadlineDate: { $ifNull: ["$_nextDeadline", "$_lastDeadline"] },
                    _amount: {
                        $ifNull: [
                            "$award.estimatedValue.max",
                            { $ifNull: ["$award.estimatedValue.min", "$award.amount"] },
                        ],
                    },
                },
            },
        ];

        if (minAmount) {
            pipeline.push({ $match: { _amount: { $gte: Number(minAmount) } } });
        }

        if (maxDeadline) {
            const deadlineTs = new Date(maxDeadline);
            if (!isNaN(deadlineTs.getTime())) {
                pipeline.push({ $match: { _deadlineDate: { $lte: deadlineTs } } });
            }
        }

        // Deadline sorts: open scholarships first, then closed ones, then those
        // without an exact date (MongoDB would otherwise put nulls first ascending).
        pipeline.push({
            $addFields: {
                _deadlineGroup: {
                    $cond: [{ $ne: ["$_nextDeadline", null] }, 0, { $cond: [{ $ne: ["$_lastDeadline", null] }, 1, 2] }],
                },
            },
        });

        const sortMap: Record<string, any> = {
            "Deadline (Earliest)": { _deadlineGroup: 1, _deadlineDate: 1 },
            "Deadline (Latest)": { _deadlineGroup: 1, _deadlineDate: -1 },
            "Amount (Highest)": { _amount: -1 },
            "Amount (Lowest)": { _amount: 1 },
        };
        pipeline.push({ $sort: sortMap[sortBy] || { _deadlineDate: 1 } });

        pipeline.push({
            $project: {
                scholarshipName: 1,
                description: 1,
                details: 1,
                award: 1,
                amount: 1,
                deadlines: 1,
                country: 1,
                studyLevel: 1,
                provider: 1,
            },
        });

        pipeline.push({
            $facet: {
                data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
                totalCount: [{ $count: "count" }],
            },
        });

        const result = await Scholarship.aggregate(pipeline);

        const data = result[0]?.data || [];
        const totalCount = result[0]?.totalCount?.[0]?.count || 0;

        return NextResponse.json({
            data,
            totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (error) {
        console.error("Scholarships API error:", error);
        return NextResponse.json(
            { message: "Failed to fetch scholarships" },
            { status: 500 }
        );
    }
}