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
    Tag,
    Clock,
    School,
    HelpCircle,
    Gift,
    Eye,
    Search,
    BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/hooks";
import { QuickAddDialog } from "./quick-add-dialog";

const partnerNavigation = [
    { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
    { name: "Réservations", href: "/dashboard/bookings", icon: Users },
    { name: "Moniteurs", href: "/dashboard/monitors", icon: Users },
    { name: "Offres", href: "/dashboard/offers", icon: Tag },
    { name: "Mon Auto-école", href: "/dashboard/school", icon: School },
    { name: "Disponibilités", href: "/dashboard/availabilities", icon: Clock },
    { name: "Planning Conduite", href: "/dashboard/planning", icon: Calendar },
    { name: "Historique Conduite", href: "/dashboard/sessions", icon: FileText },
    { name: "Cours de Code", href: "/dashboard/theory", icon: FileText },
    { name: "Programme", href: "/dashboard/curriculum", icon: BookOpen },
    { name: "Factures", href: "/dashboard/invoices", icon: FileText },
    { name: "Aide & Support", href: "/dashboard/help", icon: HelpCircle },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

const studentNavigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes Réservations", href: "/dashboard/bookings", icon: Calendar },
    { name: "Récompenses", href: "/dashboard/rewards", icon: Gift },
    { name: "Mes Factures", href: "/dashboard/invoices", icon: FileText },
    { name: "Aide & Support", href: "/dashboard/help", icon: HelpCircle },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

const visitorNavigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Explorer", href: "/", icon: Search },
    { name: "Aide & Support", href: "/dashboard/help", icon: HelpCircle },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

const monitorNavigation = [
    { name: "Mon Planning", href: "/dashboard/monitor", icon: Calendar },
    { name: "Aide & Support", href: "/dashboard/help", icon: HelpCircle },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
    const { user, logout } = useAuth();
    const isPartner = user?.role === 'SCHOOL_ADMIN';
    const isVisitor = user?.role === 'VISITOR';
    const isMonitor = user?.role === 'MONITOR';
    const navigation = isPartner ? partnerNavigation : isMonitor ? monitorNavigation : isVisitor ? visitorNavigation : studentNavigation;

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-asphalt border-r border-white/5 text-snow hidden md:flex flex-col h-full">
                <div className="p-6">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-signal/30 to-signal/10 border border-signal/30 flex items-center justify-center">
                            <span className="text-signal font-black text-sm">D</span>
                        </div>
                        <span className="text-lg font-black tracking-tight">
                            <span className="text-signal">DRISS</span><span className="text-snow">MAN</span>
                        </span>
                    </div>
                    <p className="text-xs text-mist mt-2 font-bold uppercase tracking-wider">
                        {isPartner ? "Espace Auto-École" : isMonitor ? "Espace Moniteur" : isVisitor ? "Espace Visiteur" : "Espace Candidat"}
                    </p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {isPartner && <QuickAddDialog />}
                    <NavLinks navigation={navigation} />
                </nav>

                <div className="p-4 border-t border-white/5 space-y-2">
                    {!isPartner && (
                        <Link
                            href="/"
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-mist hover:text-snow hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <LayoutDashboard className="mr-3 h-5 w-5 rotate-180" />
                            Retour au site
                        </Link>
                    )}
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-mist hover:text-snow hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Déconnexion
                    </button>
                </div>
            </aside>
        </>
    );
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const isPartner = user?.role === 'SCHOOL_ADMIN';
    const isVisitor = user?.role === 'VISITOR';
    const isMonitor = user?.role === 'MONITOR';
    const navigation = isPartner ? partnerNavigation : isMonitor ? monitorNavigation : isVisitor ? visitorNavigation : studentNavigation;

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
                </div>
                <nav className="px-4 space-y-1">
                    {isPartner && <div className="mb-4"><QuickAddDialog /></div>}
                    <NavLinks navigation={navigation} onClick={() => setOpen(false)} />
                </nav>
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    {!isPartner && (
                        <Link
                            href="/"
                            onClick={() => setOpen(false)}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-mist hover:text-snow hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <LayoutDashboard className="mr-3 h-5 w-5 rotate-180" />
                            Retour au site
                        </Link>
                    )}
                    <button
                        onClick={() => {
                            logout();
                            setOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-mist hover:text-snow hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Déconnexion
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function NavLinks({ navigation, onClick }: { navigation: any[], onClick?: () => void }) {
    const pathname = usePathname();

    return (
        <>
            {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClick}
                        className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                            isActive
                                ? "bg-signal/10 text-signal border border-signal/20"
                                : "text-mist hover:bg-white/5 hover:text-snow"
                        )}
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                    </Link>
                );
            })}
        </>
    )
}
