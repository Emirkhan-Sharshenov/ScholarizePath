import { ErrorBoundary } from "@/components/login/ErrorBoundary";
import LoginForm from "@/components/login/LoginForm"; // adjust path to match where LoginForm actually lives

export default function AuthPage() {
    return (
        <main className="relative min-h-screen bg-[#000139] overflow-hidden">
            <ErrorBoundary>
                <LoginForm />
            </ErrorBoundary>
        </main>
    );
}