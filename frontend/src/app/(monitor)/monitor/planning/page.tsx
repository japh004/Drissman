"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks";
import { CalendarDays, Clock, MapPin, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { PageTransition } from "@/components/ui/motion";

interface MonitorSession {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    module: string;
    students: number;
    location: string;
    status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

const statusConfig: Record<string, { label: string; class: string }> = {
    SCHEDULED: { label: "Planifié", class: "bg-blue-500/10 text-blue-400" },
    CONFIRMED: { label: "Confirmé", class: "bg-signal/10 text-signal" },
    COMPLETED: { label: "Terminé", class: "bg-green-500/10 text-green-400" },
    CANCELLED: { label: "Annulé", class: "bg-red-500/10 text-red-400" },
};

function getWeekStart(offset: number) {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekDates(offset: number) {
    const start = getWeekStart(offset);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d.toISOString().split("T")[0];
    });
}

function formatWeekLabel(offset: number) {
    const start = getWeekStart(offset);
    return `Semaine du ${start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
}

export default function MonitorPlanningPage() {
    const [sessions, setSessions] = useLocalStorage<MonitorSession[]>("monitor_sessions", []);
    const [weekOffset, setWeekOffset] = useState(0);

    const weekDates = getWeekDates(weekOffset);
    const today = new Date().toISOString().split("T")[0];

    const weekSessions = sessions.filter(s => weekDates.includes(s.date) && s.status !== "CANCELLED");
    const grouped = weekDates.reduce<Record<string, MonitorSession[]>>((acc, date) => {
        const daySessions = weekSessions.filter(s => s.date === date);
        if (daySessions.length > 0) acc[date] = daySessions;
        return acc;
    }, {});

    const markCompleted = (id: string) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status: "COMPLETED" as const } : s));
    };

    return (
        <PageTransition className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-snow">Mon Planning</h1>
                    <p className="text-sm text-mist mt-0.5">
                        {weekSessions.length > 0 ? `${weekSessions.length} séance${weekSessions.length > 1 ? "s" : ""} cette semaine` : "Vos séances de la semaine"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 rounded-xl bg-white/5 text-mist hover:text-snow transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                    <span className="text-sm font-bold text-snow px-3">{formatWeekLabel(weekOffset)}</span>
                    <button onClick={() => setWeekOffset(o => o + 1)} className="p-2 rounded-xl bg-white/5 text-mist hover:text-snow transition-colors"><ChevronRight className="h-4 w-4" /></button>
                    {weekOffset !== 0 && (
                        <button onClick={() => setWeekOffset(0)} className="text-[10px] font-bold text-signal bg-signal/10 px-2.5 py-1.5 rounded-lg hover:bg-signal/20 transition-all">Aujourd&apos;hui</button>
                    )}
                </div>
            </div>

            {Object.keys(grouped).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.03] rounded-2xl border border-white/[0.06]">
                    <CalendarDays className="h-16 w-16 text-mist/15 mb-4" />
                    <h3 className="text-lg font-bold text-snow/60 mb-1">Aucune séance cette semaine</h3>
                    <p className="text-sm text-mist/40 max-w-sm">Vos séances planifiées par l&apos;auto-école apparaîtront ici</p>
                </div>
            ) : (
                Object.entries(grouped).map(([date, daySessions]) => {
                    const isToday = date === today;
                    return (
                        <div key={date}>
                            <h2 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isToday ? "text-signal" : "text-mist"}`}>
                                <CalendarDays className={`h-4 w-4 ${isToday ? "text-signal" : "text-mist/40"}`} />
                                {new Date(date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                                {isToday && <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-signal/20 text-signal">AUJOURD&apos;HUI</span>}
                            </h2>
                            <div className="space-y-2">
                                {daySessions.map(s => {
                                    const st = statusConfig[s.status] || statusConfig.SCHEDULED;
                                    return (
                                        <div key={s.id} className={`bg-white/[0.03] rounded-2xl border p-4 flex items-center gap-4 hover:border-white/10 transition-all ${isToday ? "border-signal/10" : "border-white/[0.06]"} ${s.status === "COMPLETED" ? "opacity-50" : ""}`}>
                                            <div className="bg-signal/10 text-signal font-mono text-xs font-bold p-2.5 rounded-xl text-center min-w-[80px]">
                                                <div>{s.startTime}</div>
                                                <div className="text-mist/30 text-[10px]">→ {s.endTime}</div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                    <h3 className="text-sm font-bold text-snow">{s.module}</h3>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.class}`}>{st.label}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-mist/50">
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</span>
                                                    <span>{s.students} élève{s.students > 1 ? "s" : ""}</span>
                                                </div>
                                            </div>
                                            {s.status !== "COMPLETED" && (
                                                <button onClick={() => markCompleted(s.id)}
                                                    className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2.5 py-1.5 rounded-lg hover:bg-green-500/20 transition-all shrink-0">
                                                    <CheckCircle className="h-3 w-3" /> Terminé
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            )}
        </PageTransition>
    );
}
