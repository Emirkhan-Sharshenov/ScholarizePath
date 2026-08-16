import { ComparisonStatus } from "@/types/compare";

// Чем МЕНЬШЕ число, тем лучше (Рейтинг, Стоимость обучения, Требования по GPA)
export function getRankOrCostStatuses(values: (number | null)[]): ComparisonStatus[] {
    const validValues = values.filter((v): v is number => v !== null);
    if (validValues.length <= 1) return values.map(() => "neutral");

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);

    if (min === max) return values.map(() => "neutral");

    return values.map((v) => {
        if (v === null) return "neutral";
        if (v === min) return "best";
        if (v === max) return "worst";
        return "neutral";
    });
}

// Чем БОЛЬШЕ число, тем лучше (Acceptance Rate, Размер стипендии)
export function getHigherIsBetterStatuses(values: (number | null)[]): ComparisonStatus[] {
    const validValues = values.filter((v): v is number => v !== null);
    if (validValues.length <= 1) return values.map(() => "neutral");

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);

    if (min === max) return values.map(() => "neutral");

    return values.map((v) => {
        if (v === null) return "neutral";
        if (v === max) return "best";
        if (v === min) return "worst";
        return "neutral";
    });
}