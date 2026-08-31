"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Scholarship } from "@/types/scholarship";

interface ScholarshipCompareStore {
    compareList: Scholarship[];
    addToCompare: (scholarship: Scholarship) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
}

// 'id' может отсутствовать в текущем типе Scholarship (только '_id') — читаем безопасно
function getScholarshipId(scholarship: Scholarship): string | undefined {
    return (scholarship as { id?: string; _id?: string }).id ?? scholarship._id;
}

export const useScholarshipCompare = create<ScholarshipCompareStore>()(
    persist(
        (set) => ({
            compareList: [],
            addToCompare: (scholarship) =>
                set((state) => {
                    const id = getScholarshipId(scholarship);
                    if (state.compareList.some((item) => getScholarshipId(item) === id)) {
                        return state;
                    }
                    if (state.compareList.length >= 4) {
                        alert("You can compare up to 4 scholarships at a time.");
                        return state;
                    }
                    return { compareList: [...state.compareList, scholarship] };
                }),
            removeFromCompare: (id) =>
                set((state) => ({
                    compareList: state.compareList.filter((item) => getScholarshipId(item) !== id),
                })),
            clearCompare: () => set({ compareList: [] }),
        }),
        {
            name: "scholarship-compare-storage",
        }
    )
);