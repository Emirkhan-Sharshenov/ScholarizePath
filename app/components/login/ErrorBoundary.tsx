"use client";

import React from "react";
import { useI18n } from "@/i18n/I18nProvider";

function DefaultFallback({ onReload }: { onReload: () => void }) {
    const { t } = useI18n();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f9fc] text-ink gap-4 px-6 text-center font-body">
            <h1 className="font-display text-2xl font-bold">{t.ui.errorTitle}</h1>
            <p className="text-sm text-slate-500 max-w-sm">{t.ui.extensionHint}</p>
            <button
                onClick={onReload}
                className="h-11 px-6 rounded-[10px] bg-brand text-white hover:bg-[#004a9f] transition font-semibold"
            >
                {t.ui.reload}
            </button>
        </div>
    );
}

type Props = {
    children: React.ReactNode;
    fallback?: React.ReactNode;
};

type State = {
    hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: unknown, info: React.ErrorInfo) {
        console.error("ErrorBoundary caught a render error:", error, info);
    }

    handleReload = () => {
        this.setState({ hasError: false });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? <DefaultFallback onReload={this.handleReload} />
            );
        }

        return this.props.children;
    }
}