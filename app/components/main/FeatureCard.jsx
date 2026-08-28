export default function FeatureCard({ icon: Icon, badgeText, title, description }) {
    return (
        <div className="group bg-white rounded-2xl p-7 shadow-sm border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between h-full relative overflow-hidden">

            {/* Мягкое фоновое свечение при наведении */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />

            <div>
                {/* Верхняя панель: Иконка + Микро-бэйдж */}
                <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        {Icon && <Icon className="w-6 h-6 stroke-[1.75]" />}
                    </div>

                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        {badgeText}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug tracking-tight">
                    {title}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Аккуратная интерактивная стрелка */}
            <div className="mt-6 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                Explore feature <span className="ml-1">→</span>
            </div>
        </div>
    );
}