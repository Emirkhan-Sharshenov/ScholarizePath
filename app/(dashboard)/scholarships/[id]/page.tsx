import React from 'react';
import { notFound } from 'next/navigation';
import ScholarshipDetailsPage from '@/components/scholarships/id/ScholarshipDetailsPage';
import { Scholarship } from '@/types/scholarship';

interface PageProps {
    params: Promise<{ id: string }>;
}

// Запрос данных стипендии с API
async function getScholarship(id: string): Promise<Scholarship | null> {
    try {
        const res = await fetch(`http://localhost:3000/api/scholarships/${id}`, {
            cache: 'no-store', 
        });

        if (!res.ok) {
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error('Failed to fetch scholarship:', error);
        return null;
    }
}

// Генерация метатегов для SEO
export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const scholarship = await getScholarship(id);

    if (!scholarship) {
        return { title: 'Scholarship Not Found' };
    }

    return {
        title: `${scholarship.scholarshipName} | ScholarizePath`,
        description: scholarship.description,
    };
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const scholarship = await getScholarship(id);

    if (!scholarship) {
        notFound();
    }

    return <ScholarshipDetailsPage scholarship={scholarship} />;
}