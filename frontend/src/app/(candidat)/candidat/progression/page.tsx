"use client";

import { CheckCircle, Clock } from "lucide-react";

const mockModulesProgress = [
    { id: "1", name: "Code de la route", category: "CODE", hoursCompleted: 16, hoursRequired: 20, status: "IN_PROGRESS", icon: "📖" },
    { id: "2", name: "Conduite accompagnée", category: "CONDUITE", hoursCompleted: 6, hoursRequired: 20, status: "IN_PROGRESS", icon: "🚗" },
    { id: "3", name: "Examen blanc code", category: "EXAMEN_BLANC", hoursCompleted: 0, hoursRequired: 4, status: "NOT_STARTED", icon: "📝" },
];

export default function CandidatProgressionPage() {
    const totalHours = mockModulesProgress.reduce((s, m) => s + m.hoursCompleted, 0);
    const totalRequired = mockModulesProgress.reduce((s, m) => s + m.hoursRequired, 0);
    const globalProgress = Math.round((totalHours / totalRequired) * 100);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-snow">Ma Progression</h1>
                <p className="text-sm text-mist mt-0.5">Suivi de vos modules de formation</p>
            </div>

            {/* Global progress */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-snow">Progression globale</h2>
                    <span className="text-2xl font-black text-signal">{globalProgress}%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-signal to-amber-400 rounded-full transition-all" style={{ width: `${globalProgress}%` }} />
                </div>
                <p className="text-xs text-mist/40 mt-2">{totalHours} heures sur {totalRequired} heures requises</p>
            </div>

            {/* Module cards */}
            <div className="space-y-4">
                {mockModulesProgress.map((mod) => {
                    const progress = Math.round((mod.hoursCompleted / mod.hoursRequired) * 100);
                    const isComplete = progress >= 100;
                    return (
                        <div key={mod.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 hover:border-white/10 transition-all">
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">{mod.icon}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-snow">{mod.name}</h3>
                                        {isComplete ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-lg"><CheckCircle className="h-3 w-3" /> Complété</span>
                                        ) : mod.status === "NOT_STARTED" ? (
                                            <span className="text-[10px] font-bold text-mist/40 bg-white/5 px-2 py-0.5 rounded-lg">Non commencé</span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-signal bg-signal/10 px-2 py-0.5 rounded-lg"><Clock className="h-3 w-3" /> En cours</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${isComplete ? "bg-green-400" : "bg-signal"}`} style={{ width: `${progress}%` }} />
                                        </div>
                                        <span className="text-xs font-mono text-mist/50 shrink-0">{mod.hoursCompleted}/{mod.hoursRequired}h</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
