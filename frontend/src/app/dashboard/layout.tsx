"use client";

import { DashboardSidebar, MobileSidebar } from "@/components/dashboard/dashboard-sidebar";
import { useAuth } from "@/hooks";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "JD";

    return (
        <div className="flex h-screen bg-charcoal">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                <header className="bg-asphalt border-b border-white/5 h-16 flex items-center px-6 justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4 md:hidden">
                        <MobileSidebar />
                        <span className="font-bold text-signal">
                            {user?.role === 'SCHOOL_ADMIN' ? "Drissman Pro" : "Drissman"}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <ThemeToggle />
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-medium text-snow">
                                {user?.firstName} {user?.lastName}
                            </div>
                            <div className="text-xs text-mist">
                                {user?.role === 'SCHOOL_ADMIN' ? "Gestionnaire Auto-École" : user?.role === 'MONITOR' ? "Moniteur" : user?.role === 'VISITOR' ? "Visiteur" : "Candidat"}
                            </div>
                        </div>
                        <div className="h-9 w-9 bg-signal/10 rounded-full flex items-center justify-center text-signal font-bold border border-signal/20">
                            {initials}
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
