import React from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ScholarshipDetailsPage from '@/components/scholarships/id/ScholarshipDetailsPage';
import { Scholarship } from '@/types/scholarship';
import { getBaseUrl } from '@/lib/getBaseUrl';

interface PageProps {
    params: Promise<{ id: string }>;
}

// Запрос данных стипендии с API (server-to-server, браузер этого не видит).
// Форвардим реальную cookie сессии — см. комментарий в app/universities/[id]/page.tsx
// про то, почему заголовок-заглушка вместо этого небезопасен.
async function getScholarship(id: string): Promise<Scholarship | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        const res = await fetch(`${getBaseUrl()}/api/scholarships/${id}`, {
            cache: 'no-store',
            headers: {
                ...(token ? { Cookie: `token=${token}` } : {}),
            },
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