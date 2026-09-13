'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { X, ArrowRight, type LucideIcon } from 'lucide-react';

export interface FeatureDetail {
    icon: LucideIcon | null;
    badgeText: string;
    title: string;
    description: string;
    longDescription: string;
    highlights: string[];
    href: string;
    ctaLabel: string;
}

interface FeatureDetailModalProps {
    feature: FeatureDetail | null;
    onClose: () => void;
}

export default function FeatureDetailModal({ feature, onClose }: FeatureDetailModalProps) {
    useEffect(() => {
        if (!feature) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [feature, onClose]);

    if (typeof document === 'undefined') return null;

    const Icon = feature?.icon ?? null;

    return createPortal(
        <AnimatePresence>
            {feature && (
                <motion.div
                    key="feature-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={feature.title}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6"
                    onClick={onClose}
                >
                    <motion.div
                        key="feature-modal-panel"
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            aria-hidden="true"
                            className="absolute -right-16 -top-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
                        />

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 bg-white/80 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative p-6 sm:p-8">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                                    {Icon && <Icon aria-hidden="true" className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />}
                                </div>
                                <div>
                                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 mb-1.5">
                                        {feature.badgeText}
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                                        {feature.title}
                                    </h3>
                                </div>
                            </div>

                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                                {feature.longDescription}
                            </p>

                            <ul className="space-y-3 mb-8">
                                {feature.highlights.map((point, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                        <span
                                            aria-hidden="true"
                                            className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
                                        />
                                        <span className="leading-relaxed">{point}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={feature.href}
                                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                            >
                                {feature.ctaLabel}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
