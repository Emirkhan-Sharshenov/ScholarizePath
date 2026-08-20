// lib/countries.ts
import countries from "i18n-iso-countries";

import enLocale from "i18n-iso-countries/langs/en.json";
import ruLocale from "i18n-iso-countries/langs/ru.json";

countries.registerLocale(enLocale);
countries.registerLocale(ruLocale);

export interface CountryOption {
    code: string; // Двузначный ISO 3166-1 код (например, "US", "KZ", "KG")
    name: string; // Локализованное название страны
}

/**
 * Возвращает массив стран, отсортированных по алфавиту для выбранного языка.
 */
export function getCountryList(lang: string = "ru"): CountryOption[] {
    const countryObj = countries.getNames(lang, { select: "official" });

    return Object.entries(countryObj)
        .map(([code, name]) => ({
            code,
            name: Array.isArray(name) ? name[0] : name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, lang));
}