'use client';

import { useState, useEffect, useCallback } from 'react';

type FavoriteType = 'university' | 'scholarship';

export function useFavorites(itemId?: string, itemType?: FavoriteType) {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [favoriteUniversities, setFavoriteUniversities] = useState<string[]>([]);
    const [favoriteScholarships, setFavoriteScholarships] = useState<string[]>([]);

    // 1. Загрузка избранного пользователя
    const fetchUserData = useCallback(async () => {
        if (!itemId && !itemType) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/self', { cache: 'no-store' });
            if (!res.ok) {
                console.warn(`[useFavorites] GET /api/auth/self status: ${res.status}`);
                return;
            }

            const data = await res.json();
            if (data.success && data.user) {
                // Приводим все ID к строкам для надежного сравнения
                const unis: string[] = (data.user.favoriteUniversities || []).map((id: any) => String(id));
                const schol: string[] = (data.user.favoriteScholarships || []).map((id: any) => String(id));

                setFavoriteUniversities(unis);
                setFavoriteScholarships(schol);

                if (itemId && itemType) {
                    const targetId = String(itemId);
                    const currentList = itemType === 'university' ? unis : schol;
                    setIsFavorite(currentList.includes(targetId));
                }
            }
        } catch (error) {
            console.error('[useFavorites] Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    }, [itemId, itemType]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // 2. Синхронизация с сервером (PUT)
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
                console.error(`[useFavorites] PUT sync failed with status ${res.status}`);
                await fetchUserData(); // Откатываем UI на данные с сервера при ошибке
            }
        } catch (error) {
            console.error('[useFavorites] Network error syncing favorites:', error);
            await fetchUserData();
        }
    };

    // 3. Переключатель (Toggle)
    const toggleFavorite = async () => {
        if (!itemId || !itemType) {
            console.error('[useFavorites] Cannot toggle: missing itemId or itemType', { itemId, itemType });
            return;
        }

        const targetId = String(itemId);
        const nextState = !isFavorite;

        // Мгновенно обновляем UI
        setIsFavorite(nextState);

        let updatedUnis = [...favoriteUniversities];
        let updatedSchols = [...favoriteScholarships];

        if (itemType === 'university') {
            updatedUnis = nextState
                ? Array.from(new Set([...favoriteUniversities, targetId]))
                : favoriteUniversities.filter((id) => id !== targetId);
            setFavoriteUniversities(updatedUnis);
        } else {
            updatedSchols = nextState
                ? Array.from(new Set([...favoriteScholarships, targetId]))
                : favoriteScholarships.filter((id) => id !== targetId);
            setFavoriteScholarships(updatedSchols);
        }

        await syncFavoritesWithBackend(updatedUnis, updatedSchols);
    };

    // 4. Явное удаление (Remove)
    const removeFavorite = async (targetId: string, targetType: FavoriteType) => {
        const idStr = String(targetId);
        let updatedUnis = [...favoriteUniversities];
        let updatedSchols = [...favoriteScholarships];

        if (targetType === 'university') {
            updatedUnis = favoriteUniversities.filter((id) => id !== idStr);
            setFavoriteUniversities(updatedUnis);
        } else {
            updatedSchols = favoriteScholarships.filter((id) => id !== idStr);
            setFavoriteScholarships(updatedSchols);
        }

        if (idStr === String(itemId)) {
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