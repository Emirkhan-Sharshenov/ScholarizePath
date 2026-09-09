import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ErrorBoundary } from "@/components/login/ErrorBoundary";
import LoginForm from "@/components/login/LoginForm";

export const metadata: Metadata = {
    title: "Sign In — ScholarizePath",
    description: "Sign in to ScholarizePath",
    robots: {
        index: false,
        follow: false,
    },
    icons: {
        icon: "/icon.png",
    },
};

export default function AuthPage() {
    return (
        <main className="relative min-h-screen bg-navy overflow-hidden">
            <ErrorBoundary>
                <Suspense fallback={null}>
                    <LoginForm />
                </Suspense>
            </ErrorBoundary>
        </main>
    );
}
