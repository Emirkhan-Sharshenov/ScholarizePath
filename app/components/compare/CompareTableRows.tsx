"use client";

import React from "react";

interface CompareTableRowsProps {
    items: any[];
    type: "universities" | "scholarships";
}


function safeRender(value: any): string {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") {
        return value.name || value.title || value.type || JSON.stringify(value);
    }
    return String(value);
}

function MetricRow({ label, items, field }: { label: string; items: any[]; field: string }) {
    return (
        <tr>
            <td className="p-4 text-xs font-semibold text-slate-500 bg-slate-50/30">{label}</td>
            {items.map((item) => (
                <td key={item.id} className="p-4 text-slate-700">
                    {safeRender(item[field])}
                </td>
            ))}
        </tr>
    );
}

export function CompareTableRows({ items, type }: CompareTableRowsProps) {
    if (type === "universities") {
        return (
            <>
                <MetricRow label="Country / Location" items={items} field="country" />
                <MetricRow label="World Ranking" items={items} field="ranking" />
                <MetricRow label="Tuition Fee" items={items} field="tuition" />
                <MetricRow label="Acceptance Rate" items={items} field="acceptanceRate" />
            </>
        );
    }

    return (
        <>
            <MetricRow label="Provider / Organization" items={items} field="provider" />
            <MetricRow label="Funding Amount / Type" items={items} field="amount" />
            <MetricRow label="Degree Level" items={items} field="degree" />
            <MetricRow label="Target Country" items={items} field="country" />
            <MetricRow label="Application Deadline" items={items} field="deadline" />
        </>
    );
}