"use client";

import { useState, useEffect } from "react";

export function useCompare() {
    const [compareList, setCompareList] = useState<any[]>([]);
    const [scholarshipCompareList, setScholarshipCompareList] = useState<any[]>([]);

    // Инициализация при монтировании
    useEffect(() => {
        // Загрузка университетов
        const storedUnis = localStorage.getItem("compare_universities");
        if (storedUnis) {
            try {
                setCompareList(JSON.parse(storedUnis));
            } catch (e) {
                console.error("Failed to parse university compare storage", e);
            }
        }

        // Загрузка стипендий
        const storedScholarships = localStorage.getItem("compare_scholarships");
        if (storedScholarships) {
            try {
                setScholarshipCompareList(JSON.parse(storedScholarships));
            } catch (e) {
                console.error("Failed to parse scholarship compare storage", e);
            }
        }
    }, []);

    // ==================== УНИВЕРСИТЕТЫ ====================

    const addToCompare = (university: any) => {
        if (!university) return;

        setCompareList((prevList) => {
            const targetId = university.id || university._id;
            const exists = prevList.some(
                (item) => (item.id || item._id) === targetId
            );

            if (exists) return prevList;

            const updatedList = [...prevList, university];
            localStorage.setItem("compare_universities", JSON.stringify(updatedList));
            return updatedList;
        });
    };

    const removeFromCompare = (id: string) => {
        setCompareList((prevList) => {
            const updatedList = prevList.filter(
                (item) => (item.id || item._id) !== id
            );
            localStorage.setItem("compare_universities", JSON.stringify(updatedList));
            return updatedList;
        });
    };

    // ==================== СТИПЕНДИИ ====================

    const addToScholarshipCompare = (scholarship: any) => {
        if (!scholarship) return;

        setScholarshipCompareList((prevList) => {
            const targetId = scholarship.id || scholarship._id;
            const exists = prevList.some(
                (item) => (item.id || item._id) === targetId
            );

            if (exists) return prevList;

            const updatedList = [...prevList, scholarship];
            localStorage.setItem("compare_scholarships", JSON.stringify(updatedList));
            return updatedList;
        });
    };

    const removeFromScholarshipCompare = (id: string) => {
        setScholarshipCompareList((prevList) => {
            const updatedList = prevList.filter(
                (item) => (item.id || item._id) !== id
            );
            localStorage.setItem("compare_scholarships", JSON.stringify(updatedList));
            return updatedList;
        });
    };

    return {
        // Для университетов
        compareList,
        addToCompare,
        removeFromCompare,

        // Для стипендий
        scholarshipCompareList,
        addToScholarshipCompare,
        removeFromScholarshipCompare,
    };
}