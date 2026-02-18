"use client";

import { useState } from "react";
import { useOffers, useAuth, useModules } from "@/hooks";
import { offerModuleService } from "@/lib/api";
import {
    Plus,
    Loader2,
    Edit2,
    Trash2,
    AlertCircle,
    Check,
    ChevronRight,
    GraduationCap,
    Clock,
    Tag,
    Layers,
    ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";

interface OfferFormData {
    name: string;
    description: string;
    price: string;
    hours: string;
    permitType: string;
    selectedModuleIds: string[];
}

const initialFormData: OfferFormData = {
    name: "",
    description: "",
    price: "",
    hours: "",
    permitType: "B",
    selectedModuleIds: []
};

const PERMIT_TYPES = [
    { value: "A", label: "Permis A - Moto" },
    { value: "A1", label: "Permis A1 - Moto légère" },
    { value: "B", label: "Permis B - Voiture" },
    { value: "C", label: "Permis C - Poids lourd" },
    { value: "D", label: "Permis D - Transport passagers" },
];

export default function OffersPage() {
    const { user } = useAuth();
    const schoolId = user?.schoolId;

    const { offers, loading, error, refetch, createOffer, updateOffer, deleteOffer } = useOffers(schoolId);
    const { modules } = useModules(schoolId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<OfferFormData>(initialFormData);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData(initialFormData);
        setCurrentStep(1);
        setIsModalOpen(true);
    };

    const handleOpenEdit = async (offer: any) => {
        setEditingId(offer.id);

        let selectedModuleIds: string[] = [];
        try {
            const linkedModules = await offerModuleService.getModulesForOffer(offer.id);
            selectedModuleIds = linkedModules.map(m => m.moduleId);
        } catch (err) {
            console.error("Failed to fetch linked modules:", err);
        }

        setFormData({
            name: offer.name,
            description: offer.description || "",
            price: offer.price.toString(),
            hours: offer.hours.toString(),
            permitType: offer.permitType || "B",
            selectedModuleIds
        });
        setCurrentStep(1);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId) return;

        setIsSubmitting(true);
        try {
            let savedOffer;
            const payload = {
                name: formData.name,
                description: formData.description || undefined,
                price: parseInt(formData.price),
                hours: parseInt(formData.hours),
                permitType: formData.permitType
            };

            if (editingId) {
                savedOffer = await updateOffer(editingId, payload);
            } else {
                savedOffer = await createOffer({ schoolId, ...payload });
            }

            if (savedOffer?.id) {
                await offerModuleService.setModulesForOffer(savedOffer.id, {
                    modules: formData.selectedModuleIds.map((moduleId, index) => ({
                        moduleId,
                        orderIndex: index
                    }))
                });
            }

            toast.success(editingId ? "Formation mise à jour" : "Nouvelle formation publiée");
            setIsModalOpen(false);
            refetch();
        } catch (err) {
            toast.error("Échec de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette formation du catalogue ?")) return;
        setDeletingId(id);
        try {
            await deleteOffer(id);
            toast.success("Formation supprimée");
        } catch (err) {
            toast.error("Erreur lors de la suppression");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 text-signal animate-spin" />
            <p className="text-[10px] font-black text-mist uppercase tracking-widest animate-pulse">Chargement du catalogue...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-snow tracking-tight uppercase">Catalogue <span className="text-signal">Formations</span></h1>
                    <p className="text-mist font-medium">Définissez vos offres, modules et tarifs pour attirer de nouveaux candidats.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-8 py-4 bg-signal text-asphalt font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-signal/80 transition-all shadow-lg shadow-signal/10 shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    Créer une formule
                </button>
            </div>

            {/* Content Swiper / Grid */}
            <div className="px-4">
                {offers.length === 0 ? (
                    <div className="bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] p-20 text-center">
                        <GraduationCap className="h-16 w-16 text-mist/10 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-snow mb-2 italic underline underline-offset-8 decoration-signal">Catalogue vide</h3>
                        <p className="text-mist text-sm max-w-sm mx-auto mb-10 font-medium">Publiez votre première offre de formation pour commencer à inscrire des élèves.</p>
                        <button onClick={handleOpenCreate} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-snow font-black text-[10px] uppercase tracking-widest hover:bg-signal hover:text-asphalt transition-all">
                            Initialiser le catalogue
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.map((offer) => (
                            <div
                                key={offer.id}
                                className="group relative bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.06] hover:border-signal/20 transition-all duration-500 overflow-hidden flex flex-col h-full"
                            >
                                {/* Decorative Glow */}
                                <div className="absolute top-0 right-0 -m-10 h-32 w-32 bg-signal/10 blur-[50px] rounded-full group-hover:bg-signal/20 transition-colors" />

                                {/* Top Badges */}
                                <div className="flex items-center justify-between mb-8">
                                    <span className="px-3 py-1 rounded-full bg-signal/10 border border-signal/20 text-[9px] font-black text-signal uppercase tracking-widest">
                                        Permis {offer.permitType}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleOpenEdit(offer)} className="p-2 text-mist hover:text-signal transition-colors">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(offer.id)} className="p-2 text-mist hover:text-red-400 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 space-y-4">
                                    <h3 className="text-2xl font-black text-snow tracking-tight uppercase group-hover:text-signal transition-colors leading-none">
                                        {offer.name}
                                    </h3>
                                    <div className="flex items-center gap-4 text-[10px] font-black text-mist uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-signal" /> {offer.hours}H Formation</span>
                                        <span className="h-1 w-1 rounded-full bg-white/20" />
                                        <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-signal" /> Pro</span>
                                    </div>
                                    <p className="text-sm text-mist/60 font-medium line-clamp-2 italic leading-relaxed pt-2">
                                        &quot;{offer.description || "Aucune description fournie pour cette formation."}&quot;
                                    </p>
                                </div>

                                {/* Footer Info */}
                                <div className="mt-10 pt-8 border-t border-white/5 flex items-end justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-mist uppercase tracking-widest mb-1">Investissement</p>
                                        <p className="text-3xl font-black text-snow tracking-tighter">
                                            {offer.price.toLocaleString()} <span className="text-xs text-signal">FCFA</span>
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-signal group-hover:text-asphalt transition-all">
                                        <ChevronRight className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Creation Wizard Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="">
                <div className="p-4 space-y-10">
                    {/* Progress Track */}
                    <div className="flex items-center gap-3">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex-1 flex items-center gap-2">
                                <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${currentStep >= step ? "bg-signal shadow-[0_0_15px_rgba(255,193,7,0.4)]" : "bg-white/5"}`} />
                                {step < 3 && <div className="h-1.5 w-1.5 rounded-full bg-white/10" />}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="min-h-[450px] flex flex-col justify-between">
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            {currentStep === 1 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-snow tracking-tight uppercase">Identité de l&apos;offre</h2>
                                        <p className="text-mist font-medium">Définissez les bases stratégiques de cette formule.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Nom Commercial</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Ex: Excellence Permis B Automatic"
                                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-snow font-bold focus:ring-signal/20 focus:border-signal/40 transition-all placeholder:text-mist/20"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Type de Permis</Label>
                                                <select
                                                    value={formData.permitType}
                                                    onChange={(e) => setFormData({ ...formData, permitType: e.target.value })}
                                                    className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-snow appearance-none focus:ring-2 focus:ring-signal/20 outline-none"
                                                >
                                                    {PERMIT_TYPES.map(p => <option key={p.value} value={p.value} className="bg-asphalt">{p.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Quota Horaire</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.hours}
                                                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                                    placeholder="20"
                                                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-center font-black text-snow text-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Prix de la Formation (FCFA)</Label>
                                            <div className="relative group">
                                                <Input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    placeholder="250000"
                                                    className="h-16 bg-white/10 border-white/5 group-hover:border-signal/20 rounded-2xl pl-8 text-2xl font-black text-signal focus:ring-signal/20 transition-all"
                                                />
                                                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-signal/30 font-black text-xs">CFA</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-snow tracking-tight uppercase">Architecture Pédagogique</h2>
                                        <p className="text-mist font-medium">Composez le programme en sélectionnant les modules requis.</p>
                                    </div>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {['CODE', 'CONDUITE', 'EXAMEN_BLANC'].map(category => {
                                            const catModules = modules.filter(m => m.category === category);
                                            if (catModules.length === 0) return null;
                                            return (
                                                <div key={category} className="space-y-3">
                                                    <h4 className="text-[10px] font-black text-signal uppercase tracking-widest opacity-60 flex items-center gap-2">
                                                        <span className="h-px flex-1 bg-white/5" />
                                                        {category}
                                                        <span className="h-px flex-1 bg-white/5" />
                                                    </h4>
                                                    <div className="grid gap-3">
                                                        {catModules.map(m => (
                                                            <label
                                                                key={m.id}
                                                                className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer group ${formData.selectedModuleIds.includes(m.id) ? "bg-signal/10 border-signal/30" : "bg-white/[0.03] border-white/5 hover:border-white/10"}`}
                                                            >
                                                                <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.selectedModuleIds.includes(m.id) ? "bg-signal border-signal" : "border-white/10 group-hover:border-signal/50"}`}>
                                                                    {formData.selectedModuleIds.includes(m.id) && <Check className="h-4 w-4 text-asphalt font-black" />}
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={formData.selectedModuleIds.includes(m.id)}
                                                                    onChange={(e) => {
                                                                        const ids = e.target.checked
                                                                            ? [...formData.selectedModuleIds, m.id]
                                                                            : formData.selectedModuleIds.filter(id => id !== m.id);
                                                                        setFormData({ ...formData, selectedModuleIds: ids });
                                                                    }}
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-black text-snow">{m.name}</p>
                                                                    <p className="text-[9px] text-mist font-bold uppercase tracking-wider">{m.requiredHours} Heures requis</p>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-snow tracking-tight uppercase">Validation Finale</h2>
                                        <p className="text-mist font-medium">Vérifiez les paramètres de votre nouvelle offre stratégique.</p>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 -m-10 h-32 w-32 bg-signal/10 blur-[50px] rounded-full" />

                                        <div className="flex items-center justify-between gap-6 relative z-10">
                                            <div>
                                                <p className="text-[10px] font-black text-mist uppercase tracking-widest mb-1">Offre</p>
                                                <p className="text-2xl font-black text-snow leading-none uppercase">{formData.name}</p>
                                            </div>
                                            <div className="h-16 w-16 rounded-[1.5rem] bg-signal/10 border border-signal/20 flex items-center justify-center text-signal">
                                                <GraduationCap className="h-8 w-8" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 relative z-10">
                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                                <p className="text-[9px] font-black text-mist uppercase tracking-widest mb-2">Tarification</p>
                                                <p className="text-xl font-black text-signal tabular-nums">{parseInt(formData.price || "0").toLocaleString()} <span className="text-xs">CFA</span></p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                                <p className="text-[9px] font-black text-mist uppercase tracking-widest mb-2">Volume Total</p>
                                                <p className="text-xl font-black text-snow tabular-nums">{formData.hours} <span className="text-xs text-mist">Heures</span></p>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black text-mist uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Tag className="h-3 w-3" /> Programme Constitué
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.selectedModuleIds.map(id => {
                                                    const m = modules.find(mod => mod.id === id);
                                                    return m && <span key={id} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-snow">{m.name}</span>;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-10 mt-auto border-t border-white/5">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="h-14 flex-1 rounded-2xl border border-white/10 text-mist text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Retour
                                </button>
                            ) : (
                                <button type="button" onClick={() => setIsModalOpen(false)} className="h-14 flex-1 rounded-2xl border border-white/10 text-mist text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                    Annuler
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (currentStep === 1 && (!formData.name || !formData.price || !formData.hours)) return toast.error("Complétez les champs d'abord");
                                        if (currentStep === 2 && formData.selectedModuleIds.length === 0) return toast.error("Sélectionnez au moins un module");
                                        setCurrentStep(currentStep + 1);
                                    }}
                                    className="h-14 flex-[2] rounded-2xl bg-snow text-asphalt font-black uppercase tracking-widest text-[10px] hover:bg-signal transition-all flex items-center justify-center gap-2 shadow-lg shadow-signal/10"
                                >
                                    Étape Suivante <ChevronRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-14 flex-[2] rounded-2xl bg-signal text-asphalt font-black uppercase tracking-widest text-[10px] hover:bg-signal/80 transition-all flex items-center justify-center gap-2 shadow-xl shadow-signal/20"
                                >
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                                    {editingId ? "Mettre à jour" : "Démarrer l'Offre"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
