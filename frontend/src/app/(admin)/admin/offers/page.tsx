"use client";

import { useState } from "react";
import { Plus, Search, BookOpen, MoreVertical, Edit2, Trash2, Eye, Filter, Package } from "lucide-react";
import { toast } from "sonner";

interface Offer {
    id: string;
    name: string;
    description: string;
    price: number;
    hours: number;
    permitType: string;
    status: "ACTIVE" | "DRAFT" | "ARCHIVED";
    modulesCount: number;
    enrollmentsCount: number;
}

function formatPrice(amount: number) {
    return new Intl.NumberFormat("fr-FR").format(amount);
}

const emptyForm = { name: "", description: "", price: 0, hours: 0, permitType: "B", status: "DRAFT" as const };

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const filteredOffers = offers.filter(o =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        if (!form.name.trim()) { toast.error("Le nom de l'offre est obligatoire"); return; }
        if (form.price <= 0) { toast.error("Le prix doit être supérieur à 0"); return; }

        const newOffer: Offer = {
            id: crypto.randomUUID(),
            name: form.name.trim(),
            description: form.description.trim(),
            price: form.price,
            hours: form.hours,
            permitType: form.permitType,
            status: "DRAFT",
            modulesCount: 0,
            enrollmentsCount: 0,
        };

        setOffers(prev => [newOffer, ...prev]);
        setForm(emptyForm);
        setShowModal(false);
        toast.success(`Offre "${newOffer.name}" créée avec succès`);
    };

    const handleDelete = (id: string) => {
        const offer = offers.find(o => o.id === id);
        if (offer && offer.enrollmentsCount > 0) { toast.error("Impossible de supprimer une offre avec des inscrits"); return; }
        setOffers(prev => prev.filter(o => o.id !== id));
        setActiveMenu(null);
        toast.success("Offre supprimée");
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE": return <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">Actif</span>;
            case "DRAFT": return <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">Brouillon</span>;
            case "ARCHIVED": return <span className="bg-mist/10 text-mist/60 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">Archivé</span>;
            default: return null;
        }
    };

    const permitIcon = (type: string) => {
        switch (type) {
            case "A": return "🏍️";
            case "B": return "🚗";
            case "C": return "🚛";
            default: return "🚗";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Offres & Formules</h1>
                    <p className="text-sm text-mist mt-0.5">{offers.length} formule{offers.length > 1 ? "s" : ""} au total</p>
                </div>
                <button
                    onClick={() => { setForm(emptyForm); setShowModal(true); }}
                    className="flex items-center gap-2 bg-gradient-to-r from-signal to-amber-400 text-asphalt font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-signal/20"
                >
                    <Plus className="h-4 w-4" /> Nouvelle offre
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher une offre..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
                </div>
                <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-mist hover:text-snow hover:border-white/20 transition-all">
                    <Filter className="h-4 w-4" />
                </button>
            </div>

            {/* Empty state or Grid */}
            {filteredOffers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Package className="h-16 w-16 text-mist/15 mb-4" />
                    <h3 className="text-lg font-bold text-snow/60 mb-1">Aucune offre</h3>
                    <p className="text-sm text-mist/40 max-w-sm">Commencez par créer votre première formule de formation pour vos élèves.</p>
                    <button onClick={() => { setForm(emptyForm); setShowModal(true); }}
                        className="mt-4 flex items-center gap-2 bg-signal/10 text-signal font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-signal/20 transition-all">
                        <Plus className="h-4 w-4" /> Créer une offre
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredOffers.map((offer) => (
                        <div key={offer.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden group hover:border-white/10 transition-all">
                            <div className="relative h-28 bg-gradient-to-br from-signal/5 to-blue-500/5 flex items-center justify-center">
                                <span className="text-4xl">{permitIcon(offer.permitType)}</span>
                                <div className="absolute top-3 left-3 flex items-center gap-2">
                                    {statusBadge(offer.status)}
                                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                        Permis {offer.permitType}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <button onClick={() => setActiveMenu(activeMenu === offer.id ? null : offer.id)}
                                        className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white/70 hover:text-white transition-colors">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </button>
                                    {activeMenu === offer.id && (
                                        <div className="absolute right-0 mt-1 bg-asphalt/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl py-1 w-36 z-10">
                                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-mist hover:bg-white/5 hover:text-snow transition-colors">
                                                <Eye className="h-3.5 w-3.5" /> Aperçu
                                            </button>
                                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-mist hover:bg-white/5 hover:text-snow transition-colors">
                                                <Edit2 className="h-3.5 w-3.5" /> Modifier
                                            </button>
                                            <button onClick={() => handleDelete(offer.id)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                                                <Trash2 className="h-3.5 w-3.5" /> Supprimer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-bold text-snow mb-1 truncate">{offer.name}</h3>
                                <p className="text-xs text-mist/60 line-clamp-2 mb-3">{offer.description}</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-lg font-black text-signal">{formatPrice(offer.price)}</span>
                                        <span className="text-[10px] text-mist/40 ml-1">FCFA</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-mist/50">
                                        <span>{offer.hours}h</span>
                                        <span>·</span>
                                        <span>{offer.modulesCount} modules</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-asphalt border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5"
                        onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-black text-snow">Nouvelle Offre</h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Nom de l&apos;offre *</label>
                                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Ex : Permis B Classique"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Description</label>
                                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Description de l'offre..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Prix (FCFA) *</label>
                                    <input type="number" value={form.price || ""} onChange={e => setForm(p => ({ ...p, price: parseInt(e.target.value) || 0 }))}
                                        placeholder="65000"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Heures incluses</label>
                                    <input type="number" value={form.hours || ""} onChange={e => setForm(p => ({ ...p, hours: parseInt(e.target.value) || 0 }))}
                                        placeholder="35"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Type de permis</label>
                                <select value={form.permitType} onChange={e => setForm(p => ({ ...p, permitType: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm">
                                    <option value="A" className="bg-asphalt">🏍️ Permis A (Moto)</option>
                                    <option value="B" className="bg-asphalt">🚗 Permis B (Voiture)</option>
                                    <option value="C" className="bg-asphalt">🚛 Permis C (Poids lourd)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-mist hover:text-snow text-sm font-bold transition-all">Annuler</button>
                            <button onClick={handleCreate}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-signal to-amber-400 text-asphalt text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                                Créer l&apos;offre
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
