"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    LogOut,
    FileText,
    Menu,
    School,
    BookOpen,
    GraduationCap,
    UserCheck,
    Search,
    Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/hooks";
import { QuickAddDialog } from "./quick-add-dialog";

// ─── Admin (SCHOOL_ADMIN) ───
const adminNavigation = [
    { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
    { name: "Formations", href: "/dashboard/offers", icon: GraduationCap },
    { name: "Périodes", href: "/dashboard/training-periods", icon: Calendar },
    { name: "Cours", href: "/dashboard/planning", icon: BookOpen },
    { name: "Élèves", href: "/dashboard/bookings", icon: Users },
    { name: "Moniteurs", href: "/dashboard/monitors", icon: UserCheck },
    { name: "Mon Auto-école", href: "/dashboard/school", icon: School },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

// ─── Étudiant ───
const studentNavigation = [
    { name: "Mon Parcours", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mon Planning", href: "/dashboard/bookings", icon: Calendar },
    { name: "Mes Cours", href: "/dashboard/theory", icon: BookOpen },
    { name: "Mes Factures", href: "/dashboard/invoices", icon: FileText },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

// ─── Moniteur ───
const monitorNavigation = [
    { name: "Mon Planning", href: "/dashboard/monitor", icon: Calendar },
    { name: "Mes Élèves", href: "/dashboard/bookings", icon: Users },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

// ─── Visiteur ───
const visitorNavigation = [
    { name: "Accueil", href: "/dashboard", icon: LayoutDashboard },
    { name: "Explorer", href: "/", icon: Search },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

function getNavigation(role?: string) {
    switch (role) {
        case "SCHOOL_ADMIN": return adminNavigation;
        case "MONITOR": return monitorNavigation;
        case "VISITOR": return visitorNavigation;
        default: return studentNavigation;
    }
}

function getRoleLabel(role?: string) {
    switch (role) {
        case "SCHOOL_ADMIN": return "Espace Auto-École";
        case "MONITOR": return "Espace Moniteur";
        case "VISITOR": return "Espace Visiteur";
        default: return "Espace Candidat";
    }
}

export function DashboardSidebar() {
    const { user, logout } = useAuth();
    const navigation = getNavigation(user?.role);
    const isAdmin = user?.role === "SCHOOL_ADMIN";

    return (
        <aside className="w-64 bg-asphalt border-r border-white/5 text-snow hidden md:flex flex-col h-full">
            {/* Logo */}
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-signal/30 to-signal/10 border border-signal/30 flex items-center justify-center">
                        <span className="text-signal font-black text-sm">D</span>
                    </div>
                    <span className="text-lg font-black tracking-tight">
                        <span className="text-signal">DRISS</span><span className="text-snow">MAN</span>
                    </span>
                </div>
                <p className="text-[10px] text-mist mt-2 font-black uppercase tracking-[0.2em]">
                    {getRoleLabel(user?.role)}
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {isAdmin && <QuickAddDialog />}
                <NavLinks navigation={navigation} />
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 space-y-1">
                {!isAdmin && (
                    <Link
                        href="/"
                        className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-mist hover:text-snow hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <Tag className="mr-3 h-4 w-4" />
                        Retour au site
                    </Link>
                )}
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-mist hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-colors"
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigation = getNavigation(user?.role);
    const isAdmin = user?.role === "SCHOOL_ADMIN";

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="md:hidden p-2 text-snow hover:text-signal transition-colors">
                    <Menu className="h-6 w-6" />
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-asphalt text-snow border-none w-64">
                <div className="p-6">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-signal/30 to-signal/10 border border-signal/30 flex items-center justify-center">
                            <span className="text-signal font-black text-sm">D</span>
                        </div>
                        <span className="text-lg font-black tracking-tight">
                            <span className="text-signal">DRISS</span><span className="text-snow">MAN</span>
                        </span>
                    </div>
                    <p className="text-[10px] text-mist mt-2 font-black uppercase tracking-[0.2em]">
                        {getRoleLabel(user?.role)}
                    </p>
                </div>
                <nav className="px-4 space-y-1">
                    {isAdmin && <div className="mb-4"><QuickAddDialog /></div>}
                    <NavLinks navigation={navigation} onClick={() => setOpen(false)} />
                </nav>
                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                    {!isAdmin && (
                        <Link
                            href="/"
                            onClick={() => setOpen(false)}
                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-mist hover:text-snow hover:bg-white/5 rounded-xl transition-colors"
                        >
                            <Tag className="mr-3 h-4 w-4" />
                            Retour au site
                        </Link>
                    )}
                    <button
                        onClick={() => { logout(); setOpen(false); }}
                        className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-mist hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-colors"
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        Déconnexion
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function NavLinks({ navigation, onClick }: { navigation: typeof adminNavigation; onClick?: () => void }) {
    const pathname = usePathname();

    return (
        <>
            {navigation.map((item) => {
                const isActive = pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClick}
                        className={cn(
                            "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                            isActive
                                ? "bg-signal/10 text-signal border border-signal/20 shadow-[0_0_20px_rgba(255,193,7,0.05)]"
                                : "text-mist hover:bg-white/5 hover:text-snow"
                        )}
                    >
                        <item.icon className={cn("mr-3 h-4 w-4", isActive && "text-signal")} />
                        {item.name}
                    </Link>
                );
            })}
        </>
    );
}
