"use client";

import { CheckCircle, Clock, Target } from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { useLocalStorage } from "@/hooks";

interface ModuleProgress {
    id: string;
    name: string;
    category: string;
    hoursCompleted: number;
    hoursRequired: number;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    icon: string;
}

const milestones = [
    { pct: 25, label: "Démarrage" },
    { pct: 50, label: "Mi-parcours" },
    { pct: 75, label: "Presque !" },
    { pct: 100, label: "Examen" },
];

export default function CandidatProgressionPage() {
    const [modules] = useLocalStorage<ModuleProgress[]>("candidat_progress", []);

    const totalHours = modules.reduce((s, m) => s + m.hoursCompleted, 0);
    const totalRequired = modules.reduce((s, m) => s + m.hoursRequired, 0);
    const globalProgress = totalRequired > 0 ? Math.round((totalHours / totalRequired) * 100) : 0;

    return (
        <PageTransition className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-snow">Ma Progression</h1>
                <p className="text-sm text-mist mt-0.5">Suivi de vos modules de formation</p>
            </div>

            {/* Global progress with milestones */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-snow">Progression globale</h2>
                    <span className="text-2xl font-black text-signal">{globalProgress}%</span>
                </div>
                <div className="relative">
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-signal to-amber-400 rounded-full transition-all" style={{ width: `${globalProgress}%` }} />
                    </div>
                    {/* Milestones */}
                    <div className="flex items-center justify-between mt-2">
                        {milestones.map((m) => {
                            const reached = globalProgress >= m.pct;
                            return (
                                <div key={m.pct} className="flex flex-col items-center" style={{ width: "24%" }}>
                                    <div className={`h-2 w-2 rounded-full mb-1 transition-all ${reached ? "bg-signal shadow-lg shadow-signal/30" : "bg-white/10"}`} />
                                    <span className={`text-[9px] font-bold ${reached ? "text-signal" : "text-mist/30"}`}>{m.label}</span>
                                    <span className={`text-[8px] ${reached ? "text-signal/60" : "text-mist/20"}`}>{m.pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <p className="text-xs text-mist/40 mt-3">{totalHours} heures sur {totalRequired} heures requises</p>
            </div>

            {/* Module cards */}
            {modules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Target className="h-16 w-16 text-mist/15 mb-4" />
                    <h3 className="text-lg font-bold text-snow/60 mb-1">Aucun module en cours</h3>
                    <p className="text-sm text-mist/40 max-w-sm">Vos modules de formation apparaîtront ici une fois que vous serez inscrit à une offre</p>
                </div>
            ) : (
                <StaggerContainer className="space-y-4">
                    {modules.map((mod) => {
                        const progress = mod.hoursRequired > 0 ? Math.round((mod.hoursCompleted / mod.hoursRequired) * 100) : 0;
                        const isComplete = progress >= 100;
                        return (
                            <StaggerItem key={mod.id}>
                                <div className={`bg-white/[0.03] rounded-2xl border p-5 hover:border-white/10 transition-all ${isComplete ? "border-green-500/20" : "border-white/[0.06]"}`}>
                                    <div className="flex items-start gap-4">
                                        <span className="text-2xl">{mod.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                                                    <div className={`h-full rounded-full transition-all ${isComplete ? "bg-green-400" : "bg-signal"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                                                </div>
                                                <span className="text-xs font-mono text-mist/50 shrink-0">{mod.hoursCompleted}/{mod.hoursRequired}h</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </StaggerItem>
                        );
                    })}
                </StaggerContainer>
            )}
        </PageTransition>
    );
}
