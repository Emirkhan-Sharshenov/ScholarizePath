import Navbar from '@/components/main/Navbar';
import FeatureCard from '@/components/main/FeatureCard';
import {
  GraduationCap,
  Award,
  Bot,
  SlidersHorizontal,
  FileCheck2,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: GraduationCap,
      badgeText: '1500+ Institutions',
      title: 'Global Universities',
      description: 'Explore over 1,500 top-ranked universities worldwide tailored to your academic profile.',
    },
    {
      icon: Award,
      badgeText: '120+ Grants',
      title: 'Scholarship Finder',
      description: 'Discover fully funded and partial scholarships matching your target field and criteria.',
    },
    {
      icon: Bot,
      badgeText: 'AI Powered',
      title: 'Smart Assistant',
      description: 'Leverage interactive AI tools to streamline, draft, and automate your entire application process.',
    },
    {
      icon: SlidersHorizontal,
      badgeText: 'Algorithmic',
      title: 'List Generator',
      description: 'Generate highly curated university lists matched precisely to your budget and preferences.',
    },
    {
      icon: FileCheck2,
      badgeText: 'Requirements',
      title: 'Admissions Details',
      description: 'Access complete admissions criteria, required document checklists, and key deadlines.',
    },
    {
      icon: TrendingUp,
      badgeText: 'Analytics',
      title: 'Personalized Odds',
      description: 'Evaluate your target programs with an algorithmic estimate of your acceptance chances.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section
        style={{ backgroundColor: 'rgb(0, 88, 189)' }}
        className="text-white relative pt-24 pb-44 px-6 overflow-hidden"
      >
        {/* Фоновое свечение (Glow effects) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-400/20 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight max-w-3xl">
            Find Your Best Fit: <br />
            <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
              Explore Global Opportunities
            </span>
          </h1>

          <p className="mt-6 text-blue-100/80 text-base md:text-lg max-w-xl font-normal leading-relaxed">
            Data-driven insights, AI automation, and curated scholarship matching all in one place.
          </p>
        </div>
      </section>

      {/* Overlapping Card Grid */}
      <main className="max-w-6xl mx-auto px-6 -mt-24 relative z-20 pb-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <FeatureCard
              key={idx}
              icon={item.icon}
              badgeText={item.badgeText}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
