"use client";

import { CalendarDays, Clock, MapPin, User } from "lucide-react";

const mockPlanning = [
    { id: "1", date: "2025-02-25", startTime: "11:00", endTime: "12:00", module: "Conduite B", monitor: "Jean-Paul M.", location: "Véhicule #1", status: "SCHEDULED" },
    { id: "2", date: "2025-02-26", startTime: "09:00", endTime: "11:00", module: "Code de la route", monitor: "Marie D.", location: "Salle A", status: "SCHEDULED" },
    { id: "3", date: "2025-02-28", startTime: "14:00", endTime: "15:00", module: "Conduite B", monitor: "Jean-Paul M.", location: "Véhicule #2", status: "CONFIRMED" },
    { id: "4", date: "2025-02-20", startTime: "11:00", endTime: "12:00", module: "Conduite B", monitor: "Jean-Paul M.", location: "Véhicule #1", status: "COMPLETED" },
    { id: "5", date: "2025-02-18", startTime: "09:00", endTime: "11:00", module: "Code de la route", monitor: "Marie D.", location: "Salle A", status: "COMPLETED" },
];

const statusConfig: Record<string, { label: string; class: string }> = {
    SCHEDULED: { label: "Planifié", class: "bg-blue-500/10 text-blue-400" },
    CONFIRMED: { label: "Confirmé", class: "bg-signal/10 text-signal" },
    COMPLETED: { label: "Terminé", class: "bg-green-500/10 text-green-400" },
};

export default function CandidatPlanningPage() {
    const upcoming = mockPlanning.filter(s => s.status !== "COMPLETED");
    const past = mockPlanning.filter(s => s.status === "COMPLETED");

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-snow">Mon Planning</h1>
                <p className="text-sm text-mist mt-0.5">Vos séances à venir et passées</p>
            </div>

            <div>
                <h2 className="text-sm font-bold text-signal mb-3 uppercase tracking-wider">À venir</h2>
                <div className="space-y-3">
                    {upcoming.map(s => {
                        const st = statusConfig[s.status] || statusConfig.SCHEDULED;
                        return (
                            <div key={s.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 flex items-center gap-4 hover:border-white/10 transition-all">
                                <div className="bg-signal/10 text-signal font-mono text-xs font-bold p-2.5 rounded-xl text-center min-w-[80px]">
                                    <div>{s.startTime}</div>
                                    <div className="text-mist/30 text-[10px]">{new Date(s.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-sm font-bold text-snow">{s.module}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.class}`}>{st.label}</span>
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
            </div>

            <div>
                <h2 className="text-sm font-bold text-mist/40 mb-3 uppercase tracking-wider">Historique</h2>
                <div className="space-y-2">
                    {past.map(s => (
                        <div key={s.id} className="bg-white/[0.02] rounded-xl border border-white/[0.04] p-3 flex items-center gap-4 opacity-60">
                            <span className="text-xs text-mist/40 font-mono min-w-[80px] text-center">{new Date(s.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                            <div className="flex-1"><p className="text-sm text-mist">{s.module} · {s.monitor}</p></div>
                            <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-lg">✓ Terminé</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
