import Sidebar from "@/components/dashboard/Sidebar"
import PageTransition from "@/components/dashboard/PageTransition"
import MainContent from "@/components/dashboard/MainContent"
import { SidebarProvider } from "@/components/dashboard/SidebarContext"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full overflow-x-hidden bg-[rgb(252,253,255)]">
                <Sidebar />
                <MainContent>
                    <PageTransition>{children}</PageTransition>
                </MainContent>
            </div>
        </SidebarProvider>
    );
}