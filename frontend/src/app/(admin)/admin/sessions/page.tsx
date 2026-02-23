"use client";

import { useState } from "react";
import { Plus, Search, Calendar, Users, BookOpen, Clock, ChevronDown, ChevronUp, Edit2, Trash2, Eye } from "lucide-react";

type SessionStatus = "DRAFT" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface SessionFormation {
    offerId: string;
    offerName: string;
    permitType: string;
    price: number;
    priceOverride?: number;
    maxStudentsOverride?: number;
    enrolledCount: number;
}

interface TrainingSession {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    enrollmentDeadline: string;
    maxStudents: number;
    status: SessionStatus;
    formations: SessionFormation[];
    totalEnrolled: number;
}

const mockSessions: TrainingSession[] = [
    {
        id: "1", name: "Rentrée Mars 2025", description: "Session de formation du premier trimestre 2025",
        startDate: "2025-03-01", endDate: "2025-06-30", enrollmentDeadline: "2025-02-28",
        maxStudents: 30, status: "PUBLISHED", totalEnrolled: 18,
        formations: [
            { offerId: "a", offerName: "Permis B Classique", permitType: "B", price: 65000, enrolledCount: 10 },
            { offerId: "b", offerName: "Code Illimité", permitType: "B", price: 15000, enrolledCount: 5 },
            { offerId: "c", offerName: "Permis Accéléré", permitType: "B", price: 120000, enrolledCount: 3 },
        ],
    },
    {
        id: "2", name: "Session Été 2025", description: "Formation intensive pendant les vacances",
        startDate: "2025-07-01", endDate: "2025-09-30", enrollmentDeadline: "2025-06-25",
        maxStudents: 25, status: "DRAFT", totalEnrolled: 0,
        formations: [
            { offerId: "a", offerName: "Permis B Classique", permitType: "B", price: 65000, priceOverride: 55000, enrolledCount: 0 },
            { offerId: "d", offerName: "Permis Moto A", permitType: "A", price: 45000, enrolledCount: 0 },
        ],
    },
    {
        id: "3", name: "Rentrée Janvier 2025", description: "Session terminée du début d'année",
        startDate: "2025-01-10", endDate: "2025-03-31", enrollmentDeadline: "2025-01-05",
        maxStudents: 20, status: "COMPLETED", totalEnrolled: 19,
        formations: [
            { offerId: "a", offerName: "Permis B Classique", permitType: "B", price: 65000, enrolledCount: 15 },
            { offerId: "b", offerName: "Code Illimité", permitType: "B", price: 15000, enrolledCount: 4 },
        ],
    },
];

const statusConfig: Record<SessionStatus, { label: string; class: string }> = {
    DRAFT: { label: "Brouillon", class: "bg-gray-500/10 text-gray-400" },
    PUBLISHED: { label: "Publiée", class: "bg-green-500/10 text-green-400" },
    IN_PROGRESS: { label: "En cours", class: "bg-signal/10 text-signal" },
    COMPLETED: { label: "Terminée", class: "bg-blue-500/10 text-blue-400" },
    CANCELLED: { label: "Annulée", class: "bg-red-500/10 text-red-400" },
};

function formatCurrency(n: number) { return new Intl.NumberFormat("fr-FR").format(n); }

