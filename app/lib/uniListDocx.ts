import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    ShadingType,
    AlignmentType,
    Footer,
    PageNumber,
    TableLayoutType,
} from "docx";

// ---- Document design tokens ------------------------------------------
// A4 page, 1" top/bottom margins, 0.75" side margins.
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const MARGIN_TOP = 1440;
const MARGIN_BOTTOM = 1440;
const MARGIN_SIDE = 1080;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_SIDE * 2; // 9746
const LABEL_COL_WIDTH = 3410;
const VALUE_COL_WIDTH = CONTENT_WIDTH - LABEL_COL_WIDTH; // 6336

const NAVY = "1F3A5F";
const GOLD = "B08D57";
const INK = "232323";
const MUTED = "5B6B82";
const RULE = "C9D3E0";
const LABEL_BG = "EDF1F7";

function formatMoney(amount?: number | null, currency = "USD") {
    if (amount === undefined || amount === null) return "—";
    return `${amount.toLocaleString()} ${currency}`;
}

function kvRow(label: string, value?: string | number | null) {
    const display = value === undefined || value === null || value === "" ? "—" : String(value);
    return new TableRow({
        children: [
            new TableCell({
                width: { size: LABEL_COL_WIDTH, type: WidthType.DXA },
                shading: { fill: LABEL_BG, type: ShadingType.CLEAR, color: "auto" },
                margins: { top: 100, bottom: 100, left: 150, right: 150 },
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: label, bold: true, size: 19, color: NAVY, font: "Calibri" })],
                    }),
                ],
            }),
            new TableCell({
                width: { size: VALUE_COL_WIDTH, type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 150, right: 150 },
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: display, size: 19, color: INK, font: "Calibri" })],
                    }),
                ],
            }),
        ],
    });
}

function buildTable(rows: TableRow[]) {
    const edge = { style: BorderStyle.SINGLE, size: 3, color: RULE };
    return new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [LABEL_COL_WIDTH, VALUE_COL_WIDTH],
        // FIXED stops mobile viewers (Google Docs, WPS, some Word builds) from
        // re-flowing column widths to fit content, which is what squeezes the
        // label column down to near-zero and forces text to wrap vertically.
        layout: TableLayoutType.FIXED,
        rows,
        borders: {
            top: edge,
            bottom: edge,
            left: edge,
            right: edge,
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: RULE },
            insideVertical: edge,
        },
    });
}

// Thin rule used to separate entries — a paragraph border, never a table.
function divider() {
    return new Paragraph({
        spacing: { before: 120, after: 300 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 1 } },
        children: [],
    });
}

function itemHeading(index: number, name: string) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 100 },
        children: [
            new TextRun({ text: `${index}. `, bold: true, color: GOLD, font: "Georgia", size: 26 }),
            new TextRun({ text: name, bold: true, color: INK, font: "Georgia", size: 26 }),
        ],
    });
}

function sectionHeading(text: string) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 260 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 8 } },
        children: [new TextRun({ text, font: "Georgia", bold: true, size: 32, color: NAVY })],
    });
}

function titleBlock(uniCount: number, schCount: number) {
    return [
        new Paragraph({
            heading: HeadingLevel.TITLE,
            spacing: { after: 80 },
            children: [new TextRun({ text: "University & Scholarship List", font: "Georgia", bold: true, size: 52, color: NAVY })],
        }),
        new Paragraph({
            spacing: { after: 260 },
            children: [
                new TextRun({
                    text: "A summary of the programs and awards you're comparing.",
                    font: "Calibri",
                    size: 22,
                    color: MUTED,
                }),
            ],
        }),
        new Paragraph({
            spacing: { after: 400 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 6 } },
            children: [
                new TextRun({
                    text: `Generated ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}   ·   ${uniCount} ${uniCount === 1 ? "university" : "universities"}   ·   ${schCount} ${schCount === 1 ? "scholarship" : "scholarships"}`,
                    font: "Calibri",
                    size: 19,
                    color: MUTED,
                }),
            ],
        }),
    ];
}

