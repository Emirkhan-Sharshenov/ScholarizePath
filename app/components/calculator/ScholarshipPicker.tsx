'use client';

import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { extractScholarshipOffset, ScholarshipOffset } from './calculatorTypes';

interface ScholarshipPickerProps {
    onSelect: (scholarship: ScholarshipOffset | null) => void;
}

export default function ScholarshipPicker({ onSelect }: ScholarshipPickerProps) {
    const [scholarships, setScholarships] = useState<ScholarshipOffset[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function loadFavorites() {
            try {
                const selfRes = await fetch('/api/auth/self');
                if (!selfRes.ok) return;
                const selfData = await selfRes.json();
                const ids: string[] = selfData?.user?.favoriteScholarships || [];
                const items = await Promise.all(
                    ids.map(async (id) => {
                        try {
                            const res = await fetch(`/api/scholarships/${id}`);
                            if (!res.ok) return null;
                            const data = await res.json();
                            return extractScholarshipOffset(data);
                        } catch {
                            return null;
                        }
                    })
                );
                if (!cancelled) setScholarships(items.filter((i): i is ScholarshipOffset => i !== null));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadFavorites();
        return () => {
            cancelled = true;
        };
    }, []);

    if (!loading && scholarships.length === 0) {
        return (
            <p className="text-xs text-slate-400">
                Favorite a scholarship first to apply it here as a cost offset.
            </p>
        );
    }

    return (
        <div className="relative">
            <Award className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
                value={selectedId}
                disabled={loading}
                onChange={(e) => {
                    const id = e.target.value;
                    setSelectedId(id);
                    onSelect(scholarships.find((s) => s.id === id) ?? null);
                }}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
                <option value="">{loading ? 'Loading your favorites...' : 'None'}</option>
                {scholarships.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
