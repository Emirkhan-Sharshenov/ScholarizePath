import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Award, Bot, GraduationCap, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import Navbar from '@/components/main/Navbar';
import FeatureGrid from '@/components/main/FeatureGrid';
import TopRankingsSection from '@/components/main/TopRankingsSection';
import Footer from '@/components/main/Footer';
import { getCachedTopStats } from '@/services/stats.service';
import { getI18n } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.home.meta.title,
    description: t.home.meta.description,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: t.home.meta.title,
      description: t.home.meta.ogDescription,
      url: '/',
      siteName: 'ScholarizePath',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.home.meta.title,
      description: t.home.meta.twitterDescription,
    },
  };
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'ScholarizePath',
  url: 'https://scholarizepath.xyz/',
  description:
    'University discovery and scholarship-matching platform helping students find universities and scholarships worldwide.',
  logo: 'https://scholarizepath.xyz/images/logo.png',
};

// Icon and link per feature; the copy comes from the `home.features` messages,
// in the same order.
const FEATURE_LINKS = [
  { icon: 'GraduationCap' as const, href: '/universities' },
  { icon: 'Award' as const, href: '/scholarships' },
  { icon: 'Bot' as const, href: '/aibot' },
  { icon: 'SlidersHorizontal' as const, href: '/unilist' },
  { icon: 'FileCheck2' as const, href: '/universities' },
  { icon: 'TrendingUp' as const, href: '/universities' },
];