function universitySection(uni: any, index: number) {
    const location = uni.location
        ? [uni.location.city, uni.location.country].filter(Boolean).join(", ")
        : "—";
    const deadlines =
        (uni.applicationDeadlines || []).map((d: any) => `${d.round}: ${d.date}`).join("; ") || "—";
    const programs = (uni.programs || []).join(", ") || "—";
    const req = uni.admissionRequirements || {};

    const nodes: any[] = [itemHeading(index, uni.name || "Unnamed University")];

    if (uni.description) {
        nodes.push(
            new Paragraph({
                spacing: { after: 180 },
                children: [new TextRun({ text: uni.description, italics: true, size: 20, color: MUTED, font: "Calibri" })],
            })
        );
    }

    nodes.push(
        buildTable([
            kvRow("Type", uni.type),
            kvRow("Location", location),
            kvRow("Global rank", uni.ranking?.global != null ? `#${uni.ranking.global}` : "—"),
            kvRow("National rank", uni.ranking?.national != null ? `#${uni.ranking.national}` : "—"),
            kvRow("Acceptance rate", uni.acceptanceRate != null ? `${uni.acceptanceRate}%` : "—"),
            kvRow("Tuition (bachelor)", formatMoney(uni.tuition?.bachelor, uni.tuition?.currency)),
            kvRow("Tuition (master)", formatMoney(uni.tuition?.master, uni.tuition?.currency)),
            kvRow(
                "Living cost",
                uni.livingCostUSD
                    ? `${formatMoney(uni.livingCostUSD.min)} - ${formatMoney(uni.livingCostUSD.max)} / ${uni.livingCostUSD.period || "year"}`
                    : "—"
            ),
            kvRow("Min GPA", req.gpa?.min != null ? `${req.gpa.min} / ${req.gpa.scale || 4}` : "—"),
            kvRow("Min IELTS", req.ielts?.min ?? "—"),
            kvRow("Min TOEFL", req.toefl?.min ?? "—"),
            kvRow("Programs", programs),
            kvRow("Application deadlines", deadlines),
            kvRow("Website", uni.website),
        ])
    );

    nodes.push(divider());
    return nodes;
}

function scholarshipSection(sch: any, index: number) {
    const studyLevel = (sch.studyLevel || []).join(", ") || "—";
    const deadlines = (sch.deadlines || []).map((d: any) => `${d.name}: ${d.date}`).join("; ") || "—";
    const award = sch.award || {};
    const req = sch.requirements || {};
    const coverage =
        [
            award.tuition && "Tuition",
            award.stipend && "Stipend",
            award.travel && "Travel",
            award.insurance && "Insurance",
            award.arrivalAllowance && "Arrival allowance",
        ]
            .filter(Boolean)
            .join(", ") || "—";

    const nodes: any[] = [itemHeading(index, sch.scholarshipName || "Unnamed Scholarship")];

    if (sch.description) {
        nodes.push(
            new Paragraph({
                spacing: { after: 180 },
                children: [new TextRun({ text: sch.description, italics: true, size: 20, color: MUTED, font: "Calibri" })],
            })
        );
    }

    nodes.push(
        buildTable([
            kvRow("Provider", sch.provider?.name || sch.fundingOrganization),
            kvRow("Country", sch.country),
            kvRow("Field of study", sch.fieldOfStudy),
            kvRow("Study level", studyLevel),
            kvRow("Award type", award.type),
            kvRow("Coverage", coverage),
            kvRow(
                "Estimated value",
                award.estimatedValue
                    ? `${formatMoney(award.estimatedValue.min, award.estimatedValue.currency)} - ${formatMoney(award.estimatedValue.max, award.estimatedValue.currency)}`
                    : "—"
            ),
            kvRow("Min GPA", req.gpa?.minimum ?? req.gpa?.description ?? "—"),
            kvRow("Language requirement", req.language?.test),
            kvRow("Eligible nationalities", req.nationality?.eligibleCountries),
            kvRow("Number of awards", sch.numberOfAwards),
            kvRow("Status", sch.status),
            kvRow("Deadlines", deadlines),
            kvRow("Official website", sch.officialWebsite),
        ])
    );

    nodes.push(divider());
    return nodes;
}

/**
 * Builds the full "My University & Scholarship List" report as a Buffer,
 * ready to be sent as an HTTP response with a .docx Content-Type.
 *
 * This runs server-side (Node runtime) so the client never has to hold
 * the `docx` library or a Blob in memory — the browser just downloads a
 * normal file over the network, which is what makes mobile downloads and
 * previews reliable.
 */
export async function buildUniListDocxBuffer(universities: any[], scholarships: any[]): Promise<Buffer> {
    const children: any[] = [...titleBlock(universities.length, scholarships.length)];

    if (universities.length > 0) {
        children.push(sectionHeading("Universities"));
        universities.forEach((uni, i) => children.push(...universitySection(uni, i + 1)));
    }

    if (scholarships.length > 0) {
        children.push(sectionHeading("Scholarships"));
        scholarships.forEach((sch, i) => children.push(...scholarshipSection(sch, i + 1)));
    }

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: { font: "Calibri", size: 22, color: INK },
                },
            },
        },
        sections: [
            {
                properties: {
                    page: {
                        size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
                        margin: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_SIDE, right: MARGIN_SIDE },
                    },
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        children: [PageNumber.CURRENT],
                                        font: "Calibri",
                                        size: 17,
                                        color: MUTED,
                                    }),
                                ],
                            }),
                        ],
                    }),
                },
                children,
            },
        ],
    });

    return Packer.toBuffer(doc);
}