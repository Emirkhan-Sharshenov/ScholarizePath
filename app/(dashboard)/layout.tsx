import Sidebar from "@/components/dashboard/Sidebar"
import PageTransition from "@/components/dashboard/PageTransition"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1">
                <PageTransition>{children}</PageTransition>
            </main>
        </div>
    );
}