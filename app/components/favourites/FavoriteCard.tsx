'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ExternalLink } from 'lucide-react';
import { useFavorites } from '@/lib/useFavorites';

export interface CardData {
    id: string;
    title: string;
    location?: string;
    subtitle?: string;
}

interface FavoriteCardProps {
    item: CardData;
    type: 'university' | 'scholarship';
    onRemoveSuccess?: (id: string) => void;
}

export function FavoriteCard({ item, type, onRemoveSuccess }: FavoriteCardProps) {
    const { isFavorite, toggleFavorite } = useFavorites(item.id, type);

    const handleHeartClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        await toggleFavorite();

        if (onRemoveSuccess) {
            onRemoveSuccess(item.id);
        }
    };

    const detailsUrl = type === 'university'
        ? `/universities/${item.id}`
        : `/scholarships/${item.id}`;

    return (
        <div className="relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div>
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 leading-snug">{item.title}</h3>
                    <button
                        onClick={handleHeartClick}
                        type="button"
                        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition shrink-0"
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Heart
                            className={`h-5 w-5 transition-colors ${isFavorite
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-gray-400 hover:text-red-500'
                                }`}
                        />
                    </button>
                </div>
                {item.location && (
                    <p className="mt-1 text-sm text-gray-500">{item.location}</p>
                )}
                {item.subtitle && (
                    <p className="mt-1 text-sm text-gray-500">{item.subtitle}</p>
                )}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100">
                <Link
                    href={detailsUrl}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                    View details
                    <ExternalLink className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}