"use client";

import React, { useState } from "react";
import { Loader2, Trash2, GraduationCap, Award, FileDown } from "lucide-react";
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
} from "docx";
import { saveAs } from "file-saver";
import { useUniList, UniListItem } from "@/lib/useUniList";

function formatMoney(amount?: number | null, currency = "USD") {
    if (amount === undefined || amount === null) return "—";
    return `${amount.toLocaleString()} ${currency}`;
}

function kvRow(label: string, value?: string | number | null) {
    return new TableRow({
        children: [
            new TableCell({
                width: { size: 35, type: WidthType.PERCENTAGE },
                shading: { fill: "F2F4F8" },
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
            }),
            new TableCell({
                width: { size: 65, type: WidthType.PERCENTAGE },
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: value === undefined || value === null || value === "" ? "—" : String(value), size: 20 })],
                    }),
                ],
            }),
        ],
    });
}

function buildTable(rows: TableRow[]) {
    const edge = { style: BorderStyle.SINGLE, size: 1, color: "D9DCE3" };
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows,
        borders: { top: edge, bottom: edge, left: edge, right: edge, insideHorizontal: edge, insideVertical: edge },
    });
}

function universitySection(uni: any, index: number) {
    const location = uni.location
        ? [uni.location.city, uni.location.country].filter(Boolean).join(", ")
        : "—";
    const deadlines =
        (uni.applicationDeadlines || []).map((d: any) => `${d.round}: ${d.date}`).join("; ") || "—";
    const programs = (uni.programs || []).join(", ") || "—";
    const req = uni.admissionRequirements || {};

    return [
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: `${index}. ${uni.name || "Unnamed University"}` })],
        }),
        new Paragraph({
            spacing: { after: 150 },
            children: [new TextRun({ text: uni.description || "", italics: true, size: 20 })],
        }),
        buildTable([
            kvRow("Type", uni.type),
            kvRow("Location", location),
            kvRow("Global Rank", uni.ranking?.global != null ? `#${uni.ranking.global}` : "—"),
            kvRow("National Rank", uni.ranking?.national != null ? `#${uni.ranking.national}` : "—"),
            kvRow("Acceptance Rate", uni.acceptanceRate != null ? `${uni.acceptanceRate}%` : "—"),
            kvRow("Tuition (Bachelor)", formatMoney(uni.tuition?.bachelor, uni.tuition?.currency)),
            kvRow("Tuition (Master)", formatMoney(uni.tuition?.master, uni.tuition?.currency)),
            kvRow(
                "Living Cost",
                uni.livingCostUSD
                    ? `${formatMoney(uni.livingCostUSD.min)} - ${formatMoney(uni.livingCostUSD.max)} / ${uni.livingCostUSD.period || "year"}`
                    : "—"
            ),
            kvRow("Min GPA", req.gpa?.min != null ? `${req.gpa.min} / ${req.gpa.scale || 4}` : "—"),
            kvRow("Min IELTS", req.ielts?.min ?? "—"),
            kvRow("Min TOEFL", req.toefl?.min ?? "—"),
            kvRow("Programs", programs),
            kvRow("Application Deadlines", deadlines),
            kvRow("Website", uni.website),
        ]),
        new Paragraph({ text: "", spacing: { after: 200 } }),
    ];
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
            award.arrivalAllowance && "Arrival Allowance",
        ]
            .filter(Boolean)
            .join(", ") || "—";

    return [
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: `${index}. ${sch.scholarshipName || "Unnamed Scholarship"}` })],
        }),
        new Paragraph({
            spacing: { after: 150 },
            children: [new TextRun({ text: sch.description || "", italics: true, size: 20 })],
        }),
        buildTable([
            kvRow("Provider", sch.provider?.name || sch.fundingOrganization),
            kvRow("Country", sch.country),
            kvRow("Field of Study", sch.fieldOfStudy),
            kvRow("Study Level", studyLevel),
            kvRow("Award Type", award.type),
            kvRow("Coverage", coverage),
            kvRow(
                "Estimated Value",
                award.estimatedValue
                    ? `${formatMoney(award.estimatedValue.min, award.estimatedValue.currency)} - ${formatMoney(award.estimatedValue.max, award.estimatedValue.currency)}`
                    : "—"
            ),
            kvRow("Min GPA", req.gpa?.minimum ?? req.gpa?.description ?? "—"),
            kvRow("Language Requirement", req.language?.test),
            kvRow("Eligible Nationalities", req.nationality?.eligibleCountries),
            kvRow("Number of Awards", sch.numberOfAwards),
            kvRow("Status", sch.status),
            kvRow("Deadlines", deadlines),
            kvRow("Official Website", sch.officialWebsite),
        ]),
        new Paragraph({ text: "", spacing: { after: 200 } }),
    ];
}

