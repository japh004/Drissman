"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks";
import { Plus, Search, Calendar, Users, BookOpen, ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { syncOfferPublication } from "@/lib/offer-publication";

type SessionStatus = "DRAFT" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface SessionFormation {
    offerId: string;
    offerName: string;
    permitType: string;
    price: number;
    priceOverride?: number;
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

const statusConfig: Record<SessionStatus, { label: string; class: string }> = {
    DRAFT: { label: "Brouillon", class: "bg-gray-500/10 text-gray-400" },
    PUBLISHED: { label: "Publiée", class: "bg-green-500/10 text-green-400" },
    IN_PROGRESS: { label: "En cours", class: "bg-signal/10 text-signal" },
    COMPLETED: { label: "Terminée", class: "bg-blue-500/10 text-blue-400" },
    CANCELLED: { label: "Annulée", class: "bg-red-500/10 text-red-400" },
};

function formatCurrency(n: number) { return new Intl.NumberFormat("fr-FR").format(n); }

const emptyForm = { name: "", description: "", startDate: "", endDate: "", enrollmentDeadline: "", maxStudents: 30, selectedOfferIds: [] as string[] };

export default function SessionsPage() {
    const [sessions, setSessions] = useLocalStorage<TrainingSession[]>("sessions", []);
    const [allOffers, setOffers] = useLocalStorage<any[]>("offers", []);

    // Available offers are those created by admin that are not archived
    const availableFormations = allOffers.filter(o => o.status !== "ARCHIVED").map(o => ({
        offerId: o.id,
        offerName: o.name,
        permitType: o.permitType || "B",
        price: o.price
    }));

    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const filtered = sessions.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleCreate = () => {
        if (!form.name.trim()) { toast.error("Le nom de la session est obligatoire"); return; }
        if (!form.startDate || !form.endDate) { toast.error("Les dates de début et fin sont obligatoires"); return; }
        if (form.selectedOfferIds.length === 0) { toast.error("Sélectionnez au moins une formation"); return; }

        const newSession: TrainingSession = {
            id: crypto.randomUUID(),
            name: form.name.trim(),
            description: form.description.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
            enrollmentDeadline: form.enrollmentDeadline || form.startDate,
            maxStudents: form.maxStudents,
            status: "DRAFT",
            totalEnrolled: 0,
            formations: form.selectedOfferIds.map(id => {
                const offer = availableFormations.find(f => f.offerId === id)!;
                return { ...offer, enrolledCount: 0 };
            }),
        };

        setSessions(prev => [newSession, ...prev]);
        setOffers(prev => syncOfferPublication(prev, [newSession, ...sessions]));
        setForm(emptyForm);
        setShowModal(false);
        setExpandedId(newSession.id);
        toast.success(`Session "${newSession.name}" créée avec succès`);
    };

    const handleDelete = (id: string) => {
        const session = sessions.find(s => s.id === id);
        if (session && session.totalEnrolled > 0) { toast.error("Impossible de supprimer une session avec des inscrits"); return; }
        const nextSessions = sessions.filter(s => s.id !== id);
        setSessions(nextSessions);
        setOffers(prev => syncOfferPublication(prev, nextSessions));
        toast.success("Session supprimée");
    };

    const toggleFormation = (offerId: string) => {
        setForm(prev => ({
            ...prev,
            selectedOfferIds: prev.selectedOfferIds.includes(offerId)
                ? prev.selectedOfferIds.filter(id => id !== offerId)
                : [...prev.selectedOfferIds, offerId],
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Sessions de Formation</h1>
                    <p className="text-sm text-mist mt-0.5">{sessions.length} session{sessions.length > 1 ? "s" : ""} · Chaque session regroupe plusieurs formations</p>
                </div>
                <button onClick={() => { setForm(emptyForm); setShowModal(true); }}
                    className="flex items-center gap-2 bg-gradient-to-r from-signal to-amber-400 text-asphalt font-black px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                    <Plus className="h-4 w-4" /> Nouvelle Session
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher une session..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Calendar className="h-16 w-16 text-mist/15 mb-4" />
                    <h3 className="text-lg font-bold text-snow/60 mb-1">Aucune session</h3>
                    <p className="text-sm text-mist/40 max-w-sm">Créez une session pour regrouper plusieurs formations et ouvrir les inscriptions à vos élèves.</p>
                    <button onClick={() => { setForm(emptyForm); setShowModal(true); }}
                        className="mt-4 flex items-center gap-2 bg-signal/10 text-signal font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-signal/20 transition-all">
                        <Plus className="h-4 w-4" /> Créer une session
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(session => {
                        const st = statusConfig[session.status];
                        const isExpanded = expandedId === session.id;
                        const fillPct = session.maxStudents > 0 ? Math.round((session.totalEnrolled / session.maxStudents) * 100) : 0;

                        return (
                            <div key={session.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/10 transition-all">
                                <button onClick={() => setExpandedId(isExpanded ? null : session.id)}
                                    className="w-full text-left p-5 flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-base font-black text-snow truncate">{session.name}</h2>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${st.class}`}>{st.label}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-mist/50 flex-wrap">
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(session.startDate).toLocaleDateString("fr-FR")} → {new Date(session.endDate).toLocaleDateString("fr-FR")}</span>
                                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{session.formations.length} formation{session.formations.length > 1 ? "s" : ""}</span>
                                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{session.totalEnrolled}/{session.maxStudents} inscrits</span>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                                        <div className="h-2 w-20 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${fillPct >= 90 ? "bg-red-400" : fillPct >= 60 ? "bg-signal" : "bg-blue-400"}`}
                                                style={{ width: `${fillPct}%` }} />
                                        </div>
                                        <span className="text-xs text-mist/40 font-mono">{fillPct}%</span>
                                    </div>
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-mist/40 shrink-0" /> : <ChevronDown className="h-4 w-4 text-mist/40 shrink-0" />}
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-white/[0.06] p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-mist/40 uppercase tracking-wider">Formations proposées</h3>
                                            <div className="flex gap-1">
                                                <button className="p-1.5 rounded-lg hover:bg-white/5 text-mist/40 hover:text-snow transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                                                <button onClick={() => handleDelete(session.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-mist/40 hover:text-red-400 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
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
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-asphalt border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5"
                        onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-black text-snow">Nouvelle Session de Formation</h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Nom de la session *</label>
                                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Ex : Rentrée Mars 2025"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Description</label>
                                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Description de la session..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Date début *</label>
                                    <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Date fin *</label>
                                    <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Date limite inscription</label>
                                    <input type="date" value={form.enrollmentDeadline} onChange={e => setForm(p => ({ ...p, enrollmentDeadline: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Capacité max</label>
                                    <input type="number" value={form.maxStudents} onChange={e => setForm(p => ({ ...p, maxStudents: parseInt(e.target.value) || 30 }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Formations incluses *</label>
                                <p className="text-[10px] text-mist/40">Sélectionnez les formations à proposer dans cette session</p>
                                <div className="space-y-2">
                                    {availableFormations.map(offer => {
                                        const checked = form.selectedOfferIds.includes(offer.offerId);
                                        return (
                                            <label key={offer.offerId}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? "bg-signal/5 border-signal/30" : "bg-white/[0.02] border-white/[0.04] hover:border-signal/20"}`}>
                                                <input type="checkbox" checked={checked} onChange={() => toggleFormation(offer.offerId)}
                                                    className="rounded border-white/20 bg-white/5 text-signal focus:ring-signal/20" />
                                                <span className="text-sm text-snow flex-1">{offer.offerName}</span>
                                                <span className="text-xs font-bold text-signal">{formatCurrency(offer.price)} F</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-mist hover:text-snow text-sm font-bold transition-all">Annuler</button>
                            <button onClick={handleCreate}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-signal to-amber-400 text-asphalt text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                                Créer la session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
