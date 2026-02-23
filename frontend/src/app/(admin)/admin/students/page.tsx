"use client";

import { useState } from "react";
import { Search, GraduationCap, Clock, CheckCircle, XCircle, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface StudentEnrollment {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    offer: string;
    enrollmentStatus: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    progress: number;
    hoursCompleted: number;
    hoursRequired: number;
    enrolledAt: string;
    modules: { name: string; category: string; hoursCompleted: number; hoursRequired: number }[];
}

const statusConfig: Record<string, { label: string; class: string }> = {
    ACTIVE: { label: "Actif", class: "bg-green-500/10 text-green-400" },
    PENDING: { label: "En attente", class: "bg-yellow-500/10 text-yellow-400" },
    COMPLETED: { label: "Terminé", class: "bg-blue-500/10 text-blue-400" },
    CANCELLED: { label: "Annulé", class: "bg-red-500/10 text-red-400" },
};

export default function StudentsPage() {
    const [students, setStudents] = useState<StudentEnrollment[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = students.filter(s => {
        const matchSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === "ALL" || s.enrollmentStatus === filterStatus;
        return matchSearch && matchStatus;
    });

    const pendingCount = students.filter(s => s.enrollmentStatus === "PENDING").length;
    const activeCount = students.filter(s => s.enrollmentStatus === "ACTIVE").length;

    const handleValidate = (id: string) => {
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, enrollmentStatus: "ACTIVE" as const } : s
        ));
        toast.success("Inscription validée");
    };

    const handleRefuse = (id: string) => {
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, enrollmentStatus: "CANCELLED" as const } : s
        ));
        toast.success("Inscription refusée");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Élèves</h1>
                    <p className="text-sm text-mist mt-0.5">
                        {students.length} élève{students.length > 1 ? "s" : ""} inscrit{students.length > 1 ? "s" : ""}
                        {pendingCount > 0 && <> · <span className="text-yellow-400">{pendingCount} en attente</span></>}
                    </p>
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

            {/* Empty state or Table */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <GraduationCap className="h-16 w-16 text-mist/15 mb-4" />
                    <h3 className="text-lg font-bold text-snow/60 mb-1">Aucun élève inscrit</h3>
                    <p className="text-sm text-mist/40 max-w-sm">
                        Les élèves apparaîtront ici lorsqu&apos;ils s&apos;inscriront à vos offres.
                        Vous pourrez alors valider ou refuser leurs inscriptions.
                    </p>
                </div>
            ) : (
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">Élève</th>
                                    <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Offre</th>
                                    <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">Statut</th>
                                    <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Progression</th>
                                    <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Inscrit le</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((student) => {
                                    const st = statusConfig[student.enrollmentStatus] || statusConfig.ACTIVE;
                                    const isExpanded = expandedId === student.id;
                                    return (
                                        <>
                                            <tr key={student.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                                onClick={() => setExpandedId(isExpanded ? null : student.id)}>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-signal/20 to-blue-500/20 flex items-center justify-center text-signal font-bold text-xs shrink-0">
                                                            {student.firstName[0]}{student.lastName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-snow">{student.firstName} {student.lastName}</p>
                                                            <p className="text-[10px] text-mist/40">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 hidden lg:table-cell">
                                                    <span className="text-xs text-mist">{student.offer}</span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${st.class}`}>{st.label}</span>
                                                </td>
                                                <td className="px-5 py-4 hidden md:table-cell">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${student.progress >= 100 ? "bg-green-400" : student.progress >= 60 ? "bg-signal" : "bg-blue-400"}`}
                                                                style={{ width: `${student.progress}%` }} />
                                                        </div>
                                                        <span className="text-xs text-mist/50 font-mono">{student.hoursCompleted}/{student.hoursRequired}h</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 hidden lg:table-cell">
                                                    <span className="text-xs text-mist/40">{new Date(student.enrolledAt).toLocaleDateString("fr-FR")}</span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {student.enrollmentStatus === "PENDING" ? (
                                                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => handleValidate(student.id)}
                                                                className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-bold hover:bg-green-500/20 transition-all">Valider</button>
                                                            <button onClick={() => handleRefuse(student.id)}
                                                                className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-all">Refuser</button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-mist/30">
                                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                            {/* Expanded module detail */}
                                            {isExpanded && student.modules.length > 0 && (
                                                <tr key={`${student.id}-detail`}>
                                                    <td colSpan={6} className="px-5 py-4 bg-white/[0.01]">
                                                        <p className="text-xs font-bold text-mist/40 uppercase tracking-wider mb-3">Progression par module</p>
                                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {student.modules.map((mod, i) => {
                                                                const pct = mod.hoursRequired > 0 ? Math.round((mod.hoursCompleted / mod.hoursRequired) * 100) : 0;
                                                                return (
                                                                    <div key={i} className="bg-white/[0.02] rounded-xl border border-white/[0.04] p-3">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span>{mod.category === "CODE" ? "📖" : mod.category === "CONDUITE" ? "🚗" : "📝"}</span>
                                                                            <span className="text-xs font-bold text-snow">{mod.name}</span>
                                                                        </div>
                                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                                                                            <div className={`h-full rounded-full ${pct >= 100 ? "bg-green-400" : pct >= 60 ? "bg-signal" : "bg-blue-400"}`}
                                                                                style={{ width: `${Math.min(pct, 100)}%` }} />
                                                                        </div>
                                                                        <p className="text-[10px] text-mist/40">{mod.hoursCompleted}h / {mod.hoursRequired}h ({pct}%)</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
