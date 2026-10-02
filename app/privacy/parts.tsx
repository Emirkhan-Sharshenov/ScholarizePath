import CookieSettingsButton from '@/components/consent/CookieSettingsButton';

// Building blocks shared by the English and Russian policy texts, so the two
// differ only in wording.

export const CONTACT_EMAIL = 'sgoo0931@gmail.com';
export const INSTAGRAM = { handle: '@emirit_kg', url: 'https://instagram.com/emirit_kg' };

export const list = 'list-disc space-y-2 pl-5 marker:text-slate-300';
export const link = 'font-medium text-brand underline-offset-2 hover:underline';
export const code = 'rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-ink';

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-24 border-t border-slate-100 pt-8 first:border-t-0 first:pt-0">
            <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">{title}</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-600">{children}</div>
        </section>
    );
}

export function Item({ term, children }: { term: string; children: React.ReactNode }) {
    return (
        <li>
            <span className="font-semibold text-ink">{term}.</span> {children}
        </li>
    );
}

export function Strong({ children }: { children: React.ReactNode }) {
    return <span className="font-semibold text-ink">{children}</span>;
}

export function Mail() {
    return (
        <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
            {CONTACT_EMAIL}
        </a>
    );
}

export function Instagram() {
    return (
        <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" className={link}>
            {INSTAGRAM.handle}
        </a>
    );
}

export function CookieSettingsLink() {
    return <CookieSettingsButton className={link} />;
}

export function PolicyFrame({
    eyebrow,
    title,
    updated,
    intro,
    tocLabel,
    sections,
    children,
}: {
    eyebrow: string;
    title: string;
    updated: string;
    intro: React.ReactNode;
    tocLabel: string;
    sections: { id: string; title: string }[];
    children: React.ReactNode;
}) {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
            <header>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>
                <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
                <p className="mt-3 text-sm text-slate-500">{updated}</p>
                <p className="mt-6 text-[15px] leading-relaxed text-slate-600">{intro}</p>
            </header>

            <nav aria-label={tocLabel} className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{tocLabel}</p>
                <ol className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    {sections.map((s, i) => (
                        <li key={s.id}>
                            <a href={`#${s.id}`} className="text-slate-600 transition-colors hover:text-brand">
                                <span className="mr-2 tabular-nums text-slate-400">{i + 1}.</span>
                                {s.title}
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>

            <div className="mt-8 space-y-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-10">
                {children}
            </div>
        </div>
    );
}
