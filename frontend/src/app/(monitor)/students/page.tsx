"use client";

import { useInstructorProfile, useInstructorSessions } from "@/hooks";
import { Loader2, Users, AlertCircle, FileText, Activity } from "lucide-react";
import { useMemo } from "react";

export default function MonitorStudentsPage() {
    const { monitorProfile } = useInstructorProfile();
    const { sessions, loading, error } = useInstructorSessions(monitorProfile?.id);

    // Grouping sessions to extract unique students and their lesson statistics
    const studentStats = useMemo(() => {
        if (!sessions) return [];

        const studentMap = new Map<string, {
            name: string;
            totalSessions: number;
            completedSessions: number;
            lastSessionDate?: string;
        }>();

        sessions.forEach(session => {
            const studentId = session.studentName || 'Élève Anonyme'; // Or session.enrollmentId if more robust naming wasn't guaranteed
            if (!studentMap.has(studentId)) {
                studentMap.set(studentId, {
                    name: session.studentName || 'Élève Anonyme',
                    totalSessions: 0,
                    completedSessions: 0,
                });
            }

            const stats = studentMap.get(studentId)!;
            stats.totalSessions++;
            if (session.status === 'COMPLETED') {
                stats.completedSessions++;
            }

            // Track most recent session date
            if (!stats.lastSessionDate || new Date(session.date) > new Date(stats.lastSessionDate)) {
                stats.lastSessionDate = session.date;
            }
        });

        // Convert Map to Array for mapping
        return Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [sessions]);


    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 text-signal animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-8">
                <div className="bg-red-400/10 border border-red-400/20 rounded-2xl p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                    <p className="text-red-400 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 flex flex-col h-[calc(100vh-8rem)]">
            <header className="shrink-0 space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
                    <Users className="h-8 w-8 mr-3 text-emerald-400" />
                    Mes Élèves Assignés
                </h1>
                <p className="text-white/60">
                    Découvrez la liste des élèves effectuant leur formation avec vous.
                </p>
            </header>

            <div className="flex-1 overflow-y-auto pr-2">
                {studentStats.length === 0 ? (
                    <div className="text-center py-16 bg-asphalt-light border border-white/5 rounded-2xl">
                        <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Aucun élève assigné</h3>
                        <p className="text-white/50 text-sm max-w-sm mx-auto">
                            Lorsque le secrétariat planifiera des leçons de conduite qui vous incombent, vos élèves apparaîtront ici automatiquement.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studentStats.map((student, idx) => (
                            <div key={idx} className="bg-asphalt-light border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                                            <span className="text-lg font-bold text-emerald-400">
                                                {student.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white capitalize">{student.name}</h3>
                                            <p className="text-xs text-white/50 flex items-center mt-1">
                                                <Activity className="h-3 w-3 mr-1" /> En formation
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/50 flex items-center">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Leçons dispensées
                                        </span>
                                        <span className="font-medium text-white bg-white/5 px-2 py-0.5 rounded">
                                            {student.completedSessions} / {student.totalSessions}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
