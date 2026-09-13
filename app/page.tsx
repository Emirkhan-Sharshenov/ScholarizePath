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
    longDescription:
      "Browse a constantly growing catalog of universities from every major study destination — filter by country, ranking, tuition, and program to zero in on schools that actually fit your profile, not just the famous names.",
    highlights: [
      'Detailed profiles: rankings, tuition, acceptance rates, and campus life',
      'Filter by country, field of study, budget, and academic requirements',
      'Save favorites and compare institutions side by side',
    ],
    href: '/universities',
    ctaLabel: 'Browse universities',
  },
  {
    icon: 'Award' as const,
    badgeText: '120+ Grants',
    title: 'Scholarship Finder',
    description: 'Discover fully funded and partial scholarships matching your target field and criteria.',
    longDescription:
      'Search a curated database of scholarships and grants — from full-ride awards to field-specific grants — and instantly see which ones you qualify for based on your nationality, GPA, and program of interest.',
    highlights: [
      'Fully funded and partial scholarships from 120+ programs',
      'Eligibility criteria and deadlines at a glance',
      'Matches refined by your academic and financial profile',
    ],
    href: '/scholarships',
    ctaLabel: 'Find scholarships',
  },
  {
    icon: 'Bot' as const,
    badgeText: 'AI Powered',
    title: 'Smart Assistant',
    description: 'Leverage interactive AI tools to streamline, draft, and automate your entire application process.',
    longDescription:
      'Chat with an AI assistant trained to help with every stage of studying abroad — from shortlisting universities to drafting essays — and get personalized recommendations based on the details you share.',
    highlights: [
      'Conversational AI that answers questions about universities and scholarships',
      'Personalized university and scholarship recommendations',
      'Drafting help for essays and application documents',
    ],
    href: '/aibot',
    ctaLabel: 'Try the assistant',
  },
  {
    icon: 'SlidersHorizontal' as const,
    badgeText: 'Algorithmic',
    title: 'List Generator',
    description: 'Generate highly curated university lists matched precisely to your budget and preferences.',
    longDescription:
      'Turn your preferences — budget, location, field of study, and academic scores — into a ready-to-use, exportable list of universities worth applying to, so you spend less time searching and more time applying.',
    highlights: [
      'Curated shortlist based on your budget and preferences',
      'Export your list as a document to share or keep for reference',
      'Balanced mix of reach, match, and safety schools',
    ],
    href: '/unilist',
    ctaLabel: 'Generate a list',
  },
  {
    icon: 'FileCheck2' as const,
    badgeText: 'Requirements',
    title: 'Admissions Details',
    description: 'Access complete admissions criteria, required document checklists, and key deadlines.',
    longDescription:
      "Every university page breaks down exactly what's required to apply — test scores, required documents, application deadlines — so nothing catches you off guard late in the process.",
    highlights: [
      'Required test scores (SAT, IELTS/TOEFL, and more) per university',
      'Document checklists for each application',
      'Key deadlines so you never miss a submission window',
    ],
    href: '/universities',
    ctaLabel: 'View requirements',
  },
  {
    icon: 'TrendingUp' as const,
    badgeText: 'Analytics',
    title: 'Personalized Odds',
    description: 'Evaluate your target programs with an algorithmic estimate of your acceptance chances.',
    longDescription:
      'Based on your GPA, test scores, and profile compared against each university\'s historical admissions data, get an estimated acceptance chance for every program you\'re considering — so you can build a balanced list with confidence.',
    highlights: [
      'Acceptance-chance estimates tailored to your academic profile',
      'Benchmarks against real historical admissions data',
      'Helps you balance reach, match, and safety schools',
    ],
    href: '/universities',
    ctaLabel: 'Check your odds',
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
