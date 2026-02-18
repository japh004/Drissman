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
        },
        {
            label: "Sessions en cours",
            value: activePeriods.length,
            icon: GraduationCap,
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10 border-emerald-500/20",
        },
        {
            label: "Cours du jour",
            value: todayLessons.length,
            icon: BookOpen,
            color: "text-signal",
            bgColor: "bg-signal/10 border-signal/20",
        },
    ];

    return (
        <div className="space-y-8">
            {/* ═══ Simple Welcome Header ═══ */}
            <div>
                <h1 className="text-3xl font-black text-snow">Bonjour, {user.firstName}</h1>
                <p className="text-mist mt-1 font-medium italic">
                    {activePeriods.length} session(s) active(s) · {activeStudents} élève(s) inscrit(s)
                </p>
            </div>

            {/* ═══ Focused KPI Grid ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl ${kpi.bgColor} border flex items-center justify-center`}>
                            <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-snow tracking-tight">
                                {kpi.value}
                            </div>
                            <div className="text-[10px] font-black text-mist uppercase tracking-widest">
                                {kpi.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══ Main Focus: Active Sessions & Schedule ═══ */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Active Sessions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-mist uppercase tracking-widest">Sessions Actives</h3>
                        <Link href="/dashboard/training-periods" className="text-xs font-bold text-signal hover:underline">Gérer</Link>
                    </div>

                    {activePeriods.length === 0 ? (
                        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-8 text-center">
                            <GraduationCap className="h-8 w-8 text-mist/20 mx-auto mb-2" />
                            <p className="text-xs text-mist">Aucune session en cours</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {activePeriods.slice(0, 3).map((period) => (
                                <Link
                                    key={period.id}
                                    href={`/dashboard/training-periods/${period.id}/planning`}
                                    className="p-4 rounded-xl bg-white/[0.04] border border-white/5 hover:border-signal/20 transition-all flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-bold text-snow text-sm group-hover:text-signal transition-colors">{period.name}</div>
                                        <div className="text-[10px] text-mist mt-1">{period.enrolledCount || 0} inscrits / {period.maxStudents || 30}</div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-mist group-hover:text-signal" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Today's Schedule */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-mist uppercase tracking-widest">Planning du Jour</h3>
                        <Link href="/dashboard/planning" className="text-xs font-bold text-signal hover:underline">Voir tout</Link>
                    </div>

                    {todayLessons.length === 0 ? (
                        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-8 text-center">
                            <Calendar className="h-8 w-8 text-mist/20 mx-auto mb-2" />
                            <p className="text-xs text-mist">Rien au planning aujourd'hui</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {todayLessons.map((lesson) => (
                                <div key={lesson.id} className="p-4 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-4">
                                    <div className="text-xs font-black text-signal tabular-nums">
                                        {lesson.startTime?.slice(0, 5)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-snow text-sm truncate">{lesson.topic}</div>
                                        <div className="text-[10px] text-mist truncate">Moniteur: {lesson.monitorName || "TBD"}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
