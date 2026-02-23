"use client";

import { CalendarDays, Clock, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react";

const mockSessions = [
    { id: "1", date: "2025-02-24", startTime: "09:00", endTime: "11:00", module: "Code de la route", students: 12, location: "Salle A", status: "SCHEDULED" },
    { id: "2", date: "2025-02-24", startTime: "11:00", endTime: "12:00", module: "Conduite B", students: 1, location: "Véhicule #1", status: "CONFIRMED" },
    { id: "3", date: "2025-02-24", startTime: "14:00", endTime: "15:00", module: "Conduite B", students: 1, location: "Véhicule #2", status: "SCHEDULED" },
    { id: "4", date: "2025-02-25", startTime: "09:00", endTime: "11:00", module: "Code de la route", students: 10, location: "Salle A", status: "SCHEDULED" },
    { id: "5", date: "2025-02-25", startTime: "14:00", endTime: "16:00", module: "Manœuvres plateau", students: 3, location: "Plateau", status: "SCHEDULED" },
];

const statusConfig: Record<string, { label: string; class: string }> = {
    SCHEDULED: { label: "Planifié", class: "bg-blue-500/10 text-blue-400" },
    CONFIRMED: { label: "Confirmé", class: "bg-signal/10 text-signal" },
    COMPLETED: { label: "Terminé", class: "bg-green-500/10 text-green-400" },
};

export default function MonitorPlanningPage() {
    const grouped = mockSessions.reduce<Record<string, typeof mockSessions>>((acc, s) => {
        if (!acc[s.date]) acc[s.date] = [];
        acc[s.date].push(s);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-snow">Mon Planning</h1>
                    <p className="text-sm text-mist mt-0.5">Vos séances de la semaine</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl bg-white/5 text-mist hover:text-snow transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                    <span className="text-sm font-bold text-snow px-3">Semaine du 24 Fév</span>
                    <button className="p-2 rounded-xl bg-white/5 text-mist hover:text-snow transition-colors"><ChevronRight className="h-4 w-4" /></button>
                </div>
            </div>

            {Object.entries(grouped).map(([date, sessions]) => (
                <div key={date}>
                    <h2 className="text-sm font-bold text-mist mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-signal" />
                        {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </h2>
                    <div className="space-y-2">
                        {sessions.map(s => {
                            const st = statusConfig[s.status] || statusConfig.SCHEDULED;
                            return (
                                <div key={s.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 flex items-center gap-4 hover:border-white/10 transition-all">
                                    <div className="bg-signal/10 text-signal font-mono text-xs font-bold p-2.5 rounded-xl text-center min-w-[80px]">
                                        <div>{s.startTime}</div>
                                        <div className="text-mist/30 text-[10px]">→ {s.endTime}</div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-sm font-bold text-snow">{s.module}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.class}`}>{st.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-mist/50">
                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</span>
                                            <span>{s.students} élève{s.students > 1 ? "s" : ""}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
