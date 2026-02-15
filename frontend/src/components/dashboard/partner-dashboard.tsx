"use client";

import { Users, CreditCard, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import Image from "next/image";
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
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-signal/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-signal border-t-transparent animate-spin"></div>
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

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-snow uppercase tracking-tight">Tableau de bord</h2>
                    <p className="text-mist font-bold">Ravi de vous revoir, {user.firstName} ! Voici les performances de votre école.</p>
                </div>
            </div>


            {/* KPIs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Chiffre d'Affaires"
                    value={stats?.revenue || "0 FCFA"}
                    sub={`+${stats?.revenueGrowth}% ce mois`}
                    icon={CreditCard}
                    uprising={true}
                />
                <KpiCard
                    title="Inscriptions"
                    value={stats?.enrollments?.toString() || "0"}
                    sub={`+${stats?.enrollmentGrowth} cette semaine`}
                    icon={Users}
                    uprising={true}
                />
                <KpiCard
                    title="Taux de réussite"
                    value={stats?.successRate || "0%"}
                    sub="Mise à jour hebdomadaire"
                    icon={TrendingUp}
                    uprising={true}
                />
                <KpiCard
                    title="Leçons à venir"
                    value={stats?.upcomingLessons?.toString() || "0"}
                    sub="Aujourd'hui"
                    icon={Calendar}
                    uprising={true}
                />
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="grid gap-8 lg:grid-cols-2">
                <div className="bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] border border-white/5 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-snow uppercase tracking-widest">Dernières Inscriptions</h3>
                        <Link href="/dashboard/bookings" className="text-[10px] font-black text-signal uppercase tracking-widest hover:underline">Voir tout</Link>
                    </div>
                    <div className="space-y-6">
                        {enrollments.length > 0 ? enrollments.slice(0, 3).map((item, i) => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 group hover:bg-white/[0.07] hover:border-white/10 transition-all cursor-pointer">
                                <div>
                                    <div className="font-black text-snow group-hover:text-signal transition-colors">Inscription #{item.id.substring(0, 8)}</div>
                                    <div className="text-[10px] text-mist font-bold uppercase tracking-wider">
                                        {item.offerName} • {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                                    </div>
                                    <div className="text-[10px] text-mist font-bold uppercase tracking-wider mt-1">{item.userName}</div>
                                </div>
                                <StatusBadge status={item.status} />
                            </div>
                        )) : (
                            <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <p className="text-xs text-mist font-bold uppercase tracking-widest">Aucune inscription</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] border border-white/5 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-snow uppercase tracking-widest">Planning du jour</h3>
                        <Link href="/dashboard/planning" className="text-[10px] font-black text-signal uppercase tracking-widest hover:underline text-right">Calendrier complet</Link>
                    </div>
                    <div className="space-y-6">
                        {sessions && sessions.filter(s => {
                            const today = new Date().toISOString().split('T')[0];
                            return s.date === today && (s.status === 'CONFIRMED' || s.status === 'SCHEDULED');
                        }).length > 0 ? (
                            sessions.filter(s => {
                                const today = new Date().toISOString().split('T')[0];
                                return s.date === today && (s.status === 'CONFIRMED' || s.status === 'SCHEDULED');
                            }).slice(0, 3).map((item, i) => (
                                <div key={item.id} className="flex gap-6 items-start p-4 rounded-3xl bg-white/5 border border-white/5">
                                    <div className="bg-signal/10 text-signal px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border border-signal/20 shadow-lg shadow-signal/5">
                                        {item.startTime} - {item.endTime}
                                    </div>
                                    <div>
                                        <div className="font-black text-snow">{item.studentName}</div>
                                        <div className="text-[10px] text-mist font-bold uppercase tracking-widest mt-1">{item.monitorName || 'Moniteur non assigné'}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <p className="text-xs text-mist font-bold uppercase tracking-widest">Aucun cours aujourd'hui</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity & Announcements */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] border border-white/5 p-8">
                    <h3 className="text-lg font-black text-snow uppercase tracking-widest mb-6">Activité Récente</h3>
                    <div className="space-y-4">
                        {[
                            { time: "Il y a 2h", text: "Nouvelle inscription reçue pour le Permis B", dot: "bg-green-400" },
                            { time: "Il y a 5h", text: "Paiement de 350 000 FCFA confirmé", dot: "bg-signal" },
                            { time: "Hier", text: "Avis 5★ reçu de Marie D.", dot: "bg-purple-400" },
                            { time: "Hier", text: "Leçon de conduite complétée avec succès", dot: "bg-blue-400" },
                            { time: "Il y a 3j", text: "Nouvelle disponibilité ajoutée pour Lundi", dot: "bg-emerald-400" },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors">
                                <div className="mt-1.5 flex-shrink-0">
                                    <div className={`h-2.5 w-2.5 rounded-full ${activity.dot}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-snow">{activity.text}</p>
                                    <p className="text-[10px] text-mist font-bold uppercase tracking-widest mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Announcements */}
                <div className="bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] border border-white/5 p-8">
                    <h3 className="text-lg font-black text-snow uppercase tracking-widest mb-6">Annonces</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-sm text-snow font-bold">Nouvelle fonctionnalité : Moniteurs</p>
                            <p className="text-xs text-mist mt-2">Vous pourrez bientôt ajouter et gérer vos moniteurs directement depuis le tableau de bord.</p>
                            <span className="text-[10px] text-mist/60 font-bold uppercase tracking-wider mt-2 block">Il y a 1 jour</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-sm text-snow font-bold">Rapports mensuels améliorés</p>
                            <p className="text-xs text-mist mt-2">Les rapports de performance incluent désormais des graphiques détaillés et des comparaisons mensuelles.</p>
                            <span className="text-[10px] text-mist/60 font-bold uppercase tracking-wider mt-2 block">Il y a 3 jours</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-signal/5 border border-signal/10">
                            <p className="text-sm text-signal font-bold">📢 Maintenance prévue</p>
                            <p className="text-xs text-mist mt-2">Maintenance prévue le 15 février de 2h à 4h du matin.</p>
                            <span className="text-[10px] text-mist/60 font-bold uppercase tracking-wider mt-2 block">Il y a 5 jours</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, sub, icon: Icon, uprising }: { title: string, value: string, sub: string, icon: any, uprising: boolean }) {
    return (
        <div className="bg-white/[0.03] backdrop-blur-md rounded-[2rem] border border-white/5 p-7 group hover:border-signal/30 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-mist uppercase tracking-widest">{title}</span>
                <div className="p-2 rounded-xl bg-white/5 text-mist group-hover:text-signal transition-colors group-hover:scale-110 duration-500">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div className="text-2xl font-black text-snow mb-1 tracking-tight">{value}</div>
            <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${uprising ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                <p className={`text-[10px] ${uprising ? 'text-green-400' : 'text-red-400'} font-black uppercase tracking-widest`}>
                    {sub}
                </p>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const isGood = status === "ACTIVE" || status === "COMPLETED";
    return (
        <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${isGood
            ? "bg-green-500/10 text-green-400 border-green-500/20"
            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
            }`}>
            {status}
        </span>
    )
}
