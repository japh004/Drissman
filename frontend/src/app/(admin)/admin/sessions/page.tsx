"use client";

import { useState } from "react";
import { Plus, Search, CalendarDays, Clock, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const mockSessions = [
    { id: "1", date: "2025-02-24", startTime: "09:00", endTime: "11:00", module: "Code de la route", monitor: "Marie D.", students: 12, maxStudents: 15, location: "Salle A", status: "SCHEDULED" },
    { id: "2", date: "2025-02-24", startTime: "11:00", endTime: "12:00", module: "Conduite B", monitor: "Jean-Paul M.", students: 1, maxStudents: 1, location: "Véhicule #1", status: "CONFIRMED" },
    { id: "3", date: "2025-02-24", startTime: "14:00", endTime: "15:00", module: "Conduite B", monitor: "Jean-Paul M.", students: 1, maxStudents: 1, location: "Véhicule #2", status: "IN_PROGRESS" },
    { id: "4", date: "2025-02-24", startTime: "15:00", endTime: "17:00", module: "Examen Blanc", monitor: "Marie D.", students: 6, maxStudents: 10, location: "Salle B", status: "SCHEDULED" },
    { id: "5", date: "2025-02-25", startTime: "09:00", endTime: "11:00", module: "Code de la route", monitor: "Marie D.", students: 10, maxStudents: 15, location: "Salle A", status: "SCHEDULED" },
    { id: "6", date: "2025-02-25", startTime: "14:00", endTime: "16:00", module: "Manœuvres plateau", monitor: "Pierre Y.", students: 3, maxStudents: 4, location: "Plateau", status: "SCHEDULED" },
];

const statusConfig: Record<string, { label: string; class: string }> = {
    SCHEDULED: { label: "Planifié", class: "bg-blue-500/10 text-blue-400" },
    CONFIRMED: { label: "Confirmé", class: "bg-signal/10 text-signal" },
    IN_PROGRESS: { label: "En cours", class: "bg-green-500/10 text-green-400" },
    COMPLETED: { label: "Terminé", class: "bg-mist/10 text-mist/60" },
    CANCELLED: { label: "Annulé", class: "bg-red-500/10 text-red-400" },
};

const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function SessionsPage() {
    const [view, setView] = useState<"list" | "calendar">("list");
    const [showModal, setShowModal] = useState(false);

    // Group by date
    const grouped = mockSessions.reduce<Record<string, typeof mockSessions>>((acc, s) => {
        if (!acc[s.date]) acc[s.date] = [];
        acc[s.date].push(s);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Sessions & Planning</h1>
                    <p className="text-sm text-mist mt-0.5">{mockSessions.length} séances planifiées</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 rounded-xl border border-white/10 p-0.5">
                        <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "list" ? "bg-signal/10 text-signal" : "text-mist hover:text-snow"}`}>Liste</button>
                        <button onClick={() => setView("calendar")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "calendar" ? "bg-signal/10 text-signal" : "text-mist hover:text-snow"}`}>Calendrier</button>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-signal to-amber-400 text-asphalt font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-signal/20"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle séance
                    </button>
                </div>
            </div>

            {view === "list" ? (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([date, sessions]) => (
                        <div key={date}>
                            <h2 className="text-sm font-bold text-mist mb-3 flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-signal" />
                                {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                            </h2>
                            <div className="space-y-2">
                                {sessions.map((session) => {
                                    const st = statusConfig[session.status] || statusConfig.SCHEDULED;
                                    return (
                                        <div key={session.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 flex items-center gap-4 hover:border-white/10 transition-all">
                                            <div className="bg-signal/10 text-signal font-mono text-xs font-bold p-2.5 rounded-xl text-center shrink-0 min-w-[80px]">
                                                <div>{session.startTime}</div>
                                                <div className="text-mist/30 text-[10px]">→ {session.endTime}</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="text-sm font-bold text-snow truncate">{session.module}</h3>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.class}`}>{st.label}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-mist/50">
                                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{session.monitor}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.location}</span>
                                                </div>
                                            </div>
                                            <div className="text-center shrink-0">
                                                <p className="text-sm font-bold text-snow">{session.students}/{session.maxStudents}</p>
                                                <p className="text-[10px] text-mist/40">élèves</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <button className="p-2 rounded-xl bg-white/5 text-mist hover:text-snow transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                        <h2 className="text-lg font-black text-snow">Semaine du 24 Février 2025</h2>
                        <button className="p-2 rounded-xl bg-white/5 text-mist hover:text-snow transition-colors"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                        {days.map((day, i) => (
                            <div key={day} className="text-center">
                                <div className="text-xs font-bold text-mist/40 mb-2">{day}</div>
                                <div className="text-sm font-bold text-snow mb-3">{24 + i}</div>
                                <div className="space-y-1">
                                    {mockSessions.filter(s => new Date(s.date).getDate() === 24 + i).map(s => (
                                        <div key={s.id} className="bg-signal/10 border border-signal/20 rounded-lg p-1.5 text-[10px]">
                                            <div className="font-bold text-signal">{s.startTime}</div>
                                            <div className="text-mist/60 truncate">{s.module}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-asphalt border border-white/10 rounded-2xl w-full max-w-lg p-6">
                        <h2 className="text-lg font-black text-snow mb-5">Nouvelle séance</h2>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Date</label>
                                    <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" required /></div>
                                <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Module</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm">
                                        <option>Code de la route</option><option>Conduite B</option><option>Examen Blanc</option>
                                    </select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Heure début</label>
                                    <input type="time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" required /></div>
                                <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Heure fin</label>
                                    <input type="time" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" required /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Moniteur</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm">
                                        <option>Jean-Paul M.</option><option>Marie D.</option><option>Pierre Y.</option>
                                    </select></div>
                                <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Capacité max</label>
                                    <input type="number" defaultValue={1} min={1} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                            </div>
                            <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Lieu</label>
                                <input type="text" placeholder="Salle A, Véhicule #1..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                            <div className="flex items-center gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-mist text-sm font-bold hover:bg-white/10 transition-all">Annuler</button>
                                <button type="submit"
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-signal to-amber-400 text-asphalt text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-signal/20">Créer la séance</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
