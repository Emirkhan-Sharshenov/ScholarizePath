"use client";

import React from "react";

type Props = {
    children: React.ReactNode;
    fallback?: React.ReactNode;
};

type State = {
    hasError: boolean;
};

// Catches render-time crashes (including ones triggered by browser extensions
// that monkey-patch Object.getOwnPropertyDescriptor / input value descriptors,
// e.g. some password managers) so one broken input doesn't white-screen the
// entire page. It can't fix the extension's bug, but it stops it from taking
// down the whole app for that user.
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
                this.props.fallback ?? (
                    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000139] text-white gap-4 px-6 text-center">
                        <h1 className="text-2xl font-bold">Something went wrong</h1>
                        <p className="text-sm text-gray-300 max-w-sm">
                            This is sometimes caused by a browser extension (like a password
                            manager) conflicting with the page. Try reloading, or disabling
                            extensions for this site.
                        </p>
                        <button
                            onClick={this.handleReload}
                            className="px-6 py-2 rounded-full border-2 border-white hover:bg-white hover:text-[#000139] transition font-semibold"
                        >
                            Reload page
                        </button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}