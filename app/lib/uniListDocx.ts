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
import type { Messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { localizeCountry, localizeLocation } from "@/i18n/countries";

type Labels = Messages["unilist"]["docx"];

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

function formatMoney(amount: number | null | undefined, currency = "USD", intlLocale = "en-US") {
    if (amount === undefined || amount === null) return "—";
    return `${amount.toLocaleString(intlLocale)} ${currency}`;
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

function titleBlock(uniCount: number, schCount: number, l: Labels, intlLocale: string) {
    return [
        new Paragraph({
            heading: HeadingLevel.TITLE,
            spacing: { after: 80 },
            children: [new TextRun({ text: l.title, font: "Georgia", bold: true, size: 52, color: NAVY })],
        }),
        new Paragraph({
            spacing: { after: 260 },
            children: [
                new TextRun({
                    text: l.subtitle,
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
                    text: l.generated(new Date().toLocaleDateString(intlLocale, { year: "numeric", month: "long", day: "numeric" }), uniCount, schCount),
                    font: "Calibri",
                    size: 19,
                    color: MUTED,
                }),
            ],
        }),
    ];
}

function universitySection(uni: any, index: number, l: Labels, locale: Locale, intlLocale: string) {
    const money = (amount?: number | null, currency?: string) => formatMoney(amount, currency, intlLocale);
    const location = uni.location
        ? localizeLocation([uni.location.city, uni.location.country].filter(Boolean).join(", "), locale)
        : "—";
    const deadlines =
        (uni.applicationDeadlines || []).map((d: any) => `${d.round}: ${d.date}`).join("; ") || "—";
    const programs = (uni.programs || []).join(", ") || "—";
    const req = uni.admissionRequirements || {};

    const nodes: any[] = [itemHeading(index, uni.name || l.unnamedUniversity)];

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
            kvRow(l.type, uni.type),
            kvRow(l.location, location),
            kvRow(l.globalRank, uni.ranking?.global != null ? `#${uni.ranking.global}` : "—"),
            kvRow(l.nationalRank, uni.ranking?.national != null ? `#${uni.ranking.national}` : "—"),
            kvRow(l.acceptance, uni.acceptanceRate != null ? `${uni.acceptanceRate}%` : "—"),
            kvRow(l.tuitionBachelor, money(uni.tuition?.bachelor, uni.tuition?.currency)),
            kvRow(l.tuitionMaster, money(uni.tuition?.master, uni.tuition?.currency)),
            kvRow(
                l.livingCost,
                uni.livingCostUSD
                    ? `${money(uni.livingCostUSD.min)} - ${money(uni.livingCostUSD.max)} / ${uni.livingCostUSD.period && locale === "en" ? uni.livingCostUSD.period : l.year}`
                    : "—"
            ),
            kvRow(l.minGpa, req.gpa?.min != null ? `${req.gpa.min} / ${req.gpa.scale || 4}` : "—"),
            kvRow(l.minIelts, req.ielts?.min ?? "—"),
            kvRow(l.minToefl, req.toefl?.min ?? "—"),
            kvRow(l.programs, programs),
            kvRow(l.deadlines, deadlines),
            kvRow(l.website, uni.website),
        ])
    );

    nodes.push(divider());
    return nodes;
}

function scholarshipSection(sch: any, index: number, l: Labels, locale: Locale, intlLocale: string) {
    const money = (amount?: number | null, currency?: string) => formatMoney(amount, currency, intlLocale);
    const studyLevel = (sch.studyLevel || []).join(", ") || "—";
    const deadlines = (sch.deadlines || []).map((d: any) => `${d.name}: ${d.date}`).join("; ") || "—";
    const award = sch.award || {};
    const req = sch.requirements || {};
    const coverage =
        [
            award.tuition && l.coverageItems.tuition,
            award.stipend && l.coverageItems.stipend,
            award.travel && l.coverageItems.travel,
            award.insurance && l.coverageItems.insurance,
            award.arrivalAllowance && l.coverageItems.arrivalAllowance,
        ]
            .filter(Boolean)
            .join(", ") || "—";

    const nodes: any[] = [itemHeading(index, sch.scholarshipName || l.unnamedScholarship)];

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
            kvRow(l.provider, sch.provider?.name || sch.fundingOrganization),
            kvRow(l.country, sch.country ? localizeCountry(sch.country, locale) : sch.country),
            kvRow(l.field, sch.fieldOfStudy),
            kvRow(l.studyLevel, studyLevel),
            kvRow(l.awardType, award.type),
            kvRow(l.coverage, coverage),
            kvRow(
                l.estimatedValue,
                award.estimatedValue
                    ? `${money(award.estimatedValue.min, award.estimatedValue.currency)} - ${money(award.estimatedValue.max, award.estimatedValue.currency)}`
                    : "—"
            ),
            kvRow(l.minGpa, req.gpa?.minimum ?? req.gpa?.description ?? "—"),
            kvRow(l.language, req.language?.test),
            kvRow(l.nationalities, req.nationality?.eligibleCountries),
            kvRow(l.awards, sch.numberOfAwards),
            kvRow(l.status, sch.status),
            kvRow(l.scholarshipDeadlines, deadlines),
            kvRow(l.officialWebsite, sch.officialWebsite),
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
export async function buildUniListDocxBuffer(
    universities: any[],
    scholarships: any[],
    labels: Labels,
    locale: Locale,
    intlLocale: string,
): Promise<Buffer> {
    const children: any[] = [...titleBlock(universities.length, scholarships.length, labels, intlLocale)];

    if (universities.length > 0) {
        children.push(sectionHeading(labels.universities));
        universities.forEach((uni, i) => children.push(...universitySection(uni, i + 1, labels, locale, intlLocale)));
    }

    if (scholarships.length > 0) {
        children.push(sectionHeading(labels.scholarships));
        scholarships.forEach((sch, i) => children.push(...scholarshipSection(sch, i + 1, labels, locale, intlLocale)));
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