export default function SessionsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>("1");
    const [showModal, setShowModal] = useState(false);

    const filtered = mockSessions.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Sessions de Formation</h1>
                    <p className="text-sm text-mist mt-0.5">{mockSessions.length} sessions · Chaque session regroupe plusieurs formations</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-signal to-amber-400 text-asphalt font-black px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                    <Plus className="h-4 w-4" /> Nouvelle Session
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher une session..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
            </div>

            {/* Session cards */}
            <div className="space-y-4">
                {filtered.map(session => {
                    const st = statusConfig[session.status];
                    const isExpanded = expandedId === session.id;
                    const fillPct = Math.round((session.totalEnrolled / session.maxStudents) * 100);

                    return (
                        <div key={session.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/10 transition-all">
                            {/* Header */}
                            <button onClick={() => setExpandedId(isExpanded ? null : session.id)}
                                className="w-full text-left p-5 flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-base font-black text-snow truncate">{session.name}</h2>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${st.class}`}>{st.label}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-mist/50">
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(session.startDate).toLocaleDateString("fr-FR")} → {new Date(session.endDate).toLocaleDateString("fr-FR")}</span>
                                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{session.formations.length} formation{session.formations.length > 1 ? "s" : ""}</span>
                                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{session.totalEnrolled}/{session.maxStudents} inscrits</span>
                                    </div>
                                </div>

                                {/* Fill bar */}
                                <div className="hidden sm:flex items-center gap-2 shrink-0">
                                    <div className="h-2 w-20 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${fillPct >= 90 ? "bg-red-400" : fillPct >= 60 ? "bg-signal" : "bg-blue-400"}`}
                                            style={{ width: `${fillPct}%` }} />
                                    </div>
                                    <span className="text-xs text-mist/40 font-mono">{fillPct}%</span>
                                </div>

                                {isExpanded ? <ChevronUp className="h-4 w-4 text-mist/40 shrink-0" /> : <ChevronDown className="h-4 w-4 text-mist/40 shrink-0" />}
                            </button>

                            {/* Expanded: Formations list */}
                            {isExpanded && (
                                <div className="border-t border-white/[0.06] p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-mist/40 uppercase tracking-wider">Formations proposées</h3>
                                        <div className="flex gap-1">
                                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-mist/40 hover:text-snow transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                                            <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-mist/40 hover:text-red-400 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        {session.formations.map(f => {
                                            const displayPrice = f.priceOverride ?? f.price;
                                            return (
                                                <div key={f.offerId} className="bg-white/[0.02] rounded-xl border border-white/[0.04] p-4 flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-signal/10 to-blue-500/10 flex items-center justify-center text-lg shrink-0">
                                                        {f.permitType === "A" ? "🏍️" : f.permitType === "B" ? "🚗" : "🚛"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-snow">{f.offerName}</p>
                                                        <p className="text-xs text-mist/40">Permis {f.permitType} · {f.enrolledCount} inscrit{f.enrolledCount > 1 ? "s" : ""}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-black text-signal">{formatCurrency(displayPrice)} F</p>
                                                        {f.priceOverride && <p className="text-[10px] text-mist/30 line-through">{formatCurrency(f.price)} F</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Session meta */}
                                    <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.04]">
                                        <div className="text-center">
                                            <p className="text-xs text-mist/40">Date limite inscription</p>
                                            <p className="text-sm font-bold text-snow">{new Date(session.enrollmentDeadline).toLocaleDateString("fr-FR")}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-mist/40">Durée</p>
                                            <p className="text-sm font-bold text-snow">
                                                {Math.round((new Date(session.endDate).getTime() - new Date(session.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} mois
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-mist/40">Places restantes</p>
                                            <p className="text-sm font-bold text-snow">{session.maxStudents - session.totalEnrolled}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-asphalt border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5"
                        onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-black text-snow">Nouvelle Session de Formation</h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Nom de la session</label>
                                <input type="text" placeholder="Ex : Rentrée Mars 2025"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Description</label>
                                <textarea rows={2} placeholder="Description de la session..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Date début</label>
                                    <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Date fin</label>
                                    <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Date limite inscription</label>
                                    <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Capacité max</label>
                                    <input type="number" defaultValue={30} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                            </div>

                            {/* Formation selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Formations incluses</label>
                                <p className="text-[10px] text-mist/40">Sélectionnez les formations à proposer dans cette session</p>
                                <div className="space-y-2">
                                    {["Permis B Classique — 65 000 F", "Code Illimité — 15 000 F", "Permis Accéléré — 120 000 F", "Permis Moto A — 45 000 F"].map((name, i) => (
                                        <label key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] cursor-pointer hover:border-signal/20 transition-all">
                                            <input type="checkbox" className="rounded border-white/20 bg-white/5 text-signal focus:ring-signal/20" />
                                            <span className="text-sm text-snow">{name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-mist hover:text-snow text-sm font-bold transition-all">Annuler</button>
                            <button className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-signal to-amber-400 text-asphalt text-sm font-black hover:opacity-90 transition-all">
                                Créer la session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
