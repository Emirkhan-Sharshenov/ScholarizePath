'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface MobileFilterDrawerProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

// Rendered via a portal straight into <body> on purpose: the dashboard shell
// (MainContent's `[contain:layout]` plus PageTransition's Framer Motion
// `transform`) turns any ancestor into a containing block for `position:
// fixed` — without the portal this drawer was "fixed" relative to that tall
// scrollable ancestor instead of the viewport, landing below the results
// list instead of at the bottom of the screen.
export default function MobileFilterDrawer({ open, onClose, title, children }: MobileFilterDrawerProps) {
    useEffect(() => {
        if (!open) return;

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
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-50 flex items-end bg-slate-900/60 backdrop-blur-xs lg:hidden"
            onClick={onClose}
        >
            <div
                className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 font-body shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300" />
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                        aria-label="Close filters"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
}
