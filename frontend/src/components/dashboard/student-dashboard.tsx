"use client";

import {
    Calendar,
    Clock,
    BookOpen,
    ArrowRight,
    Loader2,
    Target,
    CheckCircle,
    GraduationCap,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useBookings, useAuth, useStudentProgress, useMyEnrollments } from "@/hooks";

export function StudentDashboard() {
    const { user } = useAuth();
    const { progress, loading: progressLoading, error: progressError } = useStudentProgress();
    const { bookings, loading: bookingsLoading } = useBookings({ userId: user?.id });
    const { enrollments, loading: enrollmentsLoading } = useMyEnrollments();

    const isLoading = progressLoading || bookingsLoading || enrollmentsLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-4 border-signal/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-signal border-t-transparent animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-signal/20 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-mist font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Chargement de votre parcours...</p>
            </div>
        );
    }

    if (progressError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-500/5 rounded-[2rem] border border-red-500/10 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-black text-snow mb-2">Erreur de chargement</h3>
                <p className="text-mist max-w-sm mb-6">{progressError}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl text-xs uppercase">
                    Réessayer
                </button>
            </div>
        );
    }

    // ─── Computed ───
    const activeEnrollments = enrollments.filter(e => e.status === "ACTIVE");
    const upcomingBookings = bookings
        .filter(b => b.status === "CONFIRMED" || b.status === "PENDING")
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    const codeProgress = progress?.codeProgress || 0;
    const conduiteProgress = progress?.conduiteProgress || 0;
    const overallProgress = Math.round((codeProgress + conduiteProgress) / 2);

    return (
        <div className="space-y-8">
            {/* ═══ Welcome Banner ═══ */}
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-signal/10 to-purple-500/10" />
                <div className="absolute top-6 right-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-signal/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
                                <GraduationCap className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-snow tracking-tight">
                            Bonjour, {user?.firstName} !
                        </h2>
                        <p className="text-mist mt-2 max-w-lg font-medium">
                            {overallProgress > 0
                                ? `Progression globale : ${overallProgress}% · Continuez comme ça !`
                                : "Bienvenue sur votre espace élève. Votre parcours commence ici !"}
                        </p>
                    </div>

                    {progress?.nextExamDate && (
                        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-signal/10 border border-signal/20 text-signal text-xs font-black uppercase tracking-widest">
                            <Target className="h-4 w-4" />
                            Prochain examen : {new Date(progress.nextExamDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ Progress Cards ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code Progress */}
                <div className="bg-white/[0.07] backdrop-blur-md border border-white/5 rounded-[2rem] p-6 hover:border-blue-500/20 transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-snow">Code de la Route</h3>
                            <p className="text-[10px] text-mist font-black uppercase tracking-widest mt-1">
                                {progress?.codeExamsCompleted || 0}/{progress?.codeTotalExams || 0} examens
                            </p>
                        </div>
                        <div className="relative h-16 w-16">
                            <ProgressRing value={codeProgress} color="#60a5fa" />
                        </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
                            style={{ width: `${codeProgress}%` }}
                        />
                    </div>
                    <div className="mt-3 flex justify-between text-xs">
                        <span className="text-mist font-bold">{codeProgress}% complété</span>
                        <span className="text-blue-400 font-bold">{100 - codeProgress}% restant</span>
                    </div>
                </div>

                {/* Conduite Progress */}
                <div className="bg-white/[0.07] backdrop-blur-md border border-white/5 rounded-[2rem] p-6 hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-snow">Conduite</h3>
                            <p className="text-[10px] text-mist font-black uppercase tracking-widest mt-1">
                                {progress?.conduiteHoursCompleted || 0}/{progress?.conduiteTotalHours || 0} heures
                            </p>
                        </div>
                        <div className="relative h-16 w-16">
                            <ProgressRing value={conduiteProgress} color="#34d399" />
                        </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                            style={{ width: `${conduiteProgress}%` }}
                        />
                    </div>
                    <div className="mt-3 flex justify-between text-xs">
                        <span className="text-mist font-bold">{conduiteProgress}% complété</span>
                        <span className="text-emerald-400 font-bold">{100 - conduiteProgress}% restant</span>
                    </div>
                </div>
            </div>

            {/* ═══ Two-Column: Bookings + Enrollments ═══ */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Upcoming Bookings */}
                <div className="lg:col-span-3 bg-white/[0.07] backdrop-blur-md border border-white/5 rounded-[2rem] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-snow">Mon Planning</h3>
                            <p className="text-[10px] text-mist font-black uppercase tracking-widest mt-1">Prochains rendez-vous</p>
                        </div>
                        <Link href="/dashboard/bookings" className="text-[10px] font-black text-signal uppercase tracking-widest hover:underline flex items-center gap-1">
                            Tout voir <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {upcomingBookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="h-10 w-10 text-mist/30 mx-auto mb-3" />
                            <p className="text-mist font-bold text-sm">Aucun cours à venir</p>
                            <p className="text-mist/60 text-xs mt-1">Inscrivez-vous à des cours depuis l&apos;onglet Mes Cours.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all">
                                    <div className="flex-shrink-0 text-center">
                                        <div className="text-[10px] font-black text-signal uppercase tracking-widest">
                                            {new Date(booking.date).toLocaleDateString("fr-FR", { weekday: "short" })}
                                        </div>
                                        <div className="text-xl font-black text-snow">
                                            {new Date(booking.date).getDate()}
                                        </div>
                                    </div>
                                    <div className="h-10 w-px bg-white/10" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-snow text-sm truncate">
                                            {booking.offer?.name || "Formation"}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-mist mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {booking.school?.name || "Auto-école"}
                                            </span>
                                            {booking.time && (
                                                <span className="text-mist/60">{booking.time}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${booking.status === "CONFIRMED"
                                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                        : "text-orange-400 bg-orange-500/10 border-orange-500/20"
                                        }`}>
                                        {booking.status === "CONFIRMED" ? "Confirmé" : "En attente"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Enrollments */}
                <div className="lg:col-span-2 bg-white/[0.07] backdrop-blur-md border border-white/5 rounded-[2rem] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-snow">Mes Formations</h3>
                            <p className="text-[10px] text-mist font-black uppercase tracking-widest mt-1">Inscriptions actives</p>
                        </div>
                    </div>

                    {activeEnrollments.length === 0 ? (
                        <div className="text-center py-12">
                            <GraduationCap className="h-10 w-10 text-mist/30 mx-auto mb-3" />
                            <p className="text-mist font-bold text-sm">Aucune formation active</p>
                            <p className="text-mist/60 text-xs mt-1">Inscrivez-vous à une formation pour commencer.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeEnrollments.slice(0, 4).map((enrollment) => (
                                <div key={enrollment.id} className="p-4 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-bold text-snow text-sm truncate flex-1">
                                            {enrollment.offerName || "Formation"}
                                        </h4>
                                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 ml-2" />
                                    </div>
                                    <div className="text-[10px] text-mist font-bold uppercase tracking-widest">
                                        {enrollment.trainingPeriodName || "Formation en cours"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ Quick Links ═══ */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { label: "Mon Planning", href: "/dashboard/bookings", icon: Calendar, desc: "Prochains cours" },
                    { label: "Mes Cours", href: "/dashboard/theory", icon: BookOpen, desc: "Code & conduite" },
                    { label: "Mes Factures", href: "/dashboard/invoices", icon: Target, desc: "Paiements" },
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

/* ─── Progress Ring SVG Component ─── */
function ProgressRing({ value, color, size = 64 }: { value: number; color: string; size?: number }) {
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-white/5"
                strokeWidth={strokeWidth}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000"
            />
            <text
                x={size / 2}
                y={size / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-snow text-xs font-black"
                transform={`rotate(90, ${size / 2}, ${size / 2})`}
            >
                {value}%
            </text>
        </svg>
    );
}
