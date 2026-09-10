import type { Metadata } from 'next';
import Navbar from '@/components/main/Navbar';
import FeatureGrid from '@/components/main/FeatureGrid';
import TopRankingsSection from '@/components/main/TopRankingsSection';
import Footer from '@/components/main/Footer';
import { getTopStats } from '@/services/stats.service';

// The homepage now bakes in favorite counts (via getTopStats) — without this,
// Next statically renders it once at build time and the "most favorited"
// teaser would never update again until the next deploy.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'ScholarizePath — Find Universities & Scholarships Worldwide',
  description:
    'Explore 1,500+ universities and 120+ scholarships worldwide. Get AI-powered university matching, admissions requirements, and personalized acceptance odds — all in one place.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ScholarizePath — Find Universities & Scholarships Worldwide',
    description:
      'Data-driven university matching and scholarship discovery for students planning to study abroad.',
    url: '/',
    siteName: 'ScholarizePath',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScholarizePath — Find Universities & Scholarships Worldwide',
    description:
      'Explore 1,500+ universities and 120+ scholarships worldwide with AI-powered matching.',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'ScholarizePath',
  url: 'https://scholarizepath.xyz/',
  description:
    'University discovery and scholarship-matching platform helping students find universities and scholarships worldwide.',
  logo: 'https://scholarizepath.xyz/images/logo.png',
};

const features = [
  {
    icon: 'GraduationCap' as const,
    badgeText: '1500+ Institutions',
    title: 'Global Universities',
    description: 'Explore over 1,500 top-ranked universities worldwide tailored to your academic profile.',
  },
  {
    icon: 'Award' as const,
    badgeText: '120+ Grants',
    title: 'Scholarship Finder',
    description: 'Discover fully funded and partial scholarships matching your target field and criteria.',
  },
  {
    icon: 'Bot' as const,
    badgeText: 'AI Powered',
    title: 'Smart Assistant',
    description: 'Leverage interactive AI tools to streamline, draft, and automate your entire application process.',
  },
  {
    icon: 'SlidersHorizontal' as const,
    badgeText: 'Algorithmic',
    title: 'List Generator',
    description: 'Generate highly curated university lists matched precisely to your budget and preferences.',
  },
  {
    icon: 'FileCheck2' as const,
    badgeText: 'Requirements',
    title: 'Admissions Details',
    description: 'Access complete admissions criteria, required document checklists, and key deadlines.',
  },
  {
    icon: 'TrendingUp' as const,
    badgeText: 'Analytics',
    title: 'Personalized Odds',
    description: 'Evaluate your target programs with an algorithmic estimate of your acceptance chances.',
  },
];

export default async function Home() {
  const { topUniversities, topScholarships } = await getTopStats(4);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <Navbar />

      <main className="flex flex-col flex-1">
        <section
          className="bg-brand text-white relative pt-14 sm:pt-20 md:pt-24 pb-20 sm:pb-32 md:pb-44 px-4 sm:px-6 overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] md:w-[600px] h-[150px] sm:h-[220px] md:h-[300px] bg-blue-400/20 blur-[120px] pointer-events-none rounded-full"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
          />

          <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
            <h1
              id="hero-heading"
              className="text-2xl sm:text-4xl md:text-6xl font-black leading-tight tracking-tight max-w-xs sm:max-w-xl md:max-w-3xl"
            >
              Find Your Best Fit: <br />
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                Explore Global Opportunities
              </span>
            </h1>

            <p className="mt-4 sm:mt-6 text-blue-100/80 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-lg md:max-w-xl font-normal leading-relaxed">
              Data-driven insights, AI automation, and curated scholarship matching all in one place.
            </p>
          </div>
        </section>
        <section
          className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-16 md:-mt-24 relative z-20 pb-16 sm:pb-20 md:pb-24 w-full"
          aria-labelledby="features-heading"
        >
          <h2 id="features-heading" className="sr-only">
            Platform features
          </h2>
          <FeatureGrid features={features} />
        </section>
        <section
          className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20 md:pb-24 w-full"
          aria-labelledby="top-rankings-heading"
        >
          <h2 id="top-rankings-heading" className="sr-only">
            Most favorited universities and scholarships
          </h2>
          <TopRankingsSection
            topUniversities={topUniversities}
            topScholarships={topScholarships}
            variant="teaser"
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
