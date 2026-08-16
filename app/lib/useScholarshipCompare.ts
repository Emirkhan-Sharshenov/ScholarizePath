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

export const useScholarshipCompare = create<ScholarshipCompareStore>()(
    persist(
        (set) => ({
            compareList: [],
            addToCompare: (scholarship) =>
                set((state) => {
                    const id = scholarship.id || scholarship._id;
                    if (state.compareList.some((item) => (item.id || item._id) === id)) {
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
                    compareList: state.compareList.filter((item) => (item.id || item._id) !== id),
                })),
            clearCompare: () => set({ compareList: [] }),
        }),
        {
            name: "scholarship-compare-storage",
        }
    )
);