export function DocxGenerator() {
    const { universities, scholarships, list, removeFromList, clearList } = useUniList();
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState < string | null > (null);

    const totalItems = list.length;

    async function fetchItem(item: UniListItem) {
        const endpoint =
            item.type === "university" ? `/api/universities/${item.id}` : `/api/scholarships/${item.id}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Failed to load ${item.type} ${item.id}`);
        const json = await res.json();
        // Handles both a raw object and a { success, data } wrapper
        return json?.data || json?.university || json?.scholarship || json;
    }

    async function handleGenerate() {
        if (totalItems === 0) return;
        setGenerating(true);
        setError(null);
        try {
            const uniItems = list.filter((i) => i.type === "university");
            const schItems = list.filter((i) => i.type === "scholarship");

            const [uniData, schData] = await Promise.all([
                Promise.all(uniItems.map(fetchItem)),
                Promise.all(schItems.map(fetchItem)),
            ]);

            const children: any[] = [
                new Paragraph({
                    heading: HeadingLevel.TITLE,
                    children: [new TextRun({ text: "My University & Scholarship List" })],
                }),
                new Paragraph({
                    spacing: { after: 300 },
                    children: [
                        new TextRun({
                            text: `Generated on ${new Date().toLocaleDateString()} · ${uniData.length} universities · ${schData.length} scholarships`,
                            color: "666666",
                            size: 20,
                        }),
                    ],
                }),
            ];

            if (uniData.length > 0) {
                children.push(
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 200, after: 100 },
                        children: [new TextRun({ text: "Universities" })],
                    })
                );
                uniData.forEach((uni, i) => children.push(...universitySection(uni, i + 1)));
            }

            if (schData.length > 0) {
                children.push(
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 200, after: 100 },
                        children: [new TextRun({ text: "Scholarships" })],
                    })
                );
                schData.forEach((sch, i) => children.push(...scholarshipSection(sch, i + 1)));
            }

            const doc = new Document({ sections: [{ properties: {}, children }] });
            const blob = await Packer.toBlob(doc);
            saveAs(blob, `unilist-report-${Date.now()}.docx`);
        } catch (err) {
            console.error(err);
            setError("Something went wrong while generating your report. Please try again.");
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Generate DOCX Report</h1>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-base font-bold text-gray-900">Your List</h2>
                <p className="text-xs text-gray-400 mt-0.5 mb-4">
                    Items you&apos;ve added from university and scholarship pages.
                </p>

                {totalItems === 0 ? (
                    <p className="text-sm text-gray-500 py-6 text-center">
                        Your list is empty. Add universities or scholarships using the &quot;Add to List&quot; button on their pages.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {universities.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span>Universities ({universities.length})</span>
                                </div>
                                <div className="space-y-1.5">
                                    {universities.map((item) => (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                                        >
                                            <span className="text-sm text-gray-700 truncate">{item.name}</span>
                                            <button
                                                onClick={() => removeFromList(item.id, item.type)}
                                                className="text-gray-400 hover:text-rose-500 transition-colors"
                                                aria-label="Remove"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {scholarships.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
                                    <Award className="w-3.5 h-3.5" />
                                    <span>Scholarships ({scholarships.length})</span>
                                </div>
                                <div className="space-y-1.5">
                                    {scholarships.map((item) => (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                                        >
                                            <span className="text-sm text-gray-700 truncate">{item.name}</span>
                                            <button
                                                onClick={() => removeFromList(item.id, item.type)}
                                                className="text-gray-400 hover:text-rose-500 transition-colors"
                                                aria-label="Remove"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={clearList}
                            className="text-xs font-medium text-gray-400 hover:text-rose-500 transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-gray-900">Report Options</h2>
                <p className="text-xs text-gray-500">
                    Format: <span className="font-semibold text-gray-700">DOCX</span> — includes full details for every item in your list.
                </p>

                {error && <p className="text-xs text-rose-500">{error}</p>}

                <button
                    onClick={handleGenerate}
                    disabled={totalItems === 0 || generating}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm text-sm"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <FileDown className="w-4 h-4" />
                            <span>Generate &amp; Download DOCX{totalItems > 0 ? ` (${totalItems})` : ""}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}