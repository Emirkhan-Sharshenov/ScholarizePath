"use client";

import { useCallback, useEffect, useState } from "react";

export type UniListItemType = "university" | "scholarship";

export interface UniListItem {
    id: string;
    type: UniListItemType;
    name: string;
    addedAt: string;
}

const STORAGE_KEY = "unilist:docx-list";
const EVENT_NAME = "unilist:changed";

function readList(): UniListItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeList(list: UniListItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT_NAME));
}

export function useUniList() {
    const [list, setList] = useState<UniListItem[]>([]);

    useEffect(() => {
        setList(readList());
        const handler = () => setList(readList());
        window.addEventListener(EVENT_NAME, handler);
        window.addEventListener("storage", handler);
        return () => {
            window.removeEventListener(EVENT_NAME, handler);
            window.removeEventListener("storage", handler);
        };
    }, []);

    const isInList = useCallback(
        (id: string, type: UniListItemType) =>
            list.some((item) => item.id === id && item.type === type),
        [list]
    );

    const addToList = useCallback((id: string, type: UniListItemType, name: string) => {
        const current = readList();
        if (current.some((item) => item.id === id && item.type === type)) return;
        const next = [...current, { id, type, name, addedAt: new Date().toISOString() }];
        writeList(next);
        setList(next);
    }, []);

    const removeFromList = useCallback((id: string, type: UniListItemType) => {
        const current = readList();
        const next = current.filter((item) => !(item.id === id && item.type === type));
        writeList(next);
        setList(next);
    }, []);

    const toggleInList = useCallback(
        (id: string, type: UniListItemType, name: string) => {
            if (isInList(id, type)) removeFromList(id, type);
            else addToList(id, type, name);
        },
        [isInList, addToList, removeFromList]
    );

    const clearList = useCallback(() => {
        writeList([]);
        setList([]);
    }, []);

    return {
        list,
        universities: list.filter((i) => i.type === "university"),
        scholarships: list.filter((i) => i.type === "scholarship"),
        isInList,
        addToList,
        removeFromList,
        toggleInList,
        clearList,
    };
}