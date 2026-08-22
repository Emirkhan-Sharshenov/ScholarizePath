import Sidebar from "@/components/dashboard/Sidebar"
import PageTransition from "@/components/dashboard/PageTransition"
import MainContent from "@/components/dashboard/MainContent"
import { SidebarProvider } from "@/components/dashboard/SidebarContext"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex">
                <Sidebar />
                <MainContent>
                    <PageTransition>{children}</PageTransition>
                </MainContent>
            </div>
        </SidebarProvider>
    );
}