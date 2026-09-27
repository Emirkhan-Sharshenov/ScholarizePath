import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import UniversityDetailsPage from '@/components/universities/id/UniversityDetailsPage';
import { getBaseUrl } from '@/lib/getBaseUrl';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getUniversity(id: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        const res = await fetch(`${getBaseUrl()}/api/universities/${id}`, {
            cache: 'no-store', 
            headers: {
                ...(token ? { Cookie: `token=${token}` } : {}),
            },
        });

        if (!res.ok) {
            console.error(`Failed to fetch university: ${res.statusText}`);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error('Error fetching university:', error);
        return null;
    }
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const universityData = await getUniversity(id);

    if (!universityData) {
        notFound();
    }

    return <UniversityDetailsPage university={universityData} />;
}