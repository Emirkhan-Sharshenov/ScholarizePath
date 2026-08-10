import UniversityDetailsPage from '@/components/universities/id/UniversityDetailsPage';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getUniversity(id: string) {
    try {
        // Делаем запрос к вашему новому API эндпоинту
        const res = await fetch(`http://localhost:3000/api/universities/${id}`, {
            cache: 'no-store', // отключает кэширование, чтобы всегда получать свежие данные
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