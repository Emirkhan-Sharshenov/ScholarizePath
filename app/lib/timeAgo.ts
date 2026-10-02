/** "5 minutes ago", "вчера"… in the given Intl locale; older than a week → a short date. */
export function timeAgo(dateInput: string | Date, intlLocale = "en-US"): string {
    const date = new Date(dateInput);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" });

    if (seconds < 60) return rtf.format(0, "second");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return rtf.format(-minutes, "minute");
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return rtf.format(-hours, "hour");
    const days = Math.floor(hours / 24);
    if (days < 7) return rtf.format(-days, "day");
    return date.toLocaleDateString(intlLocale, { month: "short", day: "numeric" });
}