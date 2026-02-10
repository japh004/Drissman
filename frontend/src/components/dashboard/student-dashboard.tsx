"use client";
// Build fix: Force fresh deployment

import { Calendar, Clock, BookOpen, Star, ArrowRight, Loader2, Gift, Heart, Megaphone, Users } from "lucide-react";
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

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-snow">Bonjour, {user?.firstName} !</h2>
                    <p className="text-mist">Voici le suivi de votre formation.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/search" className="px-4 py-2 rounded-xl bg-signal hover:bg-signal-dark text-asphalt font-bold shadow-[0_0_15px_rgba(255,193,7,0.2)] transition-all">
                        Trouver une auto-école
                    </Link>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    icon={BookOpen}
                    label="Code de la Route"
                    value={`${codeProgress}%`}
                    sub={codeSubtitle}
                    color="text-signal"
                    loading={progressLoading}
                />
                <KpiCard
                    icon={Clock}
                    label="Conduite"
                    value={`${conduiteProgress}%`}
                    sub={conduiteSubtitle}
                    color="text-blue-400"
                    loading={progressLoading}
                />
                <KpiCard
                    icon={Gift}
                    label="Points Bonus"
                    value="1 250"
                    sub="+175 pts ce mois"
                    color="text-purple-400"
                    href="/dashboard/rewards"
                />
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 flex flex-col justify-center">
                    <p className="text-sm text-mist mb-1">Prochain cours / examen</p>
                    <p className="text-xl font-bold text-snow">{nextExamFormatted}</p>
                    {progress?.nextExamType && (
                        <span className="text-xs text-signal font-bold mt-1">{progress.nextExamType}</span>
                    )}
                    <Link href="/search" className="text-signal text-sm font-bold flex items-center gap-1 mt-2 hover:underline">
                        Prendre rendez-vous <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Bookings (2/3) */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-snow">Mes Réservations Récentes</h3>
                        <Link href="/dashboard/bookings" className="text-sm text-signal hover:underline">Voir tout</Link>
                    </div>

                    {bookingsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-signal"></div>
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="space-y-4">
                            {bookings.slice(0, 3).map((booking) => (
                                <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-signal/10 flex items-center justify-center text-signal">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-snow">{booking.school.name}</div>
                                            <div className="text-sm text-mist">{booking.offer.name}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:text-right gap-4">
                                        <div>
                                            <div className="text-sm text-snow">{new Date(booking.date).toLocaleDateString('fr-FR')}</div>
                                            <div className="text-xs text-mist">{booking.time || "Heure à confirmer"}</div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${booking.status === 'CONFIRMED'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {booking.status === 'CONFIRMED' ? 'Confirmé' : 'En attente'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                            <p className="text-mist mb-4">Vous n&apos;avez pas encore de réservation.</p>
                            <Link href="/search" className="text-signal font-bold hover:underline">
                                Explorer les auto-écoles
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">
                    {/* Invite Friends */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent rounded-2xl border border-purple-500/20 p-6">
                        <div className="absolute -top-4 -right-4 opacity-10">
                            <Users className="h-24 w-24 text-purple-400" />
                        </div>
                        <div className="relative">
                            <h4 className="font-bold text-snow mb-1">Inviter des amis</h4>
                            <p className="text-sm text-mist mb-3">Gagnez 200 points par parrainage !</p>
                            <button className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-bold hover:bg-purple-500/30 transition-all">
                                Partager mon lien
                            </button>
                        </div>
                    </div>

                    {/* Latest Announcements */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Megaphone className="h-5 w-5 text-signal" />
                            <h4 className="font-bold text-snow">Dernières Annonces</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-sm text-snow font-medium">Nouvelles fonctionnalités disponibles</p>
                                <p className="text-xs text-mist mt-1">Découvrez le système de récompenses et le suivi de progression amélioré.</p>
                                <span className="text-xs text-mist/60 mt-2 block">Il y a 2 jours</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-sm text-snow font-medium">Maintenance prévue</p>
                                <p className="text-xs text-mist mt-1">Une maintenance est prévue le 15 février de 2h à 4h du matin.</p>
                                <span className="text-xs text-mist/60 mt-2 block">Il y a 5 jours</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── KPI Card ─── */
function KpiCard({
    icon: Icon,
    label,
    value,
    sub,
    color,
    loading,
    href,
}: {
    icon: any;
    label: string;
    value: string;
    sub: string;
    color: string;
    loading?: boolean;
    href?: string;
}) {
    const content = (
        <div className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 ${href ? "hover:border-signal/20 cursor-pointer" : ""} transition-colors`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm text-mist font-medium">{label}</span>
            </div>
            {loading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-mist animate-spin" />
                    <span className="text-mist text-sm">Chargement...</span>
                </div>
            ) : (
                <>
                    <p className="text-2xl font-black text-snow">{value}</p>
                    <p className="text-xs text-mist mt-1">{sub}</p>
                </>
            )}
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }
    return content;
}
