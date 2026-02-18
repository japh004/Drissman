"use client";

import {
    Users,
    TrendingUp,
    Calendar,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Zap,
    GraduationCap,
    BookOpen,
    ChevronRight,
    UserCheck,
    Briefcase,
    Plus,
    Activity,
    Search
} from "lucide-react";
import Link from "next/link";
import { usePartnerStats, usePartnerEnrollments, useTrainingPeriods, useLessons, useAuth } from "@/hooks";
import { formatPrice } from "@/lib/format";

interface PartnerDashboardProps {
    user: any;
}

export function PartnerDashboard({ user }: PartnerDashboardProps) {
    const { stats, loading: statsLoading, error: statsError } = usePartnerStats();
    const { enrollments, loading: enrollmentsLoading } = usePartnerEnrollments(user.schoolId);
    const { periods, loading: periodsLoading } = useTrainingPeriods(user.schoolId);
    const { lessons, loading: lessonsLoading } = useLessons(user.schoolId);

    const isLoading = statsLoading || enrollmentsLoading || periodsLoading || lessonsLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="relative h-24 w-24">
                    <div className="absolute inset-0 rounded-full border-[6px] border-signal/10"></div>
                    <div className="absolute inset-0 rounded-full border-[6px] border-signal border-t-transparent animate-spin"></div>
                    <div className="absolute inset-3 rounded-full border-[6px] border-signal/20 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-signal font-black uppercase tracking-[0.3em] text-[10px]">Initialisation</p>
                    <p className="text-mist text-[9px] font-bold uppercase tracking-widest animate-pulse">Chargement de votre centre de contrôle...</p>
                </div>
            </div>
        );
    }

    const activePeriods = periods.filter(p => p.status === "IN_PROGRESS" || p.status === "PUBLISHED");
    const activeStudents = enrollments.filter(e => e.status === "ACTIVE").length;
    const today = new Date().toISOString().split("T")[0];
    const todayLessons = lessons.filter(l => l.date === today && l.status === "SCHEDULED");
    const recentEnrollments = [...enrollments]
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 5);

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header: Command Center Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-signal/10 border border-signal/20 text-[9px] font-black text-signal uppercase tracking-widest leading-none">
                            Centre de Contrôle Admin
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-mist uppercase tracking-widest leading-none">
                            Version 2.0 (Premium)
                        </span>
                    </div>
                    <h1 className="text-5xl font-black text-snow tracking-tighter uppercase leading-none">
                        Bonjour, <span className="text-signal">{user.firstName}</span>
                    </h1>
                    <p className="text-mist font-medium max-w-lg">
                        Gérez votre auto-école avec précision. Voici l&apos;état actuel de vos activités et de vos revenus.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-snow font-black text-[10px] uppercase tracking-widest hover:bg-signal hover:text-asphalt transition-all group">
                        <Plus className="h-4 w-4" />
                        Nouvelle Session
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-signal text-asphalt font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-signal/80 transition-all shadow-lg shadow-signal/10">
                        <TrendingUp className="h-4 w-4" />
                        Rapports de Vente
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                <StatCard
                    label="Revenu Total"
                    value={formatPrice(stats?.revenue || 0)}
                    trend="+12.5%"
                    trendUp={true}
                    icon={TrendingUp}
                    color="signal"
                />
                <StatCard
                    label="Élèves Actifs"
                    value={activeStudents}
                    trend="+4"
                    trendUp={true}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    label="Sessions Publiées"
                    value={activePeriods.length}
                    trend="Stable"
                    trendUp={true}
                    icon={GraduationCap}
                    color="emerald"
                />
                <StatCard
                    label="Cours du Jour"
                    value={todayLessons.length}
                    trend="Plein"
                    trendUp={true}
                    icon={BookOpen}
                    color="amber"
                />
            </div>

            {/* Main Content Layout */}
            <div className="grid lg:grid-cols-3 gap-8 px-4">
                {/* Left Column: Sessions & Schedule */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Sessions Journey */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 -m-20 h-64 w-64 bg-signal/5 blur-[100px] rounded-full group-hover:bg-signal/10 transition-colors" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-xl font-black text-snow tracking-tight uppercase italic">Sessions en <span className="text-signal">Vigueur</span></h3>
                            <Link href="/dashboard/training-periods" className="text-[10px] font-black text-mist uppercase tracking-widest hover:text-signal flex items-center gap-1 transition-colors">
                                Tout voir <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>

                        {activePeriods.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                <Activity className="h-12 w-12 text-mist/10 mx-auto mb-4" />
                                <p className="text-mist font-bold italic uppercase text-xs tracking-widest">Aucune session active enregistrée</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 relative z-10">
                                {activePeriods.slice(0, 3).map((period) => (
                                    <Link
                                        key={period.id}
                                        href={`/dashboard/training-periods/${period.id}/planning`}
                                        className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.06] hover:border-signal/20 transition-all duration-300 group/item"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-signal/10 border border-signal/20 flex items-center justify-center text-signal group-hover/item:scale-110 transition-transform">
                                                <Briefcase className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-snow text-lg leading-tight group-hover/item:text-signal transition-colors">{period.name}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] font-black text-mist uppercase tracking-widest">
                                                    <span>{period.enrolledCount || 0} Inscrits</span>
                                                    <span className="h-1 w-1 rounded-full bg-white/20" />
                                                    <span>{period.maxStudents || 30} Max</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-xs font-black text-snow uppercase">{Math.round(((period.enrolledCount || 0) / (period.maxStudents || 30)) * 100)}%</div>
                                                <div className="text-[8px] font-black text-mist uppercase tracking-tighter">Remplissage</div>
                                            </div>
                                            <div className="h-10 w-24 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-signal transition-all duration-1000"
                                                    style={{ width: `${((period.enrolledCount || 0) / (period.maxStudents || 30)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <QuickLink icon={Calendar} label="Planning" href="/dashboard/schedule" color="bg-blue-500" />
                        <QuickLink icon={UserCheck} label="Moniteurs" href="/dashboard/monitors" color="bg-emerald-500" />
                        <QuickLink icon={Users} label="Inscriptions" href="/dashboard/bookings" color="bg-amber-500" />
                        <QuickLink icon={Settings} label="Paramètres" href="/dashboard/settings" color="bg-purple-500" />
                    </div>
                </div>

                {/* Right Column: Recent Activity & Staff */}
                <div className="space-y-8">
                    {/* Activity Feed */}
                    <div className="bg-asphalt border border-white/10 rounded-[3rem] p-8">
                        <h3 className="text-sm font-black text-snow uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-signal" />
                            Dernières Activités
                        </h3>

                        <div className="space-y-6 relative">
                            <div className="absolute left-6 top-2 bottom-6 w-px bg-white/5" />

                            {recentEnrollments.length === 0 ? (
                                <p className="text-mist text-xs italic text-center py-10">Aucune activité récente</p>
                            ) : (
                                recentEnrollments.map((enrollment, idx) => (
                                    <div key={enrollment.id} className="relative flex gap-6 group">
                                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-signal/20 group-hover:border-signal/30 transition-all z-10">
                                            <Users className="h-5 w-5 text-mist group-hover:text-signal" />
                                        </div>
                                        <div className="pt-1 min-w-0">
                                            <p className="text-xs text-snow font-black leading-tight truncate">
                                                Nouvelle inscription : <span className="text-signal">{enrollment.offerName}</span>
                                            </p>
                                            <p className="text-[10px] text-mist font-bold mt-1 uppercase tracking-wider">
                                                Il y a {idx + 1} heure(s)
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Link
                            href="/dashboard/bookings"
                            className="mt-10 w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-mist uppercase tracking-widest hover:text-snow hover:bg-white/10 transition-all block text-center"
                        >
                            Voir l&apos;historique complet
                        </Link>
                    </div>

                    {/* Support / Quick Help Card */}
                    <div className="p-8 rounded-[3rem] bg-gradient-to-br from-signal/20 via-signal/5 to-transparent border border-signal/10 text-center">
                        <div className="h-16 w-16 rounded-[2rem] bg-asphalt border border-signal/20 flex items-center justify-center text-signal mx-auto mb-6">
                            <Activity className="h-8 w-8 animate-pulse" />
                        </div>
                        <h4 className="text-lg font-black text-snow mb-2 tracking-tight">Support Drissman Pro</h4>
                        <p className="text-mist text-xs font-medium mb-6 leading-relaxed">Besoin d&apos;aide pour gérer votre catalogue ou vos moniteurs ? Notre équipe est disponible 24/7.</p>
                        <button className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-snow font-black uppercase text-[10px] tracking-widest hover:bg-signal hover:text-asphalt transition-all">
                            Contacter l&apos;assistance
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, trendUp, icon: Icon, color }: any) {
    const colorMap: any = {
        signal: "bg-signal/10 border-signal/20 text-signal",
        blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        amber: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    };

    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.05] hover:border-white/10 transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-6">
                <div className={`h-14 w-14 rounded-2xl ${colorMap[color]} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7" />
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${trendUp ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-1`}>
                        {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {trend}
                    </span>
                    <span className="text-[8px] text-mist font-bold uppercase tracking-tighter mt-0.5">Ce mois</span>
                </div>
            </div>
            <div>
                <div className="text-4xl font-black text-snow tracking-tighter leading-none mb-2">{value}</div>
                <div className="text-[10px] font-black text-mist uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );
}

function QuickLink({ icon: Icon, label, href, color }: any) {
    return (
        <Link
            href={href}
            className="group flex flex-col items-center gap-3 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all"
        >
            <div className={`h-12 w-12 rounded-2xl ${color}/10 border ${color}/20 border flex items-center justify-center ${color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black text-mist group-hover:text-snow uppercase tracking-widest text-center">{label}</span>
        </Link>
    );
}
