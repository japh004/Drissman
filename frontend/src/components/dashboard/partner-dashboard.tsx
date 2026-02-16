"use client";

import { Users, CreditCard, TrendingUp, Calendar, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, Star, Zap } from "lucide-react";
import Link from "next/link";
import { usePartnerStats, usePartnerEnrollments, useSessions, useAuth } from "@/hooks";

interface PartnerDashboardProps {
    user: any;
}

export function PartnerDashboard({ user }: PartnerDashboardProps) {
    const { stats, loading: statsLoading, error: statsError } = usePartnerStats();
    const { enrollments, loading: enrollmentsLoading, error: enrollmentsError } = usePartnerEnrollments(user.schoolId);
    const { sessions, loading: sessionsLoading, error: sessionsError } = useSessions(user.schoolId);

    if (statsLoading || enrollmentsLoading || sessionsLoading) {
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

    if (statsError || enrollmentsError || sessionsError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-500/5 rounded-[2rem] border border-red-500/10 text-center">
                <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-snow mb-2">Une erreur est survenue</h3>
                <p className="text-mist max-w-sm mb-6">{statsError || enrollmentsError || sessionsError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl text-xs uppercase"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    const todaySessions = sessions?.filter(s => {
        const today = new Date().toISOString().split('T')[0];
        return s.date === today && (s.status === 'CONFIRMED' || s.status === 'SCHEDULED');
    }) || [];

    const pendingEnrollments = enrollments.filter(e => e.status === 'PENDING');
    const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE');

    // Mock sparkline bar data for revenue chart (would use real data in production)
    const revenueBarData = [35, 52, 40, 68, 55, 72, 85, 65, 90, 78, 95, 88];
    const maxBar = Math.max(...revenueBarData);

    return (
        <div className="space-y-8">
            {/* ═══ Hero Welcome Banner ═══ */}
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-10">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-signal/20 via-orange-500/10 to-purple-500/10" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-signal/5 to-blue-500/10 animate-pulse" style={{ animationDuration: '4s' }} />

                {/* Decorative floating shapes */}
                <div className="absolute top-6 right-6 w-32 h-32 bg-signal/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-signal rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute top-8 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <div className="absolute bottom-8 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '2s' }} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
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
                        <p className="text-mist mt-1 max-w-lg">
                            Voici la performance de votre auto-école en temps réel. {todaySessions.length > 0
                                ? `Vous avez ${todaySessions.length} cours programmé${todaySessions.length > 1 ? 's' : ''} aujourd'hui.`
                                : 'Aucun cours prévu aujourd\'hui.'}
                        </p>
                    </div>

                    {/* Mini live stats inline */}
                    <div className="flex gap-3">
                        <div className="bg-white/[0.10] backdrop-blur-md rounded-2xl px-5 py-3 border border-white/[0.14]">
                            <div className="text-[10px] text-mist font-semibold uppercase tracking-wider">Aujourd'hui</div>
                            <div className="text-2xl font-black text-snow">{todaySessions.length}</div>
                            <div className="text-[10px] text-mist">cours</div>
                        </div>
                        <div className="bg-white/[0.10] backdrop-blur-md rounded-2xl px-5 py-3 border border-white/[0.14]">
                            <div className="text-[10px] text-mist font-semibold uppercase tracking-wider">En attente</div>
                            <div className="text-2xl font-black text-yellow-400">{pendingEnrollments.length}</div>
                            <div className="text-[10px] text-mist">inscriptions</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ KPI Cards Row with Visual Elements ═══ */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenue Card — with sparkline bars */}
                <div className="relative overflow-hidden bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-6 group hover:border-signal/20 transition-all duration-500">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-signal/5 rounded-full blur-2xl group-hover:bg-signal/10 transition-colors duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">Chiffre d'affaires</span>
                            <div className="flex items-center gap-1 text-green-400 text-[10px] font-bold">
                                <ArrowUpRight className="h-3 w-3" />
                                +{stats?.revenueGrowth}%
                            </div>
                        </div>
                        <div className="text-2xl font-black text-snow mb-4 tracking-tight">{stats?.revenue || "0 FCFA"}</div>

                        {/* Mini sparkline bar chart */}
                        <div className="flex items-end gap-[3px] h-10">
                            {revenueBarData.map((val, i) => (
                                <div key={i} className="flex-1 rounded-sm bg-signal/20 group-hover:bg-signal/40 transition-all duration-500"
                                    style={{
                                        height: `${(val / maxBar) * 100}%`,
                                        transitionDelay: `${i * 30}ms`,
                                        opacity: i >= revenueBarData.length - 3 ? 1 : 0.6
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Enrollments Card — with circular mini-gauge */}
                <div className="relative overflow-hidden bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-6 group hover:border-blue-500/20 transition-all duration-500">
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">Inscriptions</span>
                            <div className="flex items-center gap-1 text-green-400 text-[10px] font-bold">
                                <ArrowUpRight className="h-3 w-3" />
                                +{stats?.enrollmentGrowth}
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-black text-snow tracking-tight">{stats?.enrollments?.toString() || "0"}</div>
                            {/* Mini donut */}
                            <MiniDonut
                                value={activeEnrollments.length}
                                total={enrollments.length || 1}
                                color="#3b82f6"
                                size={48}
                            />
                        </div>
                        <div className="flex gap-3 mt-3 text-[10px]">
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> {activeEnrollments.length} actives</span>
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500" /> {pendingEnrollments.length} en attente</span>
                        </div>
                    </div>
                </div>

                {/* Success Rate — with visual gauge arc */}
                <div className="relative overflow-hidden bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-6 group hover:border-emerald-500/20 transition-all duration-500">
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">Taux de réussite</span>
                            <Star className="h-4 w-4 text-yellow-400 group-hover:scale-125 transition-transform duration-300" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-2xl font-black text-snow tracking-tight">{stats?.successRate || "0%"}</div>
                            <SemiCircleGauge value={parseInt(stats?.successRate || "0")} />
                        </div>
                        <p className="text-[10px] text-mist mt-2">Mise à jour hebdomadaire</p>
                    </div>
                </div>

                {/* Upcoming Lessons — with countdown visual */}
                <div className="relative overflow-hidden bg-gradient-to-br from-signal/10 via-signal/5 to-transparent rounded-2xl border border-signal/20 p-6 group hover:border-signal/40 transition-all duration-500">
                    <div className="absolute top-3 right-3 w-16 h-16 bg-signal/10 rounded-full blur-xl" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">Cours à venir</span>
                            <div className="h-8 w-8 rounded-xl bg-signal/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                <Calendar className="h-4 w-4 text-signal" />
                            </div>
                        </div>
                        <div className="text-4xl font-black text-signal tracking-tight">{stats?.upcomingLessons?.toString() || "0"}</div>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                                {[...Array(Math.min(todaySessions.length, 3))].map((_, i) => (
                                    <div key={i} className="h-5 w-5 rounded-full bg-signal/20 border-2 border-signal/10 flex items-center justify-center text-[8px] text-signal font-black">
                                        {todaySessions[i]?.studentName?.[0] || '?'}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] text-mist font-medium">Aujourd'hui</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Two-Column: Recent Enrollments + Today Schedule ═══ */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Enrollments — with visual timeline */}
                <div className="bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-7">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-black text-snow uppercase tracking-wider">Dernières Inscriptions</h3>
                        <Link href="/dashboard/bookings" className="text-[10px] font-black text-signal uppercase tracking-widest hover:underline flex items-center gap-1">
                            Voir tout <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="relative">
                        {/* Timeline vertical line */}
                        {enrollments.length > 0 && (
                            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-gradient-to-b from-signal/30 via-white/10 to-transparent" />
                        )}
                        <div className="space-y-1">
                            {enrollments.length > 0 ? enrollments.slice(0, 4).map((item, i) => (
                                <div key={item.id} className="flex gap-4 p-3 rounded-2xl hover:bg-white/[0.08] transition-all group/item relative">
                                    {/* Timeline dot */}
                                    <div className="relative z-10 mt-1">
                                        <div className={`h-[14px] w-[14px] rounded-full border-2 flex items-center justify-center ${item.status === 'PENDING'
                                                ? 'border-yellow-500 bg-yellow-500/20'
                                                : item.status === 'ACTIVE'
                                                    ? 'border-green-500 bg-green-500/20'
                                                    : 'border-mist bg-white/10'
                                            }`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${item.status === 'PENDING' ? 'bg-yellow-500' : item.status === 'ACTIVE' ? 'bg-green-500' : 'bg-mist'
                                                }`} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-snow text-sm truncate group-hover/item:text-signal transition-colors">
                                                {item.userName || `Inscription #${item.id.substring(0, 6)}`}
                                            </span>
                                            <StatusBadge status={item.status} />
                                        </div>
                                        <div className="text-[11px] text-mist mt-0.5">
                                            {item.offerName} • {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 bg-white/[0.07] rounded-2xl border border-dashed border-white/[0.12]">
                                    <Users className="h-8 w-8 text-mist/30 mx-auto mb-2" />
                                    <p className="text-xs text-mist font-bold uppercase tracking-widest">Aucune inscription</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Today's Schedule — with visual cards */}
                <div className="bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-7">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h3 className="text-base font-black text-snow uppercase tracking-wider">Planning du jour</h3>
                            <div className="px-2.5 py-1 rounded-lg bg-signal/10 border border-signal/20 text-signal text-[10px] font-black">
                                {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </div>
                        </div>
                        <Link href="/dashboard/planning" className="text-[10px] font-black text-signal uppercase tracking-widest hover:underline flex items-center gap-1">
                            Calendrier <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {todaySessions.length > 0 ? (
                            todaySessions.slice(0, 4).map((item, i) => (
                                <div key={item.id} className="flex gap-4 items-center p-4 rounded-2xl bg-white/[0.07] border border-white/[0.12] hover:border-signal/20 transition-all group/session">
                                    {/* Time block visual */}
                                    <div className="bg-signal/10 border border-signal/20 rounded-xl px-3 py-2.5 text-center min-w-[72px] group-hover/session:bg-signal/20 transition-colors">
                                        <div className="text-signal font-black text-sm leading-tight">{item.startTime}</div>
                                        <div className="text-[9px] text-mist mt-0.5">{item.endTime}</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-snow text-sm truncate">{item.studentName}</div>
                                        <div className="text-[11px] text-mist flex items-center gap-2 mt-0.5">
                                            <span className="truncate">{item.monitorName || 'Non assigné'}</span>
                                            {item.meetingPoint && (
                                                <>
                                                    <span className="text-white/20">•</span>
                                                    <span className="truncate">{item.meetingPoint}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {/* Visual hour indicator */}
                                    <div className="hidden sm:flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-mist/50" />
                                        <span className="text-[10px] text-mist font-medium">
                                            {(() => {
                                                const [sh, sm] = item.startTime.split(':').map(Number);
                                                const [eh, em] = item.endTime.split(':').map(Number);
                                                return `${eh - sh}h`;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white/[0.07] rounded-2xl border border-dashed border-white/[0.12]">
                                <Calendar className="h-8 w-8 text-mist/30 mx-auto mb-2" />
                                <p className="text-xs text-mist font-bold uppercase tracking-widest">Aucun cours aujourd'hui</p>
                                <Link href="/dashboard/planning" className="text-signal text-xs font-bold mt-2 inline-block hover:underline">Planifier un cours →</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Activity Feed + Revenue Visual ═══ */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Revenue bar chart visual (2/3) */}
                <div className="lg:col-span-2 bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-7">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-black text-snow uppercase tracking-wider">Progression Mensuelle</h3>
                            <p className="text-[11px] text-mist mt-1">Aperçu des inscriptions sur les 12 derniers mois</p>
                        </div>
                        <div className="flex gap-4 text-[10px]">
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-signal" /> Inscriptions</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500/50" /> Revenus</span>
                        </div>
                    </div>
                    {/* Large bar chart */}
                    <div className="flex items-end gap-2 h-44">
                        {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].map((label, i) => {
                            const h1 = revenueBarData[i];
                            const h2 = Math.max(20, revenueBarData[i] * 0.6 + Math.random() * 20);
                            const isCurrentMonth = i === new Date().getMonth();
                            return (
                                <div key={label} className="flex-1 flex flex-col items-center gap-1 group/bar">
                                    <div className="w-full flex gap-[2px] h-36 items-end">
                                        <div
                                            className={`flex-1 rounded-t-sm transition-all duration-700 ${isCurrentMonth ? 'bg-signal' : 'bg-signal/30 group-hover/bar:bg-signal/50'}`}
                                            style={{ height: `${(h1 / maxBar) * 100}%` }}
                                        />
                                        <div
                                            className={`flex-1 rounded-t-sm transition-all duration-700 ${isCurrentMonth ? 'bg-emerald-500' : 'bg-emerald-500/20 group-hover/bar:bg-emerald-500/40'}`}
                                            style={{ height: `${(h2 / maxBar) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`text-[9px] font-bold ${isCurrentMonth ? 'text-signal' : 'text-mist/50'}`}>{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right column — Quick info */}
                <div className="space-y-5">
                    {/* Performance Score */}
                    <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent rounded-2xl border border-purple-500/20 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-black text-snow text-sm">Score Performance</h4>
                                <p className="text-[10px] text-mist">Ce mois-ci</p>
                            </div>
                        </div>
                        <div className="relative pt-2">
                            {/* Animated progress bar */}
                            <div className="h-3 bg-white/[0.10] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-signal rounded-full transition-all duration-1000 relative"
                                    style={{ width: '78%' }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" style={{ animationDuration: '2s' }} />
                                </div>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-mist font-medium">
                                <span>0</span>
                                <span className="text-purple-400 font-black">78/100</span>
                                <span>100</span>
                            </div>
                        </div>
                    </div>

                    {/* Annonces */}
                    <div className="bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/[0.12] p-6">
                        <h3 className="text-sm font-black text-snow uppercase tracking-wider mb-4">Annonces</h3>
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-white/[0.07] border border-white/[0.14] hover:border-signal/10 transition-colors">
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 h-2 w-2 rounded-full bg-green-400 shrink-0" />
                                    <div>
                                        <p className="text-xs text-snow font-semibold">Nouvelle fonctionnalité : Moniteurs</p>
                                        <span className="text-[10px] text-mist/60 mt-1 block">Il y a 1 jour</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-signal/5 border border-signal/10 hover:border-signal/20 transition-colors">
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 h-2 w-2 rounded-full bg-signal shrink-0 animate-pulse" />
                                    <div>
                                        <p className="text-xs text-signal font-semibold">📢 Maintenance prévue</p>
                                        <span className="text-[10px] text-mist/60 mt-1 block">15 fév, 2h–4h</span>
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

/* ─── Mini Donut Chart (SVG) ─── */
function MiniDonut({ value, total, color, size = 48 }: { value: number; total: number; color: string; size?: number }) {
    const pct = total > 0 ? (value / total) * 100 : 0;
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={3} className="text-white/[0.06]" />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={3} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                className="transition-all duration-1000"
            />
            <text
                x={size / 2} y={size / 2}
                textAnchor="middle" dominantBaseline="central"
                className="fill-snow text-[10px] font-black"
                transform={`rotate(90, ${size / 2}, ${size / 2})`}
            >
                {Math.round(pct)}%
            </text>
        </svg>
    );
}

/* ─── Semi-Circle Gauge (SVG) ─── */
function SemiCircleGauge({ value }: { value: number }) {
    const clamped = Math.min(100, Math.max(0, value));
    const r = 28;
    const circ = Math.PI * r; // half circle
    const offset = circ - (clamped / 100) * circ;

    return (
        <svg width={64} height={38} viewBox="0 0 64 38">
            <path
                d="M 4 34 A 28 28 0 0 1 60 34"
                fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round"
                className="text-white/[0.06]"
            />
            <path
                d="M 4 34 A 28 28 0 0 1 60 34"
                fill="none" stroke="url(#gaugeGrad)" strokeWidth={4} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                className="transition-all duration-1000"
            />
            <defs>
                <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
    const isGood = status === "ACTIVE" || status === "COMPLETED";
    return (
        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${isGood
            ? "bg-green-500/10 text-green-400 border-green-500/20"
            : status === "CANCELLED"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
            }`}>
            {status === 'ACTIVE' ? 'Actif' : status === 'PENDING' ? 'En attente' : status === 'COMPLETED' ? 'Terminé' : status === 'CANCELLED' ? 'Annulé' : status}
        </span>
    )
}
