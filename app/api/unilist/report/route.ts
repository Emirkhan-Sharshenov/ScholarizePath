import { NextRequest, NextResponse } from "next/server";
import { buildUniListDocxBuffer } from "@/lib/uniListDocx";

export const runtime = "nodejs";

const DOCX_MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type ListItem = { id: string; type: "university" | "scholarship" };

function parseItems(raw: string | null): ListItem[] {
    if (!raw) return [];
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return [];
    }
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
        (i): i is ListItem =>
            !!i &&
            typeof i === "object" &&
            typeof (i as any).id === "string" &&
            ((i as any).type === "university" || (i as any).type === "scholarship")
    );
}

export async function GET(req: NextRequest) {
    const list = parseItems(req.nextUrl.searchParams.get("items"));

    if (list.length === 0) {
        return NextResponse.json({ error: "No items to include in the report." }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const cookie = req.headers.get("cookie") ?? "";

    async function fetchItem(item: ListItem) {
        const endpoint =
            item.type === "university" ? `/api/universities/${item.id}` : `/api/scholarships/${item.id}`;
        const res = await fetch(`${origin}${endpoint}`, {
            headers: { cookie },
            cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to load ${item.type} ${item.id}`);
        const json = await res.json();
        return json?.data || json?.university || json?.scholarship || json;
    }

    try {
        const uniItems = list.filter((i) => i.type === "university");
        const schItems = list.filter((i) => i.type === "scholarship");

        const [universities, scholarships] = await Promise.all([
            Promise.all(uniItems.map(fetchItem)),
            Promise.all(schItems.map(fetchItem)),
        ]);

        const buffer = await buildUniListDocxBuffer(universities, scholarships);
        const filename = `unilist-report-${Date.now()}.docx`;

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": DOCX_MIME,
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": String(buffer.length),
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Something went wrong while generating your report. Please try again." },
            { status: 500 }
        );
    }
}