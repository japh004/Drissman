"use client";

import { useAuth } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LayoutDashboard, CalendarDays, Users, CheckCircle, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const monitorNavItems = [
    { name: "Mon Espace", href: "/monitor", icon: LayoutDashboard },
    { name: "Mon Planning", href: "/monitor/sessions", icon: CalendarDays },
    { name: "Mes Élèves", href: "/monitor/students", icon: Users },
    { name: "Évaluations", href: "/monitor/evaluations", icon: CheckCircle },
];

export default function MonitorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'MONITOR')) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'MONITOR') {
        return (
            <div className="min-h-screen bg-asphalt flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-signal animate-spin mb-4" />
                <p className="text-white/60 text-sm">Chargement de l'espace moniteur...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-asphalt flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-asphalt-light border-r border-white/5">
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        Scolarité
                    </span>
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-400/20 text-emerald-400 border border-emerald-400/30">
                        MONITEUR
                    </span>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    {monitorNavItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 group ${isActive
                                        ? "bg-emerald-400/10 text-emerald-400 font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-emerald-400/20"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? "text-emerald-400" : "text-white/40 group-hover:text-white/70"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => logout()}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3 opacity-70" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Toggle & Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="md:hidden h-16 border-b border-white/5 bg-asphalt-light flex items-center justify-between px-4 sticky top-0 z-20">
                    <div className="flex items-center">
                        <span className="text-lg font-bold text-white">Drissman</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 -mr-2 text-white/70 hover:text-white"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </header>

                {/* Mobile Menu Dropdown */}
                {sidebarOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-asphalt-light border-b border-white/5 shadow-xl z-20">
                        <nav className="p-4 space-y-1">
                            {monitorNavItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center px-4 py-3 text-sm rounded-xl ${isActive ? "bg-emerald-400/10 text-emerald-400" : "text-white/70 hover:bg-white/5"
                                            }`}
                                    >
                                        <item.icon className={`h-5 w-5 mr-3 ${isActive ? "text-emerald-400" : "text-white/40"}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}

                <main className="flex-1 overflow-x-hidden p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
