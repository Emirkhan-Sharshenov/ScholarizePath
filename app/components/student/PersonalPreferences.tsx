'react';

interface PersonalPreferencesProps {
    firstName: string;
    lastName: string;
    preferredField: string;
    preferredCountry: string;
    programLevel: string;
    isEditing: boolean;
    onChange: (path: string, value: any) => void;
}

export function PersonalPreferences({
    firstName,
    lastName,
    preferredField,
    preferredCountry,
    programLevel,
    isEditing,
    onChange,
}: PersonalPreferencesProps) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Personal & Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="p-4 border border-gray-100 rounded-xl bg-slate-50">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">First Name</span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => onChange('firstName', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm font-medium text-gray-800"
                        />
                    ) : (
                        <span className="font-semibold text-gray-800">{firstName}</span>
                    )}
                </div>

                {/* Last Name */}
                <div className="p-4 border border-gray-100 rounded-xl bg-slate-50">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">Last Name</span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => onChange('lastName', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm font-medium text-gray-800"
                        />
                    ) : (
                        <span className="font-semibold text-gray-800">{lastName}</span>
                    )}
                </div>

                {/* Field */}
                <div className="p-4 border border-gray-100 rounded-xl bg-slate-50">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">Preferred Field</span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={preferredField}
                            onChange={(e) => onChange('profile.preferredField', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm font-medium text-gray-800"
                        />
                    ) : (
                        <span className="font-semibold text-gray-800">{preferredField}</span>
                    )}
                </div>

                {/* Country */}
                <div className="p-4 border border-gray-100 rounded-xl bg-slate-50">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">Target Country</span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={preferredCountry}
                            onChange={(e) => onChange('profile.preferredCountry', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm font-medium text-gray-800"
                        />
                    ) : (
                        <span className="font-semibold text-gray-800">{preferredCountry}</span>
                    )}
                </div>

                {/* Level */}
                <div className="p-4 border border-gray-100 rounded-xl bg-slate-50 md:col-span-2">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">Program Level</span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={programLevel}
                            onChange={(e) => onChange('profile.programLevel', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm font-medium text-gray-800"
                        />
                    ) : (
                        <span className="font-semibold text-gray-800">{programLevel}</span>
                    )}
                </div>
            </div>
        </div>
    );
}