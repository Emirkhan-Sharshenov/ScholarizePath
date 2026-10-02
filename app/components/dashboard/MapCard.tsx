"use client";

import MapFilter from "./MapFilter";
import TopUniversitiesCard from "./TopUniversitiesCard";
import { useI18n } from "@/i18n/I18nProvider";

export default function MapCard() {
    const { t } = useI18n();

    return (
        <main className="w-full px-4 pb-12 font-body sm:px-6 md:px-10">
            <div className="pt-5 md:pt-8">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink md:text-4xl">
                    {t.dashboard.title}
                </h1>
                <p className="mt-1.5 text-sm text-slate-500 md:text-base">
                    {t.dashboard.lead}
                </p>
            </div>

            <div className="mt-5 md:mt-7">
                <MapFilter />
            </div>

            <div className="mt-10 md:mt-14">
                <TopUniversitiesCard />
            </div>
        </main>
    );
}
