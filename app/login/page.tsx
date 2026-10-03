import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ErrorBoundary } from "@/components/login/ErrorBoundary";
import LoginForm from "@/components/login/LoginForm";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();
    return {
        title: t.auth.metaTitle,
        description: t.auth.metaDescription,
        robots: {
            index: false,
            follow: false,
        },
        icons: {
            icon: "/icon.png",
        },
    };
}

export default function AuthPage() {
    return (
        <main className="relative min-h-screen bg-[#f7f9fc]">
            <ErrorBoundary>
                <Suspense fallback={null}>
                    <LoginForm />
                </Suspense>
            </ErrorBoundary>
        </main>
    );
}
