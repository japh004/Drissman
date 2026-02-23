"use client";

import { useAuth } from "@/hooks";
import { CalendarDays, Users, Clock } from "lucide-react";

export default function MonitorDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-snow">Bonjour, {user?.firstName} 👋</h1>
                <p className="text-mist mt-1">Votre journée en un coup d&apos;œil.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-signal/10 to-amber-500/5 rounded-2xl border border-signal/20 p-5">
                    <CalendarDays className="h-5 w-5 text-signal opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">4</p>
                    <p className="text-xs text-mist/60">Séances aujourd&apos;hui</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl border border-blue-500/20 p-5">
                    <Users className="h-5 w-5 text-blue-400 opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">12</p>
                    <p className="text-xs text-mist/60">Élèves assignés</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl border border-green-500/20 p-5">
                    <Clock className="h-5 w-5 text-green-400 opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">6h</p>
                    <p className="text-xs text-mist/60">Heures prévues aujourd&apos;hui</p>
                </div>
            </div>

            {/* Today's sessions */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                <h2 className="text-lg font-black text-snow mb-4">Séances du jour</h2>
                <div className="space-y-3">
                    {[
                        { time: "09:00 - 11:00", module: "Code de la route", students: 12, location: "Salle A", type: "📖" },
                        { time: "11:00 - 12:00", module: "Conduite B", students: 1, location: "Véhicule #1", type: "🚗" },
                        { time: "14:00 - 15:00", module: "Conduite B", students: 1, location: "Véhicule #2", type: "🚗" },
                        { time: "15:00 - 17:00", module: "Examen Blanc", students: 6, location: "Salle B", type: "📝" },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <span className="text-xl">{s.type}</span>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-snow">{s.module}</p>
                                <p className="text-xs text-mist/50">{s.location} · {s.students} élève{s.students > 1 ? "s" : ""}</p>
                            </div>
                            <span className="text-xs font-mono text-mist bg-white/5 px-2.5 py-1 rounded-lg">{s.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
