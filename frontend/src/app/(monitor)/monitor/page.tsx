"use client";

import { useAuth, useInstructorProfile, useInstructorSessions } from "@/hooks";
import { Users, CalendarDays, CheckCircle, Loader2, MapPin, Clock } from "lucide-react";
import { isToday, format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MonitorDashboardPage() {
    const { user } = useAuth();
    const { monitorProfile, loading: profileLoading } = useInstructorProfile();
    const { sessions, loading: sessionsLoading } = useInstructorSessions(monitorProfile?.id);

    const todaySessions = sessions.filter(s => isToday(new Date(s.date)) && s.status !== 'CANCELED');

    // Extract unique students assigned to this instructor
    const uniqueStudents = new Set(sessions.map(s => s.studentName)).size;

    // Sessions awaiting validation (completed but pending some review logic, or just past due)
    const pendingEvaluations = sessions.filter(s => s.status === 'SCHEDULED' && new Date(`${s.date}T${s.startTime}`) < new Date()).length;

    const isLoading = profileLoading || sessionsLoading;

    const stats = [
        { label: "Leçons Aujourd'hui", value: todaySessions.length.toString(), icon: CalendarDays, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Élèves Assignés", value: uniqueStudents.toString(), icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "À Valider", value: pendingEvaluations.toString(), icon: CheckCircle, color: "text-amber-400", bg: "bg-amber-400/10" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Bonjour, {user?.firstName}
                </h1>
                <p className="text-white/60">
                    Voici l'aperçu de vos leçons de conduite aujourd'hui.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-3 flex justify-center py-12">
                        <Loader2 className="h-8 w-8 text-signal animate-spin" />
                    </div>
                ) : (
                    stats.map((stat, i) => (
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

            <div className="bg-asphalt-light border border-white/5 rounded-2xl p-6 min-h-[300px]">
                <h2 className="text-xl font-bold text-white mb-6">Planning de la journée</h2>

                {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 text-signal animate-spin" />
                    </div>
                ) : todaySessions.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-white/40 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        Aucune leçon planifiée aujourd'hui
                    </div>
                ) : (
                    <div className="space-y-4">
                        {todaySessions.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((session) => (
                            <div key={session.id} className="flex items-start gap-4 p-4 rounded-xl bg-asphalt/50 border border-white/5">
                                <div className="flex flex-col items-center justify-center w-16 shrink-0 border-r border-white/10 pr-4">
                                    <span className="text-white font-bold">{session.startTime.substring(0, 5)}</span>
                                    <span className="text-white/40 text-xs mt-1">{session.endTime.substring(0, 5)}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-medium flex items-center gap-2">
                                        <Users className="h-4 w-4 text-emerald-400" />
                                        {session.studentName}
                                    </h4>
                                    <div className="flex items-center text-sm text-white/50 mt-2">
                                        <MapPin className="h-3.5 w-3.5 mr-1.5" />
                                        {session.meetingPoint || 'Point de rendez-vous habituel'}
                                    </div>
                                </div>
                                <div>
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${session.status === 'SCHEDULED' ? 'bg-blue-400/10 text-blue-400'
                                            : session.status === 'COMPLETED' ? 'bg-emerald-400/10 text-emerald-400'
                                                : 'bg-white/10 text-white/60'
                                        }`}>
                                        {session.status === 'SCHEDULED' ? 'Prévue' : session.status === 'COMPLETED' ? 'Terminée' : session.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