function PreviewCard({
  href,
  eyebrow,
  title,
  place,
  icon: Icon,
  tone,
  className = '',
}: {
  href: string;
  eyebrow: string;
  title: string;
  place: string;
  icon: typeof GraduationCap;
  tone: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_28px_rgba(10,26,63,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_20px_40px_rgba(10,26,63,0.12)] sm:p-5 ${className}`}
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon aria-hidden="true" className="h-6 w-6 stroke-[1.75]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{eyebrow}</span>
        <span className="mt-0.5 block truncate font-display text-base font-semibold text-ink group-hover:text-brand">
          {title}
        </span>
        <span className="mt-0.5 flex items-center gap-1 truncate text-sm text-slate-500">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{place}</span>
        </span>
      </span>
      <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand" />
    </Link>
  );
}

export default async function Home() {
  const { t } = await getI18n();
  const { topUniversities, topScholarships } = await getCachedTopStats(4);

  const features = t.home.features.map((copy, i) => ({
    ...FEATURE_LINKS[i],
    badgeText: copy.badge,
    title: copy.title,
    description: copy.description,
    longDescription: copy.longDescription,
    highlights: copy.highlights,
    ctaLabel: copy.cta,
  }));

  const stats = [
    { icon: GraduationCap, value: t.home.stats.universitiesValue, label: t.home.stats.universities, tone: 'bg-blue-50 text-brand' },
    { icon: Award, value: '120+', label: t.home.stats.scholarships, tone: 'bg-amber-50 text-amber-600' },
    { icon: Bot, value: t.home.stats.aiValue, label: t.home.stats.ai, tone: 'bg-violet-50 text-violet-600' },
    { icon: TrendingUp, value: t.home.stats.oddsValue, label: t.home.stats.odds, tone: 'bg-emerald-50 text-emerald-600' },
  ];
  const featuredUniversity = topUniversities[0];
  const featuredScholarship = topScholarships[0];

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col font-body text-ink selection:bg-blue-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <Navbar />

      <main className="flex flex-col flex-1 overflow-x-clip">
        <section
          className="relative overflow-hidden bg-gradient-to-b from-[#eaf2ff] via-[#f3f7ff] to-[#f7f9fc]"
          aria-labelledby="hero-heading"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-[0.35] [background-image:radial-gradient(#0058bd_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none"
          />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pt-20 lg:pb-24">
            <div className="flex min-w-0 flex-col items-start lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold text-brand shadow-sm">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-amber-500" />
                {t.home.hero.eyebrow}
              </span>

              <h1
                id="hero-heading"
                className="mt-5 font-display text-[2.25rem] font-bold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]"
              >
                {t.home.hero.titleStart}{' '}
                <span className="bg-gradient-to-r from-brand to-[#2f7cf6] bg-clip-text text-transparent">
                  {t.home.hero.titleAccent}
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {t.home.hero.lead}
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/login?mode=register"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-brand px-6 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(0,88,189,0.25)] transition-all hover:bg-[#004a9f] active:scale-[0.98]"
                >
                  {t.home.hero.getStarted}
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex h-12 items-center justify-center rounded-[10px] border border-slate-200 bg-white px-6 text-[15px] font-semibold text-ink shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/50"
                >
                  {t.home.hero.exploreFeatures}
                </Link>
              </div>
            </div>

            {(featuredUniversity || featuredScholarship) && (
              <div className="relative min-w-0 lg:col-span-5">
                <div
                  aria-hidden="true"
                  className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-brand/15 to-amber-300/20 blur-2xl"
                />
                <div className="relative mx-auto flex w-full max-w-md flex-col gap-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    {t.home.hero.mostFavorited}
                  </p>
                  {featuredUniversity && (
                    <PreviewCard
                      href={`/universities/${featuredUniversity.id}`}
                      eyebrow={t.home.hero.university}
                      title={featuredUniversity.name}
                      place={featuredUniversity.location}
                      icon={GraduationCap}
                      tone="bg-blue-50 text-brand"
                      className="lg:-rotate-1"
                    />
                  )}
                  {featuredScholarship && (
                    <PreviewCard
                      href={`/scholarships/${featuredScholarship.id}`}
                      eyebrow={t.home.hero.scholarship}
                      title={featuredScholarship.name}
                      place={featuredScholarship.country}
                      icon={Award}
                      tone="bg-amber-50 text-amber-600"
                      className="lg:translate-x-6 lg:rotate-1"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section aria-label={t.home.stats.label} className="relative z-10 mx-auto -mt-6 w-full max-w-7xl px-4 sm:-mt-8 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_10px_30px_rgba(10,26,63,0.06)] sm:gap-4 sm:p-4 lg:grid-cols-4">
            {stats.map(({ icon: Icon, value, label, tone }) => (
              <li key={label} className="flex items-center gap-3 rounded-xl p-2 sm:p-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${tone}`}>
                  <Icon aria-hidden="true" className="h-5 w-5 stroke-[1.75] sm:h-6 sm:w-6" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-bold leading-tight text-ink sm:text-xl">{value}</span>
                  <span className="block text-xs font-medium leading-snug text-slate-500 sm:text-sm">{label}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="features"
          className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
          aria-labelledby="features-heading"
        >
          <div className="mb-10 max-w-2xl sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">{t.home.featuresSection.eyebrow}</p>
            <h2 id="features-heading" className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-4xl">
              {t.home.featuresSection.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-500 sm:text-lg">
              {t.home.featuresSection.lead}
            </p>
          </div>
          <FeatureGrid features={features} />
        </section>

        <section
          className="border-y border-slate-200/70 bg-white"
          aria-labelledby="top-rankings-heading"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <h2 id="top-rankings-heading" className="sr-only">
              {t.home.rankingsHeading}
            </h2>
            <TopRankingsSection
              topUniversities={topUniversities}
              topScholarships={topScholarships}
              variant="teaser"
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8" aria-labelledby="cta-heading">
          <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-20 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
            />
            <div
              aria-hidden="true"
              className="absolute -top-20 left-1/2 h-64 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-brand/50 blur-[100px]"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 id="cta-heading" className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
                {t.home.cta.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-blue-100/80 sm:text-lg">
                {t.home.cta.lead}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/login?mode=register"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-white px-6 text-[15px] font-semibold text-ink transition-all hover:bg-blue-50 active:scale-[0.98]"
                >
                  {t.home.cta.create}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-[10px] border border-white/20 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  {t.home.cta.signIn}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
