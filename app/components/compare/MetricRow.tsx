"use client";

import React from "react";
import { CheckCircle2, XCircle, LucideIcon } from "lucide-react";

interface Props {
    label: string;
    items: Array<{
        id: string;
        value: string;
        status?: "good" | "strict";
    }>;
    customIcon?: LucideIcon;
}

export const MetricRow: React.FC<Props> = ({
    label,
    items,
    customIcon: CustomIcon,
}) => {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="p-6 font-semibold text-gray-900">{label}</td>
            {items.map((item) => (
                <td key={item.id} className="p-6">
                    <div className="flex items-center gap-2">
                        {CustomIcon ? (
                            <CustomIcon className="h-5 w-5 text-gray-400 shrink-0" />
                        ) : item.status === "strict" ? (
                            <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        )}
                        <span
                            className={
                                !item.status && !CustomIcon
                                    ? "font-semibold text-gray-900"
                                    : "text-gray-700"
                            }
                        >
                            {item.value}
                        </span>
                    </div>
                </td>
            ))}
        </tr>
    );
};