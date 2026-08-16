"use client";

import React from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";

interface Props {
    universityId: string;
}

export const ActionCell: React.FC<Props> = ({ universityId }) => {
    return (
        <td className="p-6 align-bottom">
            <div className="flex flex-col gap-3">
                <button className="inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <Bookmark className="h-4 w-4" />
                    Save Comparison
                </button>
                <Link
                    href={`/universities/${universityId}`}
                    className="inline-flex items-center justify-center rounded-xl bg-[rgb(2,76,209)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                    Apply Now
                </Link>
            </div>
        </td>
    );
};