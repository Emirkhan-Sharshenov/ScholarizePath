"use client";

import { useState, useEffect } from "react";

export function useCompare() {
    const [compareList, setCompareList] = useState<any[]>([]);

    // Инициализация при монтировании
    useEffect(() => {
        const stored = localStorage.getItem("compare_universities");
        if (stored) {
            try {
                setCompareList(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse compare storage", e);
            }
        }
    }, []);

    // Добавление университета
    const addToCompare = (university: any) => {
        if (!university) return;

        setCompareList((prevList) => {
            const targetId = university.id || university._id;

            // Проверяем, есть ли уже этот университет в массиве
            const exists = prevList.some(
                (item) => (item.id || item._id) === targetId
            );

            // Если уже есть — оставляем список без изменений
            if (exists) return prevList;

            // Если нет — создаем новый массив
            const updatedList = [...prevList, university];
            localStorage.setItem("compare_universities", JSON.stringify(updatedList));
            return updatedList;
        });
    };

    // Удаление университета
    const removeFromCompare = (id: string) => {
        setCompareList((prevList) => {
            const updatedList = prevList.filter(
                (item) => (item.id || item._id) !== id
            );
            localStorage.setItem("compare_universities", JSON.stringify(updatedList));
            return updatedList;
        });
    };

    return { compareList, addToCompare, removeFromCompare };
}