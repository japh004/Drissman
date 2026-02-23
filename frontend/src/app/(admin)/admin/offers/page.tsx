"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks";
import { Plus, Search, BookOpen, MoreVertical, Edit2, Trash2, Eye, Filter, Package, ChevronRight, ChevronLeft, Check, Layers } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Module {
    id: string;
    name: string;
    category: string;
    requiredHours: number;
}

interface Offer {
    id: string;
    name: string;
    description: string;
    price: number;
    hours: number;
    permitType: string;
    status: "ACTIVE" | "DRAFT" | "ARCHIVED";
    modules: Module[];
    enrollmentsCount: number;
}

function formatPrice(amount: number) { return new Intl.NumberFormat("fr-FR").format(amount); }



export default function OffersPage() {
    const [offers, setOffers] = useLocalStorage<Offer[]>("offers", []);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Wizard state
    const [showWizard, setShowWizard] = useState(false);
    const [step, setStep] = useState(1);
    const [allModules] = useLocalStorage<Module[]>("modules", []);

    // Step 1 fields
    const [formName, setFormName] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [formPrice, setFormPrice] = useState(0);
    const [formHours, setFormHours] = useState(0);
    const [formPermit, setFormPermit] = useState("B");

    // Step 2 fields
    const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);

    const filteredOffers = offers.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const resetWizard = () => {
        setStep(1);
        setFormName(""); setFormDesc(""); setFormPrice(0);
        setFormHours(0); setFormPermit("B");
        setSelectedModuleIds([]);
    };

    const openWizard = () => { resetWizard(); setShowWizard(true); };



    const validateStep1 = () => {
        if (!formName.trim()) { toast.error("Le nom de l'offre est obligatoire"); return false; }
        if (formPrice <= 0) { toast.error("Le prix doit être supérieur à 0"); return false; }
        return true;
    };

    const handleCreate = () => {
        const newOffer: Offer = {
            id: crypto.randomUUID(),
            name: formName.trim(),
            description: formDesc.trim(),
            price: formPrice,
            hours: formHours,
            permitType: formPermit,
            status: "DRAFT", // Toujours créer en brouillon par défaut
            modules: allModules.filter(m => selectedModuleIds.includes(m.id)),
            enrollmentsCount: 0,
        };
        setOffers(prev => [newOffer, ...prev]);
        setShowWizard(false);
        resetWizard();
        toast.success(`Offre "${newOffer.name}" créée avec succès`);
    };

    const handleDelete = (id: string) => {
        const offer = offers.find(o => o.id === id);
        if (offer && offer.enrollmentsCount > 0) { toast.error("Impossible de supprimer une offre avec des inscrits"); return; }
        setOffers(prev => prev.filter(o => o.id !== id));
        setActiveMenu(null);
        toast.success("Offre supprimée");
    };

    const handlePublish = (id: string) => {
        try {
            const rawSessions = localStorage.getItem("sessions") || "[]";
            const sessionsTracker = JSON.parse(rawSessions);
            const isLinkedToSession = sessionsTracker.some((session: any) =>
                session.formations?.some((f: any) => f.offerId === id)
            );

            if (!isLinkedToSession) {
                toast.error("Cette offre doit être associée à une session de formation avant d'être publiée.");
                return;
            }

            setOffers(prev => prev.map(o => o.id === id ? { ...o, status: "ACTIVE" } : o));
            setActiveMenu(null);
            toast.success("Offre publiée et rattachée au catalogue.");
        } catch {
            toast.error("Erreur technique lors de la vérification de la publication.");
        }
    };

    const handleUnpublish = (id: string) => {
        setOffers(prev => prev.map(o => o.id === id ? { ...o, status: "DRAFT" } : o));
        setActiveMenu(null);
        toast.info("Offre retirée du catalogue en ligne.");
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE": return <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">Actif</span>;
            case "DRAFT": return <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">Brouillon</span>;
            case "ARCHIVED": return <span className="bg-mist/10 text-mist/60 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">Archivé</span>;
            default: return null;
        }
    };

    const permitEmoji = (t: string) => t === "A" ? "🏍️" : t === "C" ? "🚛" : "🚗";
    const catConfig: Record<string, { icon: string; color: string }> = {
        CODE: { icon: "📖", color: "text-blue-400" },
        CONDUITE: { icon: "🚗", color: "text-signal" },
        EXAMEN_BLANC: { icon: "📝", color: "text-purple-400" },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Offres & Formules</h1>
                    <p className="text-sm text-mist mt-0.5">{offers.length} formule{offers.length > 1 ? "s" : ""} au total</p>
                </div>
                <button onClick={openWizard}
                    className="flex items-center gap-2 bg-gradient-to-r from-signal to-amber-400 text-asphalt font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-signal/20">
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
                    <p className="text-sm text-mist/40 max-w-sm">Commencez par créer des modules, puis assemblez-les dans une offre.</p>
                    <button onClick={openWizard}
                        className="mt-4 flex items-center gap-2 bg-signal/10 text-signal font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-signal/20 transition-all">
                        <Plus className="h-4 w-4" /> Créer une offre
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredOffers.map((offer) => (
                        <div key={offer.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden group hover:border-white/10 transition-all">
                            <div className="relative h-28 bg-gradient-to-br from-signal/5 to-blue-500/5 flex items-center justify-center">
                                <span className="text-4xl">{permitEmoji(offer.permitType)}</span>
                                <div className="absolute top-3 left-3 flex items-center gap-2">
                                    {statusBadge(offer.status)}
                                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">Permis {offer.permitType}</span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <button onClick={() => setActiveMenu(activeMenu === offer.id ? null : offer.id)}
                                        className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white/70 hover:text-white transition-colors">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </button>
                                    {activeMenu === offer.id && (
                                        <div className="absolute right-0 mt-1 bg-asphalt/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl py-1 w-36 z-10">
                                            {offer.status === "DRAFT" && (
                                                <button onClick={() => handlePublish(offer.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-green-400 hover:bg-white/5 transition-colors"><Check className="h-3.5 w-3.5" /> Publier</button>
                                            )}
                                            {offer.status === "ACTIVE" && (
                                                <button onClick={() => handleUnpublish(offer.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-yellow-400 hover:bg-white/5 transition-colors"><ChevronLeft className="h-3.5 w-3.5" /> Retirer</button>
                                            )}
                                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-mist hover:bg-white/5 hover:text-snow transition-colors"><Eye className="h-3.5 w-3.5" /> Aperçu</button>
                                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-mist hover:bg-white/5 hover:text-snow transition-colors"><Edit2 className="h-3.5 w-3.5" /> Modifier</button>
                                            <button onClick={() => handleDelete(offer.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /> Supprimer</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-bold text-snow mb-1 truncate">{offer.name}</h3>
                                <p className="text-xs text-mist/60 line-clamp-2 mb-3">{offer.description}</p>
                                <div className="flex items-center justify-between">
                                    <div><span className="text-lg font-black text-signal">{formatPrice(offer.price)}</span><span className="text-[10px] text-mist/40 ml-1">FCFA</span></div>
                                    <div className="flex items-center gap-2 text-[10px] text-mist/50">
                                        <span>{offer.hours}h</span><span>·</span><span>{offer.modules.length} module{offer.modules.length > 1 ? "s" : ""}</span>
                                    </div>
                                </div>
                                {/* Modules preview */}
                                {offer.modules.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                                        {offer.modules.slice(0, 3).map(m => (
                                            <div key={m.id} className="flex items-center gap-2 text-[10px] text-mist/40">
                                                <span>{catConfig[m.category]?.icon || "📖"}</span>
                                                <span className="truncate">{m.name}</span>
                                                <span className="ml-auto shrink-0">{m.requiredHours}h</span>
                                            </div>
                                        ))}
                                        {offer.modules.length > 3 && (
                                            <p className="text-[10px] text-mist/30">+ {offer.modules.length - 3} autre{offer.modules.length - 3 > 1 ? "s" : ""}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== 3-Step Wizard ===== */}
            {showWizard && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowWizard(false)}>
                    <div className="bg-asphalt border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
                        onClick={e => e.stopPropagation()}>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 mb-6">
                            {[
                                { n: 1, label: "Infos" },
                                { n: 2, label: "Modules" },
                                { n: 3, label: "Aperçu" },
                            ].map((s, i) => (
                                <div key={s.n} className="flex items-center gap-2 flex-1">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${step > s.n ? "bg-green-500 text-white" :
                                        step === s.n ? "bg-signal text-asphalt" :
                                            "bg-white/5 text-mist/40"
                                        }`}>
                                        {step > s.n ? <Check className="h-4 w-4" /> : s.n}
                                    </div>
                                    <span className={`text-xs font-bold hidden sm:block ${step === s.n ? "text-snow" : "text-mist/40"}`}>{s.label}</span>
                                    {i < 2 && <div className={`flex-1 h-px ${step > s.n ? "bg-green-500/50" : "bg-white/[0.06]"}`} />}
                                </div>
                            ))}
                        </div>

                        {/* Step 1 — Basic Info */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-black text-snow">Informations de base</h2>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Nom de l&apos;offre *</label>
                                    <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex : Permis B Classique"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Description</label>
                                    <textarea rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Description marketing..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-mist uppercase tracking-wider">Prix (FCFA) *</label>
                                        <input type="number" value={formPrice || ""} onChange={e => setFormPrice(parseInt(e.target.value) || 0)} placeholder="65000"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-mist uppercase tracking-wider">Heures totales</label>
                                        <input type="number" value={formHours || ""} onChange={e => setFormHours(parseInt(e.target.value) || 0)} placeholder="35"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-xs font-bold text-mist uppercase tracking-wider">Type de permis</label>
                                        <select value={formPermit} onChange={e => setFormPermit(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm">
                                            <option value="A" className="bg-asphalt">🏍️ Permis A</option>
                                            <option value="B" className="bg-asphalt">🚗 Permis B</option>
                                            <option value="C" className="bg-asphalt">🚛 Permis C</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2 — Modules */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-black text-snow">Modules inclus</h2>
                                    <Link href="/admin/modules"
                                        className="text-xs text-signal font-bold hover:text-signal/80 transition-colors flex items-center gap-1">
                                        <Plus className="h-3 w-3" /> Créer un module
                                    </Link>
                                </div>

                                {allModules.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Layers className="h-10 w-10 text-mist/20 mx-auto mb-2" />
                                        <p className="text-sm text-mist/40">Aucun module disponible</p>
                                        <p className="text-xs text-mist/30 mt-1">Créez d&apos;abord des modules sur la page Modules</p>
                                        <Link href="/admin/modules" className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-signal hover:text-signal/80 transition-colors">
                                            <Plus className="h-3 w-3" /> Aller à la page Modules
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {allModules.map(m => {
                                            const checked = selectedModuleIds.includes(m.id);
                                            const cat = catConfig[m.category] || catConfig.CODE;
                                            return (
                                                <label key={m.id}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? "bg-signal/5 border-signal/30" : "bg-white/[0.02] border-white/[0.04] hover:border-signal/20"
                                                        }`}>
                                                    <input type="checkbox" checked={checked}
                                                        onChange={() => setSelectedModuleIds(prev =>
                                                            checked ? prev.filter(id => id !== m.id) : [...prev, m.id]
                                                        )}
                                                        className="rounded border-white/20 bg-white/5 text-signal focus:ring-signal/20" />
                                                    <span className="text-sm">{cat.icon}</span>
                                                    <span className="text-sm text-snow flex-1">{m.name}</span>
                                                    <span className="text-xs text-mist/40">{m.requiredHours}h</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                                <p className="text-xs text-mist/30">{selectedModuleIds.length} module{selectedModuleIds.length > 1 ? "s" : ""} sélectionné{selectedModuleIds.length > 1 ? "s" : ""}</p>
                            </div>
                        )}

                        {/* Step 3 — Preview */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-black text-snow">Aperçu final</h2>

                                <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-base font-black text-snow">{formName || "Sans nom"}</h3>
                                            <p className="text-xs text-mist/50 mt-0.5">{formDesc || "Pas de description"}</p>
                                        </div>
                                        <span className="text-2xl">{permitEmoji(formPermit)}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
                                        <div className="text-center">
                                            <p className="text-lg font-black text-signal">{formatPrice(formPrice)}</p>
                                            <p className="text-[10px] text-mist/40">FCFA</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-black text-snow">{formHours}h</p>
                                            <p className="text-[10px] text-mist/40">Total</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-black text-snow">{selectedModuleIds.length}</p>
                                            <p className="text-[10px] text-mist/40">Module{selectedModuleIds.length > 1 ? "s" : ""}</p>
                                        </div>
                                    </div>

                                    {selectedModuleIds.length > 0 && (
                                        <div className="pt-3 border-t border-white/5 space-y-2">
                                            <p className="text-xs font-bold text-mist/40 uppercase tracking-wider">Modules inclus</p>
                                            {allModules.filter(m => selectedModuleIds.includes(m.id)).map(m => (
                                                <div key={m.id} className="flex items-center gap-2 text-xs text-mist/60">
                                                    <span>{catConfig[m.category]?.icon || "📖"}</span>
                                                    <span>{m.name}</span>
                                                    <span className="ml-auto">{m.requiredHours}h</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                                        {statusBadge("DRAFT")}
                                        <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">Permis {formPermit}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center gap-3 mt-6">
                            {step > 1 ? (
                                <button onClick={() => setStep(s => s - 1)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-mist text-sm font-bold hover:bg-white/10 transition-all">
                                    <ChevronLeft className="h-4 w-4" /> Retour
                                </button>
                            ) : (
                                <button onClick={() => setShowWizard(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-mist text-sm font-bold hover:bg-white/10 transition-all">
                                    Annuler
                                </button>
                            )}
                            {step < 3 ? (
                                <button onClick={() => { if (step === 1 && !validateStep1()) return; setStep(s => s + 1); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-signal to-amber-400 text-asphalt text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                                    Suivant <ChevronRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button onClick={handleCreate}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-white text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-green-500/20">
                                    <Check className="h-4 w-4" /> Créer l&apos;offre
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
