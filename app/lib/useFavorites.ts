'use client';

import { useState, useEffect, useCallback } from 'react';

type FavoriteType = 'university' | 'scholarship';

export function useFavorites(itemId?: string, itemType?: FavoriteType) {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [favoriteUniversities, setFavoriteUniversities] = useState<string[]>([]);
    const [favoriteScholarships, setFavoriteScholarships] = useState<string[]>([]);

    const fetchUserData = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/self');
            if (!res.ok) return;

            const data = await res.json();
            if (data.success && data.user) {
                const unis = data.user.favoriteUniversities || [];
                const schol = data.user.favoriteScholarships || [];

                setFavoriteUniversities(unis);
                setFavoriteScholarships(schol);

                if (itemId && itemType) {
                    const currentList = itemType === 'university' ? unis : schol;
                    setIsFavorite(currentList.includes(itemId));
                }
            }
        } catch (error) {
            console.error('Failed to fetch user favorites:', error);
        } finally {
            setLoading(false);
        }
    }, [itemId, itemType]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const syncFavoritesWithBackend = async (unis: string[], schols: string[]) => {
        try {
            const res = await fetch('/api/auth/self', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    favoriteUniversities: unis,
                    favoriteScholarships: schols,
                }),
            });

            if (!res.ok) {
                await fetchUserData(); 
            }
        } catch (error) {
            console.error('Error syncing favorites:', error);
            await fetchUserData();
        }
    };

    const toggleFavorite = async () => {
        if (!itemId || !itemType) return;

        const nextState = !isFavorite;
        setIsFavorite(nextState);

        let updatedUnis = [...favoriteUniversities];
        let updatedSchols = [...favoriteScholarships];

        if (itemType === 'university') {
            updatedUnis = nextState
                ? [...favoriteUniversities, itemId]
                : favoriteUniversities.filter((id) => id !== itemId);
            setFavoriteUniversities(updatedUnis);
        } else {
            updatedSchols = nextState
                ? [...favoriteScholarships, itemId]
                : favoriteScholarships.filter((id) => id !== itemId);
            setFavoriteScholarships(updatedSchols);
        }

        await syncFavoritesWithBackend(updatedUnis, updatedSchols);
    };


    const removeFavorite = async (targetId: string, targetType: FavoriteType) => {
        let updatedUnis = [...favoriteUniversities];
        let updatedSchols = [...favoriteScholarships];

        if (targetType === 'university') {
            updatedUnis = favoriteUniversities.filter((id) => id !== targetId);
            setFavoriteUniversities(updatedUnis);
        } else {
            updatedSchols = favoriteScholarships.filter((id) => id !== targetId);
            setFavoriteScholarships(updatedSchols);
        }

        if (targetId === itemId) {
            setIsFavorite(false);
        }

        await syncFavoritesWithBackend(updatedUnis, updatedSchols);
    };

    return {
        isFavorite,
        toggleFavorite,
        removeFavorite,
        favoriteUniversities,
        favoriteScholarships,
        loading,
        refetch: fetchUserData,
    };
}