import type { Metadata } from 'next';
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
        <main className="relative min-h-screen bg-[#000139] overflow-hidden">
            <ErrorBoundary>
                <LoginForm />
            </ErrorBoundary>
        </main>
    );
}
