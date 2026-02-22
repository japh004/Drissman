"use client";

import { useAuth, useAdminDashboard } from "@/hooks";
import { Users, BookOpen, GraduationCap, CalendarDays, Loader2, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const { stats, loading } = useAdminDashboard();

    const statCards = [
        { label: "Candidats Actifs", value: stats?.activeCandidates || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Offres", value: stats?.totalOffers || 0, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Modules", value: stats?.totalModules || 0, icon: GraduationCap, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Sessions Aujourd'hui", value: stats?.todaySessions || 0, icon: CalendarDays, color: "text-amber-400", bg: "bg-amber-400/10" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Bonjour, {user?.firstName}
                </h1>
                <p className="text-white/60">
                    Voici un aperçu de l'activité de votre auto-école aujourd'hui.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-center py-12">
                        <Loader2 className="h-8 w-8 text-signal animate-spin" />
                    </div>
                ) : (
                    statCards.map((stat, i) => (
                        <div key={i} className="bg-asphalt-light border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                            <h3 className="text-white/60 text-sm font-medium mb-1">{stat.label}</h3>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-asphalt-light border border-white/5 rounded-2xl p-6 min-h-[300px]">
                    <h2 className="text-xl font-bold text-white mb-6">Activité Récente</h2>
                    {loading ? (
                        <div className="flex justify-center h-48 items-center">
                            <Loader2 className="h-6 w-6 text-signal animate-spin" />
                        </div>
                    ) : !stats?.recentActivities || stats.recentActivities.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-white/40 bg-white/5 rounded-xl border border-white/5 border-dashed">
                            Aucune activité récente
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-asphalt/50 border border-white/5">
                                    <div className="p-2 rounded-lg bg-blue-400/10 text-blue-400 shrink-0">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{activity.title}</p>
                                        <p className="text-white/60 text-sm mt-0.5">{activity.description}</p>
                                        <p className="text-white/40 text-xs mt-2">
                                            {format(new Date(activity.timestamp), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-asphalt-light border border-white/5 rounded-2xl p-6 min-h-[300px]">
                    <h2 className="text-xl font-bold text-white mb-6">Prochaines Sessions</h2>
                    {loading ? (
                        <div className="flex justify-center h-48 items-center">
                            <Loader2 className="h-6 w-6 text-signal animate-spin" />
                        </div>
                    ) : !stats?.upcomingSessions || stats.upcomingSessions.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-white/40 bg-white/5 rounded-xl border border-white/5 border-dashed">
                            Aucune session planifiée
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.upcomingSessions.map((session) => (
                                <div key={session.id} className="flex items-start gap-4 p-4 rounded-xl bg-asphalt/50 border border-white/5">
                                    <div className="flex flex-col items-center justify-center w-16 shrink-0 border-r border-white/10 pr-4">
                                        <span className="text-white font-bold">{session.startTime.substring(0, 5)}</span>
                                        <span className="text-white/40 text-xs mt-1">{session.endTime.substring(0, 5)}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium flex items-center justify-between">
                                            <span>{session.studentName}</span>
                                        </h4>
                                        <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5" />
                                            Avec {session.monitorName}
                                        </p>
                                        <div className="flex items-center text-xs text-white/40 mt-2">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {session.meetingPoint || 'Point par défaut'}
                                        </div>
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
