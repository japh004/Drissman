"use client";
// Build fix: Force fresh deployment

import { Calendar, Clock, BookOpen, Star, ArrowRight, Loader2, Gift, Heart, Megaphone, Users, Trophy, Flame, Zap, ArrowUpRight, Target, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useBookings, useAuth, useStudentProgress } from "@/hooks";

export function StudentDashboard() {
    const { user } = useAuth();
    const { bookings, loading: bookingsLoading } = useBookings({ userId: user?.id });
    const { progress, loading: progressLoading } = useStudentProgress();

    const isLoading = bookingsLoading || progressLoading;

    // Use real data if available, fallback to defaults
    const codeProgress = progress?.codeProgress ?? 0;
    const codeSubtitle = progress
        ? `${progress.codeExamsCompleted} examens blancs sur ${progress.codeTotalExams}`
        : "Chargement...";

    const conduiteProgress = progress?.conduiteProgress ?? 0;
    const conduiteSubtitle = progress
        ? `${progress.conduiteHoursCompleted}h sur ${progress.conduiteTotalHours}h effectuées`
        : "Chargement...";

    const nextExamDate = progress?.nextExamDate ?? "Non planifié";
    const nextExamFormatted = nextExamDate !== "Non planifié"
        ? new Date(nextExamDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : nextExamDate;

    // Formation journey milestones
    const milestones = [
        { label: "Inscription", done: true, icon: CheckCircle },
        { label: "Code débuté", done: codeProgress > 0, icon: BookOpen },
        { label: "Code validé", done: codeProgress >= 100, icon: Trophy },
        { label: "Conduite débutée", done: conduiteProgress > 0, icon: Target },
        { label: "Examen conduite", done: conduiteProgress >= 100, icon: Star },
    ];
    const completedMilestones = milestones.filter(m => m.done).length;

    return (
        <div className="space-y-8">
            {/* ═══ Hero Welcome Banner ═══ */}
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-10">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-signal/15 via-blue-500/10 to-purple-500/10" />
                <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-emerald-500/5 to-transparent animate-pulse" style={{ animationDuration: '5s' }} />

                {/* Decorative floating dots */}
                <div className="absolute top-8 right-12 w-40 h-40 bg-signal/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute top-6 right-1/4 w-2.5 h-2.5 bg-signal rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute bottom-6 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-[45%] w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-12 w-12 rounded-2xl bg-signal/20 border border-signal/30 flex items-center justify-center shadow-lg shadow-signal/10">
                                    <Flame className="h-6 w-6 text-signal" />
                                </div>
                                {/* Streak badge */}
                                <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
                                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                                    <span className="text-orange-400 text-[10px] font-black uppercase tracking-wider">7 jours actifs</span>
                                </div>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-snow tracking-tight">
                                Bonjour, {user?.firstName} !
                            </h2>
                            <p className="text-mist mt-1 max-w-lg">
                                Voici le suivi de votre formation. Continuez comme ça ! 🚀
                            </p>
                        </div>

                        {/* Points badge */}
                        <Link href="/dashboard/rewards" className="group bg-white/[0.10] backdrop-blur-md rounded-2xl px-6 py-4 border border-white/[0.14] hover:border-purple-500/30 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Gift className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-mist font-semibold uppercase tracking-wider">Points bonus</div>
                                    <div className="text-xl font-black text-purple-400">1 250</div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-mist ml-2 group-hover:text-purple-400 transition-colors" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═══ Formation Progress — SVG Ring Cards ═══ */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {/* Code de la Route — with SVG ring */}
                <div className="bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-6 group hover:border-signal/20 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-signal/5 rounded-full blur-2xl group-hover:bg-signal/10 transition-colors duration-500" />
                    <div className="relative flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="h-4 w-4 text-signal" />
                                <span className="text-xs font-bold text-mist uppercase tracking-wide">Code de la Route</span>
                            </div>
                            {progressLoading ? (
                                <Loader2 className="h-5 w-5 text-mist animate-spin mt-2" />
                            ) : (
                                <>
                                    <p className="text-3xl font-black text-snow mt-2 tracking-tight">{codeProgress}%</p>
                                    <p className="text-[11px] text-mist mt-1">{codeSubtitle}</p>
                                </>
                            )}
                        </div>
                        <ProgressRing value={codeProgress} color="#ffc107" size={72} loading={progressLoading} />
                    </div>
                </div>

                {/* Conduite — with SVG ring */}
                <div className="bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-6 group hover:border-blue-500/20 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500" />
                    <div className="relative flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-blue-400" />
                                <span className="text-xs font-bold text-mist uppercase tracking-wide">Conduite</span>
                            </div>
                            {progressLoading ? (
                                <Loader2 className="h-5 w-5 text-mist animate-spin mt-2" />
                            ) : (
                                <>
                                    <p className="text-3xl font-black text-snow mt-2 tracking-tight">{conduiteProgress}%</p>
                                    <p className="text-[11px] text-mist mt-1">{conduiteSubtitle}</p>
                                </>
                            )}
                        </div>
                        <ProgressRing value={conduiteProgress} color="#3b82f6" size={72} loading={progressLoading} />
                    </div>
                </div>

                {/* Next Exam / Course — Visual countdown card */}
                <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent rounded-2xl border border-emerald-500/20 p-6 group hover:border-emerald-500/40 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-3 right-3 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs font-bold text-mist uppercase tracking-wide">Prochain RDV</span>
                        </div>
                        <p className="text-xl font-black text-snow tracking-tight">{nextExamFormatted}</p>
                        {progress?.nextExamType && (
                            <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                                {progress.nextExamType}
                            </span>
                        )}
                        <Link href="/search" className="mt-3 text-emerald-400 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                            Prendre rendez-vous <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═══ Formation Journey — Visual Timeline ═══ */}
            <div className="bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-7">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-black text-snow uppercase tracking-wider">Parcours Formation</h3>
                        <p className="text-[11px] text-mist mt-1">{completedMilestones}/{milestones.length} étapes complétées</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-signal/10 border border-signal/20">
                        <span className="text-signal text-[10px] font-black uppercase tracking-wider">{Math.round((completedMilestones / milestones.length) * 100)}% complet</span>
                    </div>
                </div>

                {/* Visual journey steps */}
                <div className="relative">
                    {/* Connection line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-white/[0.10] rounded-full" />
                    <div
                        className="absolute top-5 left-0 h-1 bg-gradient-to-r from-signal via-blue-500 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(completedMilestones / milestones.length) * 100}%` }}
                    />

                    <div className="relative flex justify-between">
                        {milestones.map((milestone, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 relative" style={{ width: `${100 / milestones.length}%` }}>
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 ${milestone.done
                                        ? 'bg-signal/20 border-2 border-signal text-signal shadow-lg shadow-signal/10'
                                        : 'bg-white/[0.10] border-2 border-white/[0.1] text-mist/40'
                                    }`}>
                                    <milestone.icon className="h-4 w-4" />
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider text-center leading-tight ${milestone.done ? 'text-snow' : 'text-mist/40'
                                    }`}>
                                    {milestone.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ Two Column Layout ═══ */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Bookings (2/3) */}
                <div className="lg:col-span-2 bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-7">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-black text-snow uppercase tracking-wider">Mes Inscriptions</h3>
                        <Link href="/dashboard/bookings" className="text-[10px] text-signal font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                            Voir tout <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {bookingsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="relative h-10 w-10">
                                <div className="absolute inset-0 rounded-full border-4 border-signal/10"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-signal border-t-transparent animate-spin"></div>
                            </div>
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="space-y-3">
                            {bookings.slice(0, 3).map((booking, i) => (
                                <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/[0.07] border border-white/[0.10] hover:border-signal/15 transition-all group/booking">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-signal/20 to-signal/5 border border-signal/20 flex items-center justify-center text-signal group-hover/booking:scale-110 transition-transform">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-snow">{booking.school.name}</div>
                                            <div className="text-[11px] text-mist flex items-center gap-2">
                                                <span>{booking.offer.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 sm:mt-0">
                                        <div className="text-right">
                                            <div className="text-xs text-snow font-medium">{new Date(booking.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                                            <div className="text-[10px] text-mist">{booking.time || "Heure à confirmer"}</div>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border ${booking.status === 'CONFIRMED'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {booking.status === 'CONFIRMED' ? '✓ Confirmé' : '⏳ En attente'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/[0.07] rounded-2xl border border-dashed border-white/[0.14]">
                            <Calendar className="h-10 w-10 text-mist/20 mx-auto mb-3" />
                            <p className="text-mist mb-4">Vous n&apos;avez pas encore d&apos;inscription.</p>
                            <Link href="/search" className="text-signal font-bold hover:underline text-sm">
                                Explorer les auto-écoles →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-5">
                    {/* Invite Friends — gradient card */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-transparent rounded-2xl border border-purple-500/20 p-6">
                        <div className="absolute -top-4 -right-4 opacity-10">
                            <Users className="h-24 w-24 text-purple-400" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-4 w-4 text-purple-400" />
                                <h4 className="font-black text-snow text-sm">Inviter des amis</h4>
                            </div>
                            <p className="text-[11px] text-mist mb-4">Gagnez <span className="text-purple-400 font-bold">200 points</span> par parrainage !</p>
                            <button className="w-full px-4 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2">
                                <Zap className="h-3.5 w-3.5" />
                                Partager mon lien
                            </button>
                        </div>
                    </div>

                    {/* Latest Announcements */}
                    <div className="bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Megaphone className="h-4 w-4 text-signal" />
                            <h4 className="font-black text-snow text-sm">Annonces</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-white/[0.07] border border-white/[0.14] hover:border-white/[0.1] transition-colors">
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 h-2 w-2 rounded-full bg-green-400 shrink-0" />
                                    <div>
                                        <p className="text-xs text-snow font-semibold">Nouvelles fonctionnalités</p>
                                        <p className="text-[10px] text-mist mt-0.5">Système de récompenses et suivi amélioré.</p>
                                        <span className="text-[9px] text-mist/50 mt-1 block">Il y a 2 jours</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-signal/5 border border-signal/10 hover:border-signal/20 transition-colors">
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 h-2 w-2 rounded-full bg-signal shrink-0 animate-pulse" />
                                    <div>
                                        <p className="text-xs text-signal font-semibold">📢 Maintenance prévue</p>
                                        <p className="text-[10px] text-mist mt-0.5">15 février de 2h à 4h du matin.</p>
                                        <span className="text-[9px] text-mist/50 mt-1 block">Il y a 5 jours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Progress Ring SVG Component ─── */
function ProgressRing({ value, color, size = 72, loading }: { value: number; color: string; size?: number; loading?: boolean }) {
    const strokeWidth = 5;
    const r = (size - strokeWidth * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = loading ? circ : circ - (Math.min(100, value) / 100) * circ;

    return (
        <svg width={size} height={size} className="transform -rotate-90 shrink-0">
            {/* Track */}
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-white/[0.06]" />
            {/* Value arc */}
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
            />
            {/* Center text */}
            <text
                x={size / 2} y={size / 2}
                textAnchor="middle" dominantBaseline="central"
                className="fill-snow font-black"
                fontSize={size > 60 ? 14 : 10}
                transform={`rotate(90, ${size / 2}, ${size / 2})`}
            >
                {loading ? '…' : `${value}%`}
            </text>
        </svg>
    );
}
