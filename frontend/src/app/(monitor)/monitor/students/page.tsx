"use client";

import { useLocalStorage } from "@/hooks";
import { Users, TrendingUp, Search } from "lucide-react";
import { useState } from "react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion";

interface MonitorStudent {
    id: string;
    firstName: string;
    lastName: string;
    offerName: string;
    hoursCompleted: number;
    hoursRequired: number;
    status: "ACTIVE" | "COMPLETED" | "PAUSED";
}

const statusConfig: Record<string, { label: string; class: string }> = {
    ACTIVE: { label: "Actif", class: "bg-green-500/10 text-green-400" },
    COMPLETED: { label: "Terminé", class: "bg-blue-500/10 text-blue-400" },
    PAUSED: { label: "Pause", class: "bg-yellow-500/10 text-yellow-400" },
};

export default function MonitorStudentsPage() {
    const [students] = useLocalStorage<MonitorStudent[]>("monitor_students", []);
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageTransition className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-snow">Mes Élèves</h1>
                    <p className="text-sm text-mist mt-0.5">
                        {students.length > 0 ? `${students.length} élève${students.length > 1 ? "s" : ""} assigné${students.length > 1 ? "s" : ""}` : "Vos élèves assignés"}
                    </p>
                </div>
                {students.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/30" />
                        <input
                            type="text"
                            placeholder="Chercher un élève..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/[0.06] text-snow text-sm placeholder:text-mist/30 focus:border-signal/30 focus:outline-none transition-all w-56"
                        />
                    </div>
                )}
            </div>

            {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.03] rounded-2xl border border-white/[0.06]">
                    <Users className="h-16 w-16 text-mist/15 mb-4" />
                    <h3 className="text-lg font-bold text-snow/60 mb-1">Aucun élève assigné</h3>
                    <p className="text-sm text-mist/40 max-w-sm">Vos élèves apparaîtront ici lorsque l&apos;auto-école vous assignera des séances</p>
                </div>
            ) : (
                <StaggerContainer className="space-y-3">
                    {filtered.map((student) => {
                        const progress = student.hoursRequired > 0 ? Math.round((student.hoursCompleted / student.hoursRequired) * 100) : 0;
                        const st = statusConfig[student.status] || statusConfig.ACTIVE;
                        return (
                            <StaggerItem key={student.id}>
                                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-signal/20 to-blue-500/20 flex items-center justify-center text-signal font-bold text-xs shrink-0">
                                            {student.firstName[0]}{student.lastName[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="text-sm font-bold text-snow">{student.firstName} {student.lastName}</h3>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.class}`}>{st.label}</span>
                                            </div>
                                            <p className="text-xs text-mist/50">{student.offerName}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-green-400" : "bg-signal"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                                                </div>
                                                <span className="text-[10px] font-mono text-mist/40 shrink-0">{student.hoursCompleted}/{student.hoursRequired}h</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="flex items-center gap-1 text-xs text-mist/40">
                                                <TrendingUp className="h-3 w-3" />
                                                <span className="font-bold">{progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </StaggerItem>
                        );
                    })}
                    {filtered.length === 0 && searchQuery && (
                        <div className="text-center py-8">
                            <p className="text-sm text-mist/50">Aucun résultat pour &quot;{searchQuery}&quot;</p>
                        </div>
                    )}
                </StaggerContainer>
            )}
        </PageTransition>
    );
}
