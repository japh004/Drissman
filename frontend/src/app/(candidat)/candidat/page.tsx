"use client";

import { useAuth, usePartnerEnrollments, useStudentSessions } from "@/hooks";
import { BookOpen, CalendarDays, CheckCircle, Loader2 } from "lucide-react";

export default function CandidatDashboardPage() {
    const { user } = useAuth();
    const { enrollments, loading: enrollmentsLoading } = usePartnerEnrollments();
    const { sessions, loading: sessionsLoading } = useStudentSessions();

    const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE' || e.status === 'PENDING').length;
    const upcomingSessions = sessions.filter(s => s.status === 'SCHEDULED' && new Date(s.date) >= new Date()).length;

    // Calculate total hours completed from finished sessions
    const completedHours = sessions
        .filter(s => s.status === 'COMPLETED')
        .reduce((total, s) => {
            // Assuming default 1h if duration not strictly typed yet, or derived from start/end times
            return total + 1;
        }, 0);

    const isLoading = enrollmentsLoading || sessionsLoading;

    const stats = [
        { label: "Formations en cours", value: activeEnrollments.toString(), icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Prochaines leçons", value: upcomingSessions.toString(), icon: CalendarDays, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Heures complétées", value: `${completedHours}h`, icon: CheckCircle, color: "text-purple-400", bg: "bg-purple-400/10" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Bonjour, {user?.firstName}
                </h1>
                <p className="text-white/60">
                    Bienvenue dans votre espace étudiant personnel.
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
        </div>
    );
}
