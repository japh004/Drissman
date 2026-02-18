"use client";

import {
    Calendar,
    Clock,
    BookOpen,
    ArrowRight,
    Loader2,
    GraduationCap,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    ChevronRight,
    UserCheck,
    Map
} from "lucide-react";
import Link from "next/link";
import { useAuth, useStudentPortal } from "@/hooks";

export function StudentDashboard() {
    const { user } = useAuth();
    const { data, loading, error } = useStudentPortal();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-4 border-signal/10 transition-all duration-700"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-signal border-t-transparent animate-spin"></div>
                </div>
                <p className="text-mist font-black animate-pulse uppercase tracking-[0.2em] text-[10px]">Chargement de votre académie...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-500/5 rounded-[2rem] border border-red-500/10 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-black text-snow mb-2">Connexion interrompue</h3>
                <p className="text-mist max-w-sm mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-400 text-asphalt font-black rounded-xl text-[10px] uppercase tracking-widest transition-all hover:bg-red-500">
                    Réessayer
                </button>
            </div>
        );
    }

    const { session, curriculum, upcomingSchedule, summary } = data || {
        session: null,
        curriculum: [],
        upcomingSchedule: [],
        summary: { overallProgress: 0, totalHoursConsumed: 0, totalHoursPurchased: 0, nextExamDate: null }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* ═══ Header Stratégique ═══ */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border border-white/5 bg-white/[0.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-signal/10 via-blue-500/5 to-transparent" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-signal/20 border border-signal/30 flex items-center justify-center shadow-lg shadow-signal/10">
                                <GraduationCap className="h-6 w-6 text-signal" />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                {session ? "En formation" : "Candidat Libre"}
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-snow tracking-tight leading-tight">
                            Bonjour, {user?.firstName}
                        </h1>
                        <p className="text-mist mt-3 max-w-lg font-medium text-lg italic">
                            {session
                                ? `Vous êtes actuellement dans la session "${session.name}".`
                                : "Votre parcours n'a pas encore commencé. Rejoignez une session pour débloquer votre programme."}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {session ? (
                            <Link href="/dashboard/curriculum" className="px-8 py-4 rounded-2xl bg-signal text-asphalt font-black uppercase tracking-widest text-xs hover:bg-signal/80 transition-all flex items-center justify-center gap-2 shadow-lg shadow-signal/20">
                                Continuer mon parcours
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link href="/dashboard/bookings" className="px-8 py-4 rounded-2xl bg-snow text-asphalt font-black uppercase tracking-widest text-xs hover:bg-signal transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10">
                                Trouver une session
                                <Plus className="h-4 w-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Mes Métriques ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    label="Progression du Programme"
                    value={`${summary.overallProgress}%`}
                    icon={TrendingUp}
                    color="text-signal"
                    progress={summary.overallProgress}
                />
                <MetricCard
                    label="Heures Consommées"
                    value={`${summary.totalHoursConsumed}H`}
                    icon={Clock}
                    color="text-blue-400"
                    progress={(summary.totalHoursConsumed / (summary.totalHoursPurchased || 1)) * 100}
                    subLabel={`sur ${summary.totalHoursPurchased}H totales`}
                />
                <MetricCard
                    label="Prochaine Étape"
                    value={summary.nextExamDate ? new Date(summary.nextExamDate).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' }) : "Formation"}
                    icon={CheckCircle2}
                    color="text-emerald-400"
                    subLabel={summary.nextExamDate ? "Examen prévu" : "En cours"}
                />
            </div>

            {/* ═══ Main Split: Curriculum Preview & Schedule ═══ */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* ── Curriculum Preview ── */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-mist uppercase tracking-widest flex items-center gap-2">
                            <Map className="h-4 w-4 text-signal" />
                            Ma Progression Modulaire
                        </h3>
                        <Link href="/dashboard/curriculum" className="text-[10px] font-black text-signal uppercase hover:underline">Voir tout</Link>
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-2 space-y-1">
                        {curriculum.length === 0 ? (
                            <div className="py-12 text-center">
                                <BookOpen className="h-10 w-10 text-mist/20 mx-auto mb-3" />
                                <p className="text-xs text-mist font-bold italic">Aucun programme actif</p>
                            </div>
                        ) : (
                            curriculum.slice(0, 4).map((mod, idx) => (
                                <div key={mod.id} className="flex items-center gap-4 p-5 rounded-3xl hover:bg-white/[0.04] transition-all group">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-xs text-mist group-hover:border-signal/30 group-hover:text-signal transition-all">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-snow text-sm truncate">{mod.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-signal/60 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(mod.consumedHours / mod.totalHours) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-black text-mist uppercase">{mod.consumedHours}/{mod.totalHours}H</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-mist/20 group-hover:text-signal transition-all" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── Upcoming Schedule ── */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-mist uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            Mon Emploi du Temps
                        </h3>
                        <Link href="/dashboard/schedule" className="text-[10px] font-black text-blue-400 uppercase hover:underline">Calendrier</Link>
                    </div>

                    <div className="space-y-3">
                        {upcomingSchedule.length === 0 ? (
                            <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] py-16 text-center border-dashed">
                                <Clock className="h-10 w-10 text-mist/20 mx-auto mb-3" />
                                <p className="text-xs text-mist font-bold italic">Aucun cours prévu</p>
                            </div>
                        ) : (
                            upcomingSchedule.slice(0, 3).map((lesson) => (
                                <div key={lesson.id} className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/[0.04] border border-white/5 hover:border-blue-500/20 transition-all">
                                    <div className="flex-shrink-0 text-center w-12">
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                                            {new Date(lesson.date).toLocaleDateString("fr-FR", { weekday: "short" })}
                                        </div>
                                        <div className="text-xl font-black text-snow">
                                            {new Date(lesson.date).getDate()}
                                        </div>
                                    </div>
                                    <div className="h-10 w-px bg-white/10" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-snow text-sm truncate">{lesson.topic}</h4>
                                        <div className="flex items-center gap-3 text-[10px] text-mist mt-1 font-bold uppercase tracking-wider">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {lesson.startTime.slice(0, 5)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <UserCheck className="h-3 w-3" />
                                                {lesson.monitorName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon: Icon, color, progress, subLabel }: any) {
    return (
        <div className="bg-white/[0.04] border border-white/5 rounded-[2rem] p-6 hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-snow tracking-tighter">{value}</div>
                    <div className="text-[9px] font-black text-mist uppercase tracking-widest">{label}</div>
                </div>
            </div>
            {progress !== undefined && (
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r from-current to-white/20 rounded-full transition-all duration-1000 ${color}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
            {subLabel && <div className="mt-2 text-[9px] font-bold text-mist/60 uppercase tracking-widest text-right">{subLabel}</div>}
        </div>
    );
}

function Plus({ className }: { className?: string }) {
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
}

