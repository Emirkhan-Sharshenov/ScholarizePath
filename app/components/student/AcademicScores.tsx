'react';

interface AcademicScoresProps {
    gpa: number;
    sat: number;
    englishTest: { type: string; score: number };
    isEditing: boolean;
    onChange: (path: string, value: any) => void;
}

export function AcademicScores({
    gpa,
    sat,
    englishTest,
    isEditing,
    onChange,
}: AcademicScoresProps) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Academic Scores</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GPA */}
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">GPA</span>
                    <div className="mt-2">
                        {isEditing ? (
                            <input
                                type="number"
                                step="0.1"
                                value={gpa}
                                onChange={(e) => onChange('profile.gpa', parseFloat(e.target.value))}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-base font-bold text-gray-800"
                            />
                        ) : (
                            <span className="text-xl font-bold text-gray-800">{gpa} / 4.0</span>
                        )}
                    </div>
                </div>

                {/* English Test */}
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {englishTest.type}
                    </span>
                    <div className="mt-2">
                        {isEditing ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={englishTest.type}
                                    onChange={(e) => onChange('profile.englishTest.type', e.target.value)}
                                    className="w-1/2 bg-white border border-gray-300 rounded px-2 py-1 text-sm font-bold text-gray-800"
                                />
                                <input
                                    type="number"
                                    step="0.5"
                                    value={englishTest.score}
                                    onChange={(e) => onChange('profile.englishTest.score', parseFloat(e.target.value))}
                                    className="w-1/2 bg-white border border-gray-300 rounded px-2 py-1 text-sm font-bold text-gray-800"
                                />
                            </div>
                        ) : (
                            <span className="text-xl font-bold text-gray-800">{englishTest.score} Overall</span>
                        )}
                    </div>
                </div>

                {/* SAT */}
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">SAT</span>
                    <div className="mt-2">
                        {isEditing ? (
                            <input
                                type="number"
                                value={sat}
                                onChange={(e) => onChange('profile.sat', parseInt(e.target.value))}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-base font-bold text-gray-800"
                            />
                        ) : (
                            <span className="text-xl font-bold text-gray-800">{sat}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
