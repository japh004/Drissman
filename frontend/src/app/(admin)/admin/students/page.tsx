"use client";

import { useState } from "react";
import { Search, GraduationCap, Clock, CheckCircle, XCircle, Eye } from "lucide-react";

const statusConfig: Record<string, { label: string; class: string }> = {
    ACTIVE: { label: "Actif", class: "bg-green-500/10 text-green-400" },
    PENDING: { label: "En attente", class: "bg-yellow-500/10 text-yellow-400" },
    COMPLETED: { label: "Terminé", class: "bg-blue-500/10 text-blue-400" },
    CANCELLED: { label: "Annulé", class: "bg-red-500/10 text-red-400" },
};

export default function StudentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    // No mock data — will be populated from API
    const students: never[] = [];

    const filtered = students;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Élèves</h1>
                    <p className="text-sm text-mist mt-0.5">0 élève inscrit</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher un élève..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
                </div>
                <div className="flex gap-2">
                    {["ALL", "ACTIVE", "PENDING", "COMPLETED"].map(st => (
                        <button key={st} onClick={() => setFilterStatus(st)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${filterStatus === st ? "bg-signal/10 text-signal border-signal/20" : "bg-white/5 text-mist border-white/10 hover:text-snow"}`}>
                            {st === "ALL" ? "Tous" : statusConfig[st]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <GraduationCap className="h-16 w-16 text-mist/15 mb-4" />
                <h3 className="text-lg font-bold text-snow/60 mb-1">Aucun élève inscrit</h3>
                <p className="text-sm text-mist/40 max-w-sm">Les élèves apparaîtront ici une fois qu&apos;ils se seront inscrits à vos formations via la page publique de votre auto-école.</p>
            </div>
        </div>
    );
}
