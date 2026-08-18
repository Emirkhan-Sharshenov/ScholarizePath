'react';

interface ProfileHeaderProps {
    firstName: string;
    lastName: string;
    email: string;
    nationality: string;
    age: number;
}

export function ProfileHeader({
    firstName,
    lastName,
    email,
    nationality,
    age,
}: ProfileHeaderProps) {
    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`;

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 text-2xl font-bold">
                {initials}
            </div>
            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">
                    {firstName} {lastName}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>✉</span> {email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>🌐</span> {nationality} • Age {age}
                </div>
            </div>
        </div>
    );
}