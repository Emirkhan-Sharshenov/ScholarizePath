import { Check } from 'lucide-react';

export default function FeatureCard({ icon, iconTone = 'bg-blue-50 text-brand ring-blue-100 group-hover:bg-brand', badgeText, title, description, highlights, featured = false, onExplore }) {
    return (
        <article className="group relative h-full">
            <button
                type="button"
                onClick={onExplore}
                aria-haspopup="dialog"
                className={`relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border text-left transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${featured
                    ? 'border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/70 p-6 shadow-[0_4px_12px_rgba(10,26,63,0.05)] hover:shadow-[0_10px_24px_rgba(10,26,63,0.10)] sm:p-7'
                    : 'border-slate-200/80 bg-white p-6 shadow-[0_4px_12px_rgba(10,26,63,0.04)] hover:border-blue-200 hover:shadow-[0_10px_24px_rgba(10,26,63,0.08)]'
                    }`}
            >
                <div>
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset transition-all duration-300 group-hover:scale-105 group-hover:text-white group-hover:ring-transparent ${iconTone}`}>
                            {icon}
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-brand">
                            {badgeText}
                        </span>
                    </div>

                    <h3 className={`font-display font-semibold tracking-tight text-ink ${featured ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
                        {title}
                    </h3>

                    <p className={`mt-2 leading-relaxed text-slate-500 ${featured ? 'text-[15px] max-w-md' : 'text-sm'}`}>
                        {description}
                    </p>

                    {featured && highlights?.length > 0 && (
                        <ul className="mt-5 space-y-2.5">
                            {highlights.slice(0, 3).map((point) => (
                                <li key={point} className="flex items-start gap-2.5 text-sm text-slate-600">
                                    <span aria-hidden="true" className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                    <span className="leading-snug">{point}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div aria-hidden="true" className="mt-6 flex items-center text-sm font-semibold text-brand transition-transform group-hover:translate-x-1">
                    Explore feature <span className="ml-1.5">→</span>
                </div>
            </button>
        </article>
    );
}
