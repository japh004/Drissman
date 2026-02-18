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
} from "lucide-react";
import Link from "next/link";
import { usePartnerStats, usePartnerEnrollments, useTrainingPeriods, useLessons, useAuth } from "@/hooks";

interface PartnerDashboardProps {
    user: any;
}

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    PUBLISHED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    IN_PROGRESS: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    COMPLETED: "text-signal bg-signal/10 border-signal/20",
    CANCELLED: "text-red-400 bg-red-500/10 border-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Brouillon",
    PUBLISHED: "Publié",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminé",
    CANCELLED: "Annulé",
};

export function PartnerDashboard({ user }: PartnerDashboardProps) {
    const { stats, loading: statsLoading, error: statsError } = usePartnerStats();
    const { enrollments, loading: enrollmentsLoading } = usePartnerEnrollments(user.schoolId);
    const { periods, loading: periodsLoading } = useTrainingPeriods(user.schoolId);
    const { lessons, loading: lessonsLoading } = useLessons(user.schoolId);

    const isLoading = statsLoading || enrollmentsLoading || periodsLoading || lessonsLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-4 border-signal/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-signal border-t-transparent animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-signal/20 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-mist font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Chargement des données...</p>
            </div>
        );
    }

    if (statsError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-500/5 rounded-[2rem] border border-red-500/10 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-black text-snow mb-2">Erreur de chargement</h3>
                <p className="text-mist max-w-sm mb-6">{statsError}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl text-xs uppercase">
                    Réessayer
                </button>
            </div>
        );
    }

    // ─── Computed data ───
    const activePeriods = periods.filter(p => p.status === "IN_PROGRESS" || p.status === "PUBLISHED");
    const activeStudents = enrollments.filter(e => e.status === "ACTIVE").length;
    const pendingEnrollments = enrollments.filter(e => e.status === "PENDING").length;

    const today = new Date().toISOString().split("T")[0];
    const todayLessons = lessons.filter(l => l.date === today && l.status === "SCHEDULED");
    const upcomingLessons = lessons
        .filter(l => l.date >= today && l.status === "SCHEDULED")
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
        .slice(0, 5);

    const kpis = [
        {
            label: "Élèves actifs",
            value: activeStudents,
            icon: Users,
            color: "text-blue-400",
            bgColor: "bg-blue-500/10 border-blue-500/20",
            suffix: "",
            growth: stats?.enrollmentGrowth,
        },
        {
            label: "Périodes actives",
            value: activePeriods.length,
            icon: GraduationCap,
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10 border-emerald-500/20",
            suffix: "",
        },
        {
            label: "Cours aujourd'hui",
            value: todayLessons.length,
            icon: BookOpen,
            color: "text-signal",
            bgColor: "bg-signal/10 border-signal/20",
            suffix: "",
        },
        {
            label: "Revenu mensuel",
            value: stats?.revenue || "0",
            icon: TrendingUp,
            color: "text-purple-400",
            bgColor: "bg-purple-500/10 border-purple-500/20",
            suffix: " FCFA",
            growth: stats?.revenueGrowth,
        },
    ];

    return (
        <div className="space-y-8">
            {/* ═══ Welcome Banner ═══ */}
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-signal/15 via-blue-500/10 to-purple-500/10" />
                <div className="absolute top-6 right-6 w-32 h-32 bg-signal/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-12 w-12 rounded-2xl bg-signal/20 border border-signal/30 flex items-center justify-center shadow-lg shadow-signal/10">
                                <Zap className="h-6 w-6 text-signal" />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                                En ligne
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-snow tracking-tight">
                            Bonjour, {user.firstName} !
                        </h2>
                        <p className="text-mist mt-2 max-w-lg font-medium">
                            {todayLessons.length > 0
                                ? `${todayLessons.length} cours programmé${todayLessons.length > 1 ? 's' : ''} aujourd'hui · ${activeStudents} élèves actifs.`
                                : `${activeStudents} élèves actifs · ${activePeriods.length} période${activePeriods.length > 1 ? 's' : ''} en cours.`}
                        </p>
                    </div>
                    {pendingEnrollments > 0 && (
                        <Link
                            href="/dashboard/bookings"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-widest hover:bg-orange-500/20 transition-all"
                        >
                            <Clock className="h-4 w-4" />
                            {pendingEnrollments} inscription{pendingEnrollments > 1 ? 's' : ''} en attente
                            <ChevronRight className="h-3 w-3" />
                        </Link>
                    )}
                </div>
            </div>

            {/* ═══ KPI Grid ═══ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-white/[0.07] backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`h-10 w-10 rounded-xl ${kpi.bgColor} border flex items-center justify-center`}>
                                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                            </div>
                            {kpi.growth !== undefined && (
                                <div className={`flex items-center gap-1 text-xs font-bold ${kpi.growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    {kpi.growth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {Math.abs(kpi.growth)}%
                                </div>
                            )}
                        </div>
                        <div className="text-2xl font-black text-snow tracking-tight">
                            {kpi.value}{kpi.suffix}
                        </div>
                        <div className="text-[10px] font-black text-mist uppercase tracking-widest mt-1">
                            {kpi.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══ Two-Column Layout ═══ */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Upcoming Lessons */}
                <div className="lg:col-span-3 bg-white/[0.07] backdrop-blur-md border border-white/5 rounded-[2rem] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-snow">Prochains cours</h3>
                            <p className="text-[10px] text-mist font-black uppercase tracking-widest mt-1">Planning de la semaine</p>
                        </div>
                        <Link
                            href="/dashboard/planning"
                            className="text-[10px] font-black text-signal uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                            Tout voir <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {upcomingLessons.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="h-10 w-10 text-mist/30 mx-auto mb-3" />
                            <p className="text-mist font-bold text-sm">Aucun cours à venir</p>
                            <p className="text-mist/60 text-xs mt-1">Planifiez des cours depuis une période de formation.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingLessons.map((lesson) => (
                                <div key={lesson.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all group/item">
                                    {/* Date Badge */}
                                    <div className="flex-shrink-0 text-center">
                                        <div className="text-[10px] font-black text-signal uppercase tracking-widest">
                                            {new Date(lesson.date).toLocaleDateString("fr-FR", { weekday: "short" })}
                                        </div>
                                        <div className="text-xl font-black text-snow">
                                            {new Date(lesson.date).getDate()}
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-10 w-px bg-white/10" />

                                    {/* Lesson Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-snow text-sm truncate">
                                            {lesson.topic || lesson.moduleName || "Cours"}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-mist mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {lesson.startTime?.slice(0, 5)} - {lesson.endTime?.slice(0, 5)}
                                            </span>
                                            {lesson.monitorName && (
                                                <span className="flex items-center gap-1">
                                                    <UserCheck className="h-3 w-3" />
                                                    {lesson.monitorName}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Enrolled */}
                                    <div className="flex-shrink-0 text-right">
                                        <div className="text-xs font-bold text-mist">
                                            {lesson.enrolledCount}/{lesson.capacity}
                                        </div>
                                        <div className="text-[10px] text-mist/60">inscrits</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Periods */}
                <div className="lg:col-span-2 bg-white/[0.07] backdrop-blur-md border border-white/5 rounded-[2rem] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-snow">Périodes actives</h3>
                            <p className="text-[10px] text-mist font-black uppercase tracking-widest mt-1">Formations en cours</p>
                        </div>
                        <Link
                            href="/dashboard/training-periods"
                            className="text-[10px] font-black text-signal uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                            Gérer <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {activePeriods.length === 0 ? (
                        <div className="text-center py-12">
                            <GraduationCap className="h-10 w-10 text-mist/30 mx-auto mb-3" />
                            <p className="text-mist font-bold text-sm">Aucune période active</p>
                            <Link
                                href="/dashboard/training-periods"
                                className="inline-block mt-3 text-xs font-bold text-signal hover:underline"
                            >
                                Créer une période →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activePeriods.slice(0, 4).map((period) => {
                                const spotsUsed = period.enrolledCount || 0;
                                const maxSpots = period.maxStudents || 30;
                                const spotsPercent = Math.min((spotsUsed / maxSpots) * 100, 100);

                                return (
                                    <Link
                                        key={period.id}
                                        href={`/dashboard/training-periods/${period.id}/planning`}
                                        className="block p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-bold text-snow text-sm truncate flex-1">{period.name}</h4>
                                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[period.status]}`}>
                                                {STATUS_LABELS[period.status]}
                                            </span>
                                        </div>

                                        {period.offerName && (
                                            <div className="text-[10px] text-mist font-bold uppercase tracking-widest mb-2">
                                                {period.offerName}
                                            </div>
                                        )}

                                        {/* Capacity bar */}
                                        <div className="mt-2">
                                            <div className="flex justify-between text-[10px] font-bold text-mist mb-1">
                                                <span>{spotsUsed}/{maxSpots} inscrits</span>
                                                <span className={spotsPercent >= 90 ? "text-red-400" : spotsPercent >= 70 ? "text-orange-400" : "text-emerald-400"}>
                                                    {Math.round(spotsPercent)}%
                                                </span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${spotsPercent >= 90 ? "bg-red-400" : spotsPercent >= 70 ? "bg-orange-400" : "bg-emerald-400"}`}
                                                    style={{ width: `${spotsPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ Quick Links ═══ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Formations", href: "/dashboard/offers", icon: GraduationCap, desc: "Gérer les offres" },
                    { label: "Moniteurs", href: "/dashboard/monitors", icon: UserCheck, desc: "Équipe pédagogique" },
                    { label: "Périodes", href: "/dashboard/training-periods", icon: Calendar, desc: "Cohortes actives" },
                    { label: "Planning", href: "/dashboard/planning", icon: BookOpen, desc: "Vue des cours" },
                ].map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="group p-5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-signal/20 hover:bg-white/[0.08] transition-all"
                    >
                        <item.icon className="h-6 w-6 text-mist group-hover:text-signal transition-colors mb-3" />
                        <div className="font-bold text-snow text-sm group-hover:text-signal transition-colors">{item.label}</div>
                        <div className="text-[10px] text-mist font-bold uppercase tracking-widest mt-1">{item.desc}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
