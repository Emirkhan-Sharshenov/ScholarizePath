"use client";

import React from "react";
import { Heart } from "lucide-react";
import { UniversityComparisonData } from "@/types/compare";

interface Props {
    university: UniversityComparisonData;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
}

export const UniversityHeaderCell: React.FC<Props> = ({
    university,
    isFavorite,
    onToggleFavorite,
}) => {
    return (
        <th className="w-1/4 p-6 align-top">
            <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 p-2">
                        <img
                            src={university.logo}
                            alt={university.name}
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {university.name}
                    </h3>
                </div>
            </div>
        </th>
    );
};