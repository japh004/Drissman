"use client";

import { GraduationCap, DollarSign, CalendarDays, Clock, BookOpen, Users2, TrendingUp, Activity, Layers, BarChart3 } from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion";

function StatCard({ title, value, icon: Icon, color, subtitle }: { title: string; value: string | number; icon: React.ElementType; color: string; subtitle?: string }) {
    const colorMap: Record<string, string> = {
        blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400",
        green: "from-green-500/10 to-green-600/5 border-green-500/20 text-green-400",
        signal: "from-signal/10 to-amber-500/5 border-signal/20 text-signal",
        purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400",
        red: "from-red-500/10 to-red-600/5 border-red-500/20 text-red-400",
    };
    const classes = colorMap[color] || colorMap.blue;

    return (
        <div className={`bg-gradient-to-br ${classes} rounded-2xl border p-5`}>
            <Icon className={`h-5 w-5 opacity-60 mb-2`} />
            <p className="text-2xl font-black text-snow">{value}</p>
            <p className="text-xs text-mist/60">{title}</p>
            {subtitle && <p className="text-[10px] text-mist/30 mt-0.5">{subtitle}</p>}
        </div>
    );
}

export default function AdminDashboardPage() {
    // KPIs will be populated from GET /api/admin/stats
    const stats = {
        activeStudents: 0,
        monthlyRevenue: 0,
        todaySessions: 0,
        pendingEnrollments: 0,
    };

    return (
        <PageTransition className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-snow">Tableau de Bord</h1>
                <p className="text-sm text-mist mt-0.5">Vue synthétique de votre auto-école</p>
            </div>

            {/* KPIs */}
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StaggerItem><StatCard title="Élèves actifs" value={stats.activeStudents} icon={GraduationCap} color="blue" subtitle="Inscriptions ACTIVE" /></StaggerItem>
                <StaggerItem><StatCard title="CA Mensuel" value={`${new Intl.NumberFormat("fr-FR").format(stats.monthlyRevenue)} F`} icon={DollarSign} color="green" subtitle="Factures PAID ce mois" /></StaggerItem>
                <StaggerItem><StatCard title="Séances du jour" value={stats.todaySessions} icon={CalendarDays} color="signal" subtitle="Sessions programmées" /></StaggerItem>
                <StaggerItem><StatCard title="En attente" value={stats.pendingEnrollments} icon={Clock} color="purple" subtitle="Inscriptions PENDING" /></StaggerItem>
            </StaggerContainer>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Today's sessions */}
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarDays className="h-4 w-4 text-signal" />
                        <h2 className="text-sm font-bold text-snow">Séances du jour</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CalendarDays className="h-10 w-10 text-mist/20 mb-3" />
                        <p className="text-sm text-mist/50">Aucune séance programmée aujourd&apos;hui</p>
                        <p className="text-[10px] text-mist/30 mt-1">Planifiez des créneaux via la page Planning</p>
                    </div>
                </div>

                {/* Recent activity */}
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-4 w-4 text-signal" />
                        <h2 className="text-sm font-bold text-snow">Activité récente</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Activity className="h-10 w-10 text-mist/20 mb-3" />
                        <p className="text-sm text-mist/50">Aucune activité récente</p>
                        <p className="text-[10px] text-mist/30 mt-1">Les événements apparaîtront ici : inscriptions, paiements, séances...</p>
                    </div>
                </div>
            </div>

            {/* Quick links / Getting started */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                <h2 className="text-sm font-bold text-snow mb-4">🚀 Guide de démarrage</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { step: "1", label: "Créer des modules", href: "/admin/modules", icon: Layers, desc: "Blocs pédagogiques (Code, Conduite...)" },
                        { step: "2", label: "Créer une offre", href: "/admin/offers", icon: BookOpen, desc: "Formule commerciale + modules inclus" },
                        { step: "3", label: "Ajouter un moniteur", href: "/admin/monitors", icon: Users2, desc: "Sous-compte avec login" },
                        { step: "4", label: "Planifier des séances", href: "/admin/planning", icon: CalendarDays, desc: "Créneaux horaires + moniteur" },
                    ].map(item => (
                        <a key={item.step} href={item.href}
                            className="group p-4 rounded-xl border border-white/[0.06] hover:border-signal/20 hover:bg-signal/[0.02] transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-6 w-6 rounded-full bg-signal/10 text-signal text-[10px] font-black flex items-center justify-center">{item.step}</span>
                                <span className="text-sm font-bold text-snow group-hover:text-signal transition-colors">{item.label}</span>
                            </div>
                            <p className="text-[10px] text-mist/40">{item.desc}</p>
                        </a>
                    ))}
                </div>
            </div>
        </PageTransition>
    );
}
