'use client';

import { useEffect, useRef, useState } from 'react';
import {
    GraduationCap,
    Award,
    Bot,
    SlidersHorizontal,
    FileCheck2,
    TrendingUp,
    type LucideIcon,
} from 'lucide-react';
import FeatureCard from './FeatureCard';
import FeatureDetailModal, { type FeatureDetail } from './FeatureDetailModal';


const ICONS: Record<string, LucideIcon> = {
    GraduationCap,
    Award,
    Bot,
    SlidersHorizontal,
    FileCheck2,
    TrendingUp,
};

// Each feature gets its own accent color: a soft tinted tile
// on the card that fills solid on hover, and a gradient tile in the modal.
// Full class strings are spelled out so Tailwind picks them up.
const ICON_TONES: Record<string, { tile: string; solid: string }> = {
    GraduationCap: {
        tile: 'bg-blue-50 text-blue-600 ring-blue-100 group-hover:bg-blue-600',
        solid: 'from-blue-500 to-blue-700 shadow-blue-600/30',
    },
    Award: {
        tile: 'bg-amber-50 text-amber-600 ring-amber-100 group-hover:bg-amber-500',
        solid: 'from-amber-400 to-orange-500 shadow-amber-500/30',
    },
    Bot: {
        tile: 'bg-violet-50 text-violet-600 ring-violet-100 group-hover:bg-violet-600',
        solid: 'from-violet-500 to-purple-700 shadow-violet-600/30',
    },
    SlidersHorizontal: {
        tile: 'bg-sky-50 text-sky-600 ring-sky-100 group-hover:bg-sky-600',
        solid: 'from-sky-400 to-cyan-600 shadow-sky-600/30',
    },
    FileCheck2: {
        tile: 'bg-rose-50 text-rose-600 ring-rose-100 group-hover:bg-rose-600',
        solid: 'from-rose-400 to-pink-600 shadow-rose-600/30',
    },
    TrendingUp: {
        tile: 'bg-emerald-50 text-emerald-600 ring-emerald-100 group-hover:bg-emerald-600',
        solid: 'from-emerald-400 to-green-600 shadow-emerald-600/30',
    },
};

// Bento layout on a 4-column grid: the first and last cards are wide, so the
// six features fill two even rows (2+1+1 / 1+1+2).
const FEATURED_SPAN: Record<number, string> = {
    0: 'md:col-span-2',
    5: 'md:col-span-2',
};

interface Feature {
    icon: keyof typeof ICONS;
    badgeText: string;
    title: string;
    description: string;
    longDescription: string;
    highlights: string[];
    href: string;
    ctaLabel: string;
}

function AnimatedFeatureCard({
    feature,
    index,
    onExplore,
}: {
    feature: Feature;
    index: number;
    onExplore: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const Icon = ICONS[feature.icon];

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setVisible(true);
            return;
        }

        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-500 ease-out ${FEATURED_SPAN[index] ?? ''} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
            style={{ transitionDelay: `${(index % 3) * 80}ms` }}
        >
            <FeatureCard
                icon={Icon ? <Icon aria-hidden="true" className="w-[22px] h-[22px] stroke-[1.75]" /> : null}
                iconTone={ICON_TONES[feature.icon]?.tile}
                badgeText={feature.badgeText}
                title={feature.title}
                description={feature.description}
                highlights={feature.highlights}
                featured={index in FEATURED_SPAN}
                onExplore={onExplore}
            />
        </div>
    );
}

export default function FeatureGrid({ features }: { features: Feature[] }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const activeFeature: FeatureDetail | null =
        activeIndex === null
            ? null
            : {
                ...features[activeIndex],
                icon: ICONS[features[activeIndex].icon] ?? null,
                iconTone: ICON_TONES[features[activeIndex].icon]?.solid,
            };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {features.map((item, idx) => (
                <AnimatedFeatureCard
                    key={idx}
                    feature={item}
                    index={idx}
                    onExplore={() => setActiveIndex(idx)}
                />
            ))}

            <FeatureDetailModal feature={activeFeature} onClose={() => setActiveIndex(null)} />
        </div>
    );
}
