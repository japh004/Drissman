"use client";

import { useAuth } from "@/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Loader2, LayoutDashboard, CalendarDays, TrendingUp, User, LogOut, Car } from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/candidat", icon: LayoutDashboard },
    { name: "Mon Planning", href: "/candidat/planning", icon: CalendarDays },
    { name: "Ma Progression", href: "/candidat/progression", icon: TrendingUp },
    { name: "Mon Profil", href: "/candidat/profile", icon: User },
];

export default function CandidatLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== "CANDIDAT")) {
            router.replace("/login");
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !isAuthenticated || user?.role !== "CANDIDAT") {
        return <div className="min-h-screen bg-asphalt flex items-center justify-center"><Loader2 className="h-10 w-10 text-signal animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-asphalt">
            {/* Top nav */}
            <header className="sticky top-0 z-30 bg-asphalt/80 backdrop-blur-lg border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/candidat" className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-signal to-amber-400 p-2 rounded-xl">
                            <Car className="h-4 w-4 text-asphalt" />
                        </div>
                        <span className="text-sm font-black text-snow">DRISS<span className="text-signal">MAN</span></span>
                    </Link>
                    <nav className="hidden sm:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive ? "bg-signal/10 text-signal" : "text-mist hover:text-snow"}`}>
                                    <item.icon className="h-3.5 w-3.5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <button onClick={() => { logout(); router.push("/"); }}
                        className="p-2 rounded-xl text-mist hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </header>
            <main className="max-w-6xl mx-auto p-6">{children}</main>
        </div>
    );
}
