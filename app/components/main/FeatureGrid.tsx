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

// Only plain strings cross the server -> client boundary (see page.tsx).
// The actual icon components live and get resolved entirely on the client.
const ICONS: Record<string, LucideIcon> = {
    GraduationCap,
    Award,
    Bot,
    SlidersHorizontal,
    FileCheck2,
    TrendingUp,
};

interface Feature {
    icon: keyof typeof ICONS;
    badgeText: string;
    title: string;
    description: string;
}

function AnimatedFeatureCard({ feature, index }: { feature: Feature; index: number }) {
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
            { threshold: 0.15 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out will-change-transform ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
                }`}
            style={{ transitionDelay: `${index * 120}ms` }}
        >
            <FeatureCard
                icon={Icon ? <Icon aria-hidden="true" className="w-6 h-6 stroke-[1.75]" /> : null}
                badgeText={feature.badgeText}
                title={feature.title}
                description={feature.description}
            />
        </div>
    );
}

export default function FeatureGrid({ features }: { features: Feature[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {features.map((item, idx) => (
                <AnimatedFeatureCard key={idx} feature={item} index={idx} />
            ))}
        </div>
    );
}
