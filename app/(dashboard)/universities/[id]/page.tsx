import { cookies } from 'next/headers';
import UniversityDetailsPage from '@/components/universities/id/UniversityDetailsPage';
import { getBaseUrl } from '@/lib/getBaseUrl';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getUniversity(id: string) {
    try {
        // Server-to-server fetch to our own API. Since this route requires
        // authentication + a completed profile, we must forward the caller's
        // actual session cookie — the fetch() call here does NOT automatically
        // inherit the browser's cookies the way a client-side fetch would.
        //
        // NOTE: a header like 'x-internal-request: 1' would NOT be a safe way
        // to bypass this — anyone can set that same header themselves when
        // hitting /api/universities/[id] directly, which would defeat auth
        // entirely. Forwarding the real, verifiable session token is the
        // only correct approach here.
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        const res = await fetch(`${getBaseUrl()}/api/universities/${id}`, {
            cache: 'no-store', // отключает кэширование, чтобы всегда получать свежие данные
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
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-800">Университет не найден</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Не удалось загрузить данные по идентификатору: <code className="font-mono text-blue-600">{id}</code>
                    </p>
                </div>
            </div>
        );
    }

    return <UniversityDetailsPage university={universityData} />;
}