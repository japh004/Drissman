"use client";

import { useAuth } from "@/hooks";
import { useLocalStorage } from "@/hooks";
import { CalendarDays, Users, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import Link from "next/link";

interface MonitorSession {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    module: string;
    students: number;
    location: string;
    status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    type: string;
}

interface MonitorStudent {
    id: string;
    firstName: string;
    lastName: string;
    offerName: string;
    hoursCompleted: number;
    hoursRequired: number;
    status: "ACTIVE" | "COMPLETED" | "PAUSED";
}

export default function MonitorDashboard() {
    const { user } = useAuth();
    const [sessions, setSessions] = useLocalStorage<MonitorSession[]>("monitor_sessions", []);
    const [students] = useLocalStorage<MonitorStudent[]>("monitor_students", []);

    const today = new Date().toISOString().split("T")[0];
    const todaySessions = sessions.filter(s => s.date === today && s.status !== "CANCELLED");
    const assignedStudentsCount = students.length > 0
        ? students.length
        : sessions.reduce((acc, s) => acc + s.students, 0);
    const todayHours = todaySessions.reduce((acc, s) => {
        const [sh, sm] = s.startTime.split(":").map(Number);
        const [eh, em] = s.endTime.split(":").map(Number);
        return acc + (eh + em / 60) - (sh + sm / 60);
    }, 0);

    const stats = {
        todaySessions: todaySessions.length,
        assignedStudents: assignedStudentsCount,
        todayHours: Math.round(todayHours * 10) / 10,
    };

    const markCompleted = (id: string) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "COMPLETED" as const } : s));
    };

    return (
        <PageTransition className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-snow">Bonjour, {user?.firstName} 👋</h1>
                <p className="text-mist mt-1">Votre journée en un coup d&apos;œil.</p>
            </div>

            {/* KPIs */}
            <StaggerContainer className="grid sm:grid-cols-3 gap-4">
                <StaggerItem>
                    <div className="bg-gradient-to-br from-signal/10 to-amber-500/5 rounded-2xl border border-signal/20 p-5">
                        <CalendarDays className="h-5 w-5 text-signal opacity-60 mb-2" />
                        <p className="text-2xl font-black text-snow">{stats.todaySessions}</p>
                        <p className="text-xs text-mist/60">Séances aujourd&apos;hui</p>
                    </div>
                </StaggerItem>
                <StaggerItem>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl border border-blue-500/20 p-5">
                        <Users className="h-5 w-5 text-blue-400 opacity-60 mb-2" />
                        <p className="text-2xl font-black text-snow">{stats.assignedStudents}</p>
                        <p className="text-xs text-mist/60">Élèves assignés</p>
                    </div>
                </StaggerItem>
                <StaggerItem>
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl border border-green-500/20 p-5">
                        <Clock className="h-5 w-5 text-green-400 opacity-60 mb-2" />
                        <p className="text-2xl font-black text-snow">{stats.todayHours}h</p>
                        <p className="text-xs text-mist/60">Heures prévues aujourd&apos;hui</p>
                        {stats.todayHours > 0 && (
                            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${Math.min((stats.todayHours / 8) * 100, 100)}%` }} />
                            </div>
                        )}
                    </div>
                </StaggerItem>
            </StaggerContainer>

            {/* Today's sessions */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-snow">Séances du jour</h2>
                    <Link href="/monitor/planning" className="flex items-center gap-1 text-xs text-signal font-bold hover:underline">
                        Voir planning <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
                {todaySessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CalendarDays className="h-12 w-12 text-mist/15 mb-3" />
                        <p className="text-sm text-mist/50">Aucune séance aujourd&apos;hui</p>
                        <p className="text-[10px] text-mist/30 mt-1">Consultez votre planning pour voir vos prochaines séances</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todaySessions.map((s) => (
                            <div key={s.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${s.status === "COMPLETED" ? "bg-green-500/[0.02] border-green-500/10 opacity-60" : "bg-white/[0.02] border-white/[0.04] hover:border-white/10"}`}>
                                <span className="text-xl">{s.type}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-snow">{s.module}</p>
                                    <p className="text-xs text-mist/50">{s.location} · {s.students} élève{s.students > 1 ? "s" : ""}</p>
                                </div>
                                <span className="text-xs font-mono text-mist bg-white/5 px-2.5 py-1 rounded-lg">{s.startTime} - {s.endTime}</span>
                                {s.status !== "COMPLETED" ? (
                                    <button onClick={() => markCompleted(s.id)}
                                        className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2.5 py-1.5 rounded-lg hover:bg-green-500/20 transition-all">
                                        <CheckCircle className="h-3 w-3" /> Terminé
                                    </button>
                                ) : (
                                    <span className="text-[10px] font-bold text-green-400/60 bg-green-500/5 px-2.5 py-1.5 rounded-lg">✓ Fait</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
