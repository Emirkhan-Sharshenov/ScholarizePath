'use client';

import React, { useEffect, useState } from 'react';
import { Section } from '@/components/favourites/Section';
import { CardData } from '@/components/favourites/FavoriteCard';
import { useFavorites } from '@/lib/useFavorites';
import { Loader2 } from 'lucide-react';

export default function FavoritesPage() {
    const { removeFavorite, loading: hookLoading } = useFavorites();
    const [savedUniversities, setSavedUniversities] = useState<CardData[]>([]);
    const [savedScholarships, setSavedScholarships] = useState<CardData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchFavoritesData() {
            try {
                const selfRes = await fetch('/api/auth/self');

                if (selfRes.status === 401) {
                    window.location.href = '/login';
                    return;
                }

                if (!selfRes.ok) {
                    throw new Error(`Failed to fetch self: ${selfRes.status}`);
                }

                const selfData = await selfRes.json();
                if (!selfData.success || !selfData.user) return;

                const uniIds: string[] = selfData.user.favoriteUniversities || [];
                const scholarshipIds: string[] = selfData.user.favoriteScholarships || [];

                const uniPromises = uniIds.map(async (id) => {
                    try {
                        const res = await fetch(`/api/universities/${id}`);
                        if (!res.ok) return null;
                        const data = await res.json();
                        const uni = data.university || data;
                        return {
                            id: uni._id || uni.id,
                            title: uni.name,
                            location: uni.location
                                ? `${uni.location.city || ''}, ${uni.location.country || ''}`
                                : 'Unknown Location',
                        } as CardData;
                    } catch {
                        return null;
                    }
                });

                const schPromises = scholarshipIds.map(async (id) => {
                    try {
                        const res = await fetch(`/api/scholarships/${id}`);
                        if (!res.ok) return null;
                        const data = await res.json();
                        const sch = data.scholarship || data;
                        return {
                            id: sch._id || sch.id,
                            title: sch.scholarshipName || sch.title,
                            subtitle: sch.provider?.name || sch.fundingOrganization,
                        } as CardData;
                    } catch {
                        return null;
                    }
                });

                const fetchedUnis = (await Promise.all(uniPromises)).filter(Boolean) as CardData[];
                const fetchedScholarships = (await Promise.all(schPromises)).filter(Boolean) as CardData[];

                setSavedUniversities(fetchedUnis);
                setSavedScholarships(fetchedScholarships);
            } catch (err) {
                console.error('Error loading favorites page:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchFavoritesData();
    }, []);

    const handleRemove = async (id: string, type: 'university' | 'scholarship') => {
        await removeFavorite(id, type);

        if (type === 'university') {
            setSavedUniversities((prev) => prev.filter((item) => item.id !== id));
        } else {
            setSavedScholarships((prev) => prev.filter((item) => item.id !== id));
        }
    };

    if (loading || hookLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[rgb(246,247,251)] p-8 font-sans">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Favorites</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        A consolidated view of all your saved opportunities.
                    </p>
                </div>

                <Section
                    title="Saved Universities"
                    type="university"
                    items={savedUniversities}
                    onRemove={(id) => handleRemove(id, 'university')}
                />
                <Section
                    title="Saved Scholarships"
                    type="scholarship"
                    items={savedScholarships}
                    onRemove={(id) => handleRemove(id, 'scholarship')}
                />
            </div>
        </main>
    );
}