"use client";

import { CalendarDays, Clock, MapPin, User } from "lucide-react";
import { PageTransition } from "@/components/ui/motion";
import { useAuth, useLocalStorage } from "@/hooks";

interface Enrollment {
    id: string;
    schoolId?: string;
    modules: { id: string; name: string; category: string; requiredHours: number }[];
    status: "PENDING" | "ACTIVE" | "COMPLETED" | "REFUSED";
    studentId?: string;
}

interface StudentSession {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    module: string;
    monitor: string;
    location: string;
    status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

interface PlanningSlot {
    id: string;
    schoolId?: string;
    date: string;
    startTime: string;
    endTime: string;
    monitorName: string;
    moduleName: string;
    lessonName?: string;
    location: string;
    status: "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

const statusConfig: Record<string, { label: string; class: string }> = {
    SCHEDULED: { label: "Planifié", class: "bg-blue-500/10 text-blue-400" },
    CONFIRMED: { label: "Confirmé", class: "bg-signal/10 text-signal" },
    COMPLETED: { label: "Terminé", class: "bg-green-500/10 text-green-400" },
    CANCELLED: { label: "Annulé", class: "bg-red-500/10 text-red-400" },
};

function isToday(dateStr: string) {
    return dateStr === new Date().toISOString().split("T")[0];
}

function isTomorrow(dateStr: string) {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return dateStr === t.toISOString().split("T")[0];
}

export default function CandidatPlanningPage() {
    const { user } = useAuth();
    const [enrollments] = useLocalStorage<Enrollment[]>("candidat_enrollments", []);
    const [planningSlots] = useLocalStorage<PlanningSlot[]>("planning_slots", []);

    const myEnrollments = enrollments.filter(e => !user?.id || !e.studentId || e.studentId === user.id);
    const activeEnrollment = myEnrollments.find(e => e.status === "ACTIVE" || e.status === "PENDING");
    const allowedModuleNames = new Set((activeEnrollment?.modules || []).map(m => m.name));

    const sessions: StudentSession[] = planningSlots
        .filter(slot => {
            if (!activeEnrollment) return false;
            if (activeEnrollment.schoolId && slot.schoolId && slot.schoolId !== activeEnrollment.schoolId) return false;
            if (allowedModuleNames.size > 0 && !allowedModuleNames.has(slot.moduleName)) return false;
            return true;
        })
        .map(slot => ({
            id: slot.id,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            module: slot.lessonName ? `${slot.moduleName} · ${slot.lessonName}` : slot.moduleName,
            monitor: slot.monitorName,
            location: slot.location,
            status: slot.status === "IN_PROGRESS" ? "CONFIRMED" : slot.status,
        }));

    const upcoming = sessions.filter(s => s.status !== "COMPLETED" && s.status !== "CANCELLED");
    const past = sessions.filter(s => s.status === "COMPLETED");

    return (
        <PageTransition className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-snow">Mon Planning</h1>
                <p className="text-sm text-mist mt-0.5">
                    {upcoming.length > 0 ? `${upcoming.length} séance${upcoming.length > 1 ? "s" : ""} à venir` : "Vos séances à venir et passées"}
                </p>
            </div>

            {/* Upcoming */}
            <div>
                <h2 className="text-sm font-bold text-signal mb-3 uppercase tracking-wider">À venir</h2>
                {upcoming.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center bg-white/[0.03] rounded-2xl border border-white/[0.06]">
                        <CalendarDays className="h-12 w-12 text-mist/15 mb-3" />
                        <p className="text-sm text-mist/50">Aucune séance programmée</p>
                        <p className="text-[10px] text-mist/30 mt-1">Votre auto-école ajoutera vos séances ici</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcoming.map(s => {
                            const st = statusConfig[s.status] || statusConfig.SCHEDULED;
                            const today = isToday(s.date);
                            const tomorrow = isTomorrow(s.date);
                            return (
                                <div key={s.id} className={`bg-white/[0.03] rounded-2xl border p-4 flex items-center gap-4 hover:border-white/10 transition-all ${today ? "border-signal/30 bg-signal/[0.02]" : "border-white/[0.06]"}`}>
                                    <div className="bg-signal/10 text-signal font-mono text-xs font-bold p-2.5 rounded-xl text-center min-w-[80px]">
                                        <div>{s.startTime}</div>
                                        <div className="text-mist/30 text-[10px]">{new Date(s.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            <h3 className="text-sm font-bold text-snow">{s.module}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.class}`}>{st.label}</span>
                                            {today && <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-signal/20 text-signal animate-pulse">AUJOURD&apos;HUI</span>}
                                            {tomorrow && <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400">DEMAIN</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-mist/50">
                                            <span className="flex items-center gap-1"><User className="h-3 w-3" />{s.monitor}</span>
                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.startTime} - {s.endTime}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* History */}
            <div>
                <h2 className="text-sm font-bold text-mist/40 mb-3 uppercase tracking-wider">Historique</h2>
                {past.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Clock className="h-8 w-8 text-mist/10 mb-2" />
                        <p className="text-xs text-mist/30">Vos séances terminées apparaîtront ici</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {past.map(s => (
                            <div key={s.id} className="bg-white/[0.02] rounded-xl border border-white/[0.04] p-3 flex items-center gap-4 opacity-60">
                                <span className="text-xs text-mist/40 font-mono min-w-[80px] text-center">{new Date(s.date + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                                <div className="flex-1"><p className="text-sm text-mist">{s.module} · {s.monitor}</p></div>
                                <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-lg">✓ Terminé</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
