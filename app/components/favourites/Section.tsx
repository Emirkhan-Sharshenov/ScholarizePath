'use client';

import React from 'react';
import { FavoriteCard, CardData } from './FavoriteCard';

interface SectionProps {
    title: string;
    items: CardData[];
    type: 'university' | 'scholarship';
    onRemove: (id: string) => void;
}

export function Section({ title, items, type, onRemove }: SectionProps) {
    if (items.length === 0) {
        return (
            <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                    No items saved yet.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <FavoriteCard
                        key={item.id}
                        item={item}
                        type={type}
                        onRemoveSuccess={(id) => onRemove(id)}
                    />
                ))}
            </div>
        </div>
    );
}