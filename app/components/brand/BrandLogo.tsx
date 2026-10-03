'use client';

import { useEffect, useId, useState } from 'react';
import { motion, MotionConfig, useAnimationControls, type Transition } from 'framer-motion';
import { useI18n } from '@/i18n/I18nProvider';

// Vector version of /images/logo.png (a mortarboard resting on an open book),
// traced from the original artwork on its 498 × 386 grid.
//
// The intro assembles the mark once per page load: the book opens from the
// spine, the cap settles onto it, the tassel swings, then the name writes in.
// Hovering tips the cap. Users with "reduce motion" get the finished logo.

const BLUE = 'var(--brand)';
const INK = 'var(--ink)';

// Left half of the book; the right half is the same shapes mirrored at x = 497.
const PAGE_TOP = 'M42 263 C135 268 205 302 244 346 L240 352 C200 305 120 283 29 277 Z';
const PAGE_BASE = 'M18 290 C120 294 200 318 244 350 L248 386 C205 356 110 322 15 322 L8 294 Z';

const BOARD = 'M249 0 L495 101 L248 206 L2 101 Z';
const BAND = 'M112 166 L248 221 L386 164 L386 248 Q298 258 249 310 Q200 258 112 248 Z';
const TASSEL = 'M422 207 L440 207 L445 236 L443 241 L420 241 L417 236 Z';

const ease = [0.22, 1, 0.36, 1] as const;

/** Played once per page load, not on every client-side navigation. */
let introPlayed = false;

interface BrandLogoProps {
    /** "full": mark + name (+ tagline); "mark": the icon only. */
    variant?: 'full' | 'mark';
    tagline?: boolean;
    /** Play the assemble-in intro on first render. */
    animated?: boolean;
    /** Sizes everything in em — set a font-size here (e.g. "text-[24px]"). */
    className?: string;
    /** Extra classes for the tagline, e.g. hiding it on narrow screens. */
    taglineClassName?: string;
    /** Extra classes for the name + tagline block, e.g. showing only the mark on phones. */
    nameClassName?: string;
    /** Hide from assistive tech when a visible name sits right next to the mark. */
    decorative?: boolean;
}

export default function BrandLogo({ variant = 'full', tagline = true, animated = true, className = '', taglineClassName = '', nameClassName = '', decorative = false }: BrandLogoProps) {
    const { t } = useI18n();
    const maskId = `sp-cord-${useId().replace(/:/g, '')}`;
    const [intro] = useState(() => animated && !introPlayed);
    const hover = useAnimationControls();
    const tassel = useAnimationControls();

    useEffect(() => {
        if (!intro) return;
        introPlayed = true;
        // Tassel swings once the cap has landed.
        tassel.start({ rotate: [0, 16, -11, 6, -3, 0], transition: { delay: 0.95, duration: 1.4, ease: 'easeOut' } });
    }, [intro, tassel]);

    const tip = () => {
        hover.start({ rotate: [0, -5, 0], y: [0, -10, 0], transition: { duration: 0.7, ease } });
        tassel.start({ rotate: [0, 14, -9, 5, -2, 0], transition: { duration: 1.1, ease: 'easeOut' } });
    };

    const from = <T extends object>(hidden: T, t: Transition) => (intro ? { initial: hidden, transition: t } : { initial: false as const });

    const mark = (
        <motion.svg
            viewBox="0 0 498 386"
            className={`${variant === 'full' ? 'h-[1.85em]' : 'h-[1em]'} w-auto shrink-0 overflow-visible`}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                {/* The cord and button are cut out of the board, so the mark works on any background. */}
                <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="498" height="386">
                    <rect width="498" height="386" fill="white" />
                    <ellipse cx="250" cy="98" rx="24" ry="12" fill="black" />
                    <line x1="262" y1="99.5" x2="425" y2="134" stroke="black" strokeWidth="11" strokeLinecap="round" />
                </mask>
            </defs>

            {/* Book — both halves open outward from the spine */}
            {[0, 1].map((side) => (
                <g key={side} transform={side ? 'translate(497 0) scale(-1 1)' : undefined}>
                    <motion.path
                        d={PAGE_BASE}
                        fill={BLUE}
                        style={{ originX: '248px', originY: '386px', transformBox: 'view-box' }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        {...from({ scaleX: 0.05, opacity: 0 }, { duration: 0.55, ease })}
                    />
                    <motion.path
                        d={PAGE_TOP}
                        fill={BLUE}
                        style={{ originX: '248px', originY: '350px', transformBox: 'view-box' }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        {...from({ scaleX: 0.05, opacity: 0 }, { duration: 0.55, delay: 0.1, ease })}
                    />
                </g>
            ))}

            {/* Cap — rises, then the board lands on it */}
            <motion.g animate={hover} style={{ originX: '248px', originY: '240px', transformBox: 'view-box' }}>
                <motion.path
                    d={BAND}
                    fill={BLUE}
                    animate={{ y: 0, opacity: 1 }}
                    {...from({ y: 40, opacity: 0 }, { duration: 0.5, delay: 0.3, ease })}
                />
                <motion.g
                    style={{ originX: '248px', originY: '110px', transformBox: 'view-box' }}
                    animate={{ y: 0, rotate: 0, opacity: 1 }}
                    {...from({ y: -120, rotate: -14, opacity: 0 }, { type: 'spring', stiffness: 170, damping: 13, delay: 0.5 })}
                >
                    <path d={BOARD} fill={BLUE} mask={`url(#${maskId})`} />
                    {/* Cord + tassel hang from the board's right corner and swing about it */}
                    <motion.g animate={tassel} style={{ originX: '431px', originY: '124px', transformBox: 'view-box' }}>
                        <rect x="426" y="120" width="11" height="68" rx="3" fill={BLUE} />
                        <circle cx="431" cy="195" r="12" fill={BLUE} />
                        <path d={TASSEL} fill={BLUE} />
                    </motion.g>
                </motion.g>
            </motion.g>
        </motion.svg>
    );

    const name = 'ScholarizePath';

    return (
        <MotionConfig reducedMotion="user">
            <span
                className={`inline-flex items-center gap-[0.45em] leading-none ${className}`}
                onMouseEnter={tip}
                {...(decorative
                    ? { 'aria-hidden': true }
                    : { role: 'img', 'aria-label': variant === 'full' && tagline ? `ScholarizePath — ${t.common.tagline}` : 'ScholarizePath' })}
            >
                {mark}
                {variant === 'full' && (
                    <span className={`flex flex-col justify-center ${nameClassName}`} aria-hidden="true">
                        <span className="whitespace-nowrap font-display text-[1em] font-extrabold tracking-[-0.02em] text-ink" style={{ color: INK }}>
                            {name.split('').map((ch, i) => (
                                <motion.span
                                    key={i}
                                    className="inline-block"
                                    animate={{ y: 0, opacity: 1 }}
                                    {...from({ y: '0.35em', opacity: 0 }, { duration: 0.45, delay: 0.45 + i * 0.035, ease })}
                                >
                                    {ch}
                                </motion.span>
                            ))}
                        </span>
                        {tagline && (
                            <motion.span
                                className={`mt-[0.28em] whitespace-nowrap font-body text-[0.4em] font-medium tracking-[0.01em] ${taglineClassName}`}
                                style={{ color: INK }}
                                animate={{ opacity: 1, x: 0 }}
                                {...from({ opacity: 0, x: -6 }, { duration: 0.6, delay: 1.1, ease })}
                            >
                                {t.common.tagline}
                            </motion.span>
                        )}
                    </span>
                )}
            </span>
        </MotionConfig>
    );
}
