export default function FeatureCard({ icon, badgeText, title, description }) {
    return (
        <article className="group bg-white rounded-2xl p-5 sm:p-6 md:p-7 shadow-sm border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between h-full relative overflow-hidden">

            <div aria-hidden="true" className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />

            <div>
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        {icon}
                    </div>

                    <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        {badgeText}
                    </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 leading-snug tracking-tight">
                    {title}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed">
                    {description}
                </p>
            </div>

            <div aria-hidden="true" className="mt-5 sm:mt-6 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                Explore feature <span className="ml-1">→</span>
            </div>
        </article>
    );
}
