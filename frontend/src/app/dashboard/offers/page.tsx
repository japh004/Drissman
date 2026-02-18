"use client";

import { useState, useEffect } from "react";
import { useOffers, useAuth, useModules } from "@/hooks";
import { offerModuleService, type Module } from "@/lib/api";
import {
    Plus,
    Loader2,
    Edit2,
    Trash2,
    Clock,
    AlertCircle,
    X,
    Check,
    Coins,
    ChevronRight,
    GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
    { value: "E", label: "Permis E - Remorque" },
    { value: "F", label: "Permis F - Véhicule agricole" },
    { value: "G", label: "Permis G - Engin spécial" },
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

    const handleOpenEdit = async (offer: { id: string; name: string; description?: string; price: number; hours: number; permitType: string; }) => {
        setEditingId(offer.id);

        // Fetch linked modules
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

        if (!schoolId) {
            toast.error("Session invalide. Veuillez vous reconnecter.");
            return;
        }

        if (!formData.name || !formData.price || !formData.hours) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        setIsSubmitting(true);

        try {
            let savedOffer;
            if (editingId) {
                savedOffer = await updateOffer(editingId, {
                    name: formData.name,
                    description: formData.description || undefined,
                    price: parseInt(formData.price),
                    hours: parseInt(formData.hours),
                    permitType: formData.permitType
                });
            } else {
                savedOffer = await createOffer({
                    schoolId,
                    name: formData.name,
                    description: formData.description || undefined,
                    price: parseInt(formData.price),
                    hours: parseInt(formData.hours),
                    permitType: formData.permitType
                });
            }

            // Sync offer modules if an offer was saved
            if (savedOffer?.id) {
                await offerModuleService.setModulesForOffer(savedOffer.id, {
                    modules: formData.selectedModuleIds.map((moduleId, index) => ({
                        moduleId,
                        orderIndex: index
                    }))
                });
            }

            toast.success(editingId ? "Offre mise à jour !" : "Offre créée !");
            setIsModalOpen(false);
            setFormData(initialFormData);
            refetch(); // Refresh to show new state
        } catch (err) {
            console.error("Failed to save offer:", err);
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;

        setDeletingId(id);
        try {
            await deleteOffer(id);
            toast.success("Offre supprimée");
        } catch (err) {
            console.error("Failed to delete offer:", err);
            toast.error("Erreur lors de la suppression");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-signal/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-signal border-t-transparent animate-spin"></div>
                </div>
                <p className="text-mist font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Chargement des offres...</p>
            </div>
        );
    }

    if (!schoolId && !loading) {
        return (
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
                <AlertCircle className="h-12 w-12 text-signal mx-auto mb-4" />
                <h3 className="text-xl font-black text-snow mb-2">Compte non associé</h3>
                <p className="text-mist mb-6">Votre compte n&apos;est pas encore lié à une auto-école.</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 bg-red-500/5 rounded-3xl border border-red-500/10 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-snow mb-2">Erreur de chargement</h3>
                <p className="text-mist mb-6">{error}</p>
                <button
                    onClick={refetch}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-snow font-black text-[10px] uppercase tracking-widest transition-all"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-snow uppercase tracking-tight">Formations</h1>
                    <p className="text-mist font-bold">Gérez vos offres de formation et leurs tarifs.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="px-6 py-3 rounded-xl bg-signal hover:bg-signal-dark text-asphalt text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(255,193,7,0.2)] transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nouvelle offre
                </button>
            </div>

            {/* Offers Grid */}
            {offers.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-16 text-center border-dashed">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <GraduationCap className="h-8 w-8 text-mist" />
                    </div>
                    <h3 className="text-xl font-black text-snow mb-2">Aucune formation</h3>
                    <p className="text-mist mb-8 max-w-sm mx-auto font-medium">Votre catalogue est vide. Créez votre première formule pour commencer à recevoir des inscriptions.</p>
                    <button
                        onClick={handleOpenCreate}
                        className="px-8 py-3 rounded-xl bg-snow text-asphalt text-xs font-black uppercase tracking-widest hover:bg-signal transition-all"
                    >
                        Créer une offre
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {offers.map((offer) => (
                        <div
                            key={offer.id}
                            className="bg-white/[0.07] backdrop-blur-md border border-white/5 rounded-[2rem] p-6 hover:border-signal/30 transition-all duration-500 group flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-white/5 text-signal group-hover:scale-110 transition-transform duration-500 overflow-hidden relative w-12 h-12 flex items-center justify-center">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenEdit(offer)}
                                        className="p-2 text-mist hover:text-signal hover:bg-white/5 rounded-xl transition-all"
                                        title="Modifier"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(offer.id)}
                                        disabled={deletingId === offer.id}
                                        className="p-2 text-mist hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                                        title="Supprimer"
                                    >
                                        {deletingId === offer.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-black text-snow text-xl group-hover:text-signal transition-colors">{offer.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded-full bg-signal/10 border border-signal/20 text-signal text-[9px] font-black uppercase tracking-widest">
                                        Permis {offer.permitType}
                                    </span>
                                    <span className="text-[10px] font-bold text-mist">{offer.hours}h de formation</span>
                                </div>
                                {offer.description && (
                                    <p className="text-sm text-mist mt-4 font-medium leading-relaxed line-clamp-2 italic">&quot;{offer.description}&quot;</p>
                                )}
                            </div>

                            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] block font-black text-mist uppercase tracking-widest mb-1">Tarif</span>
                                    <span className="text-2xl font-black text-snow tracking-tighter">
                                        {offer.price.toLocaleString()} <span className="text-xs text-signal">FCFA</span>
                                    </span>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-mist group-hover:bg-signal group-hover:text-asphalt transition-all duration-500">
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Modifier l'offre" : "Nouvelle offre stratégique"}
            >
                <div className="p-1">
                    {/* Wizard Progress */}
                    <div className="flex items-center gap-2 mb-8 px-2">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex-1 flex items-center gap-2">
                                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${currentStep >= step ? "bg-signal shadow-[0_0_10px_rgba(255,193,7,0.3)]" : "bg-white/5"}`} />
                                {step < 3 && <div className="h-1 w-1 rounded-full bg-white/10" />}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-snow uppercase tracking-tight">Informations de base</h3>
                                    <p className="text-[10px] text-mist font-bold uppercase tracking-widest">Définissez l&apos;identité de votre formation</p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Nom commercial</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Excellence Permis B"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-signal/20"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="permitType" className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Catégorie</Label>
                                        <select
                                            id="permitType"
                                            value={formData.permitType}
                                            onChange={(e) => setFormData({ ...formData, permitType: e.target.value })}
                                            className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-snow focus:ring-2 focus:ring-signal/20 outline-none appearance-none cursor-pointer font-bold"
                                        >
                                            {PERMIT_TYPES.map((type) => (
                                                <option key={type.value} value={type.value} className="bg-asphalt text-snow">{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="hours" className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Volume horaire</Label>
                                        <Input
                                            id="hours"
                                            type="number"
                                            placeholder="20"
                                            value={formData.hours}
                                            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                            className="bg-white/5 border-white/10 rounded-2xl h-12 text-center font-black"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Tarif Premium (FCFA)</Label>
                                    <div className="relative">
                                        <Input
                                            id="price"
                                            type="number"
                                            placeholder="250000"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="bg-white/10 border-white/5 rounded-2xl h-14 pl-6 text-xl font-black text-signal focus:ring-signal/30"
                                            required
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-signal/50 font-black text-xs">CFA</div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => formData.name && formData.price && formData.hours ? setCurrentStep(2) : toast.error("Complétez les champs")}
                                    className="w-full py-4 rounded-2xl bg-snow text-asphalt font-black uppercase tracking-widest text-[10px] hover:bg-signal transition-all flex items-center justify-center gap-2"
                                >
                                    Configurer le Programme
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-snow uppercase tracking-tight">Architecture du Programme</h3>
                                    <p className="text-[10px] text-mist font-bold uppercase tracking-widest">Sélectionnez les modules constitutifs</p>
                                </div>

                                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {['CODE', 'CONDUITE', 'EXAMEN_BLANC'].map(category => {
                                        const catModules = modules.filter(m => m.category === category);
                                        if (catModules.length === 0) return null;

                                        return (
                                            <div key={category} className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-px flex-1 bg-white/5" />
                                                    <span className="text-[9px] font-black text-signal uppercase tracking-widest opacity-60">{category}</span>
                                                    <div className="h-px flex-1 bg-white/5" />
                                                </div>
                                                <div className="grid gap-2">
                                                    {catModules.map(module => (
                                                        <label
                                                            key={module.id}
                                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${formData.selectedModuleIds.includes(module.id) ? "bg-signal/10 border-signal/30" : "bg-white/5 border-white/5 hover:border-white/10"}`}
                                                        >
                                                            <div className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.selectedModuleIds.includes(module.id) ? "bg-signal border-signal" : "border-white/20 group-hover:border-signal/50"}`}>
                                                                {formData.selectedModuleIds.includes(module.id) && <Check className="h-3 w-3 text-asphalt font-black" />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={formData.selectedModuleIds.includes(module.id)}
                                                                onChange={(e) => {
                                                                    const ids = e.target.checked
                                                                        ? [...formData.selectedModuleIds, module.id]
                                                                        : formData.selectedModuleIds.filter(id => id !== module.id);
                                                                    setFormData({ ...formData, selectedModuleIds: ids });
                                                                }}
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-xs font-black text-snow">{module.name}</p>
                                                                <p className="text-[9px] text-mist font-bold uppercase">{module.requiredHours} Heures requis</p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="h-12 flex-1 rounded-2xl border border-white/10 text-mist text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => formData.selectedModuleIds.length > 0 ? setCurrentStep(3) : toast.error("Sélectionnez au moins un module")}
                                        className="h-12 flex-[2] rounded-2xl bg-snow text-asphalt text-[10px] font-black uppercase tracking-widest hover:bg-signal transition-all"
                                    >
                                        Finaliser l&apos;Offre
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-snow uppercase tracking-tight">Récapitulatif</h3>
                                    <p className="text-[10px] text-mist font-bold uppercase tracking-widest">Confirmez les détails de votre formation</p>
                                </div>

                                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-mist font-black uppercase tracking-widest mb-1">Dénomination</p>
                                            <p className="text-xl font-black text-snow leading-tight">{formData.name}</p>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-signal flex items-center justify-center text-asphalt">
                                            <GraduationCap className="h-6 w-6" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[9px] text-mist font-bold uppercase tracking-widest mb-1">Prix</p>
                                            <p className="text-lg font-black text-signal">{parseInt(formData.price || "0").toLocaleString()} <span className="text-[10px]">CFA</span></p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[9px] text-mist font-bold uppercase tracking-widest mb-1">Volume</p>
                                            <p className="text-lg font-black text-snow">{formData.hours} <span className="text-[10px] text-mist">Heures</span></p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-mist font-black uppercase tracking-widest mb-3">Programme ({formData.selectedModuleIds.length} modules)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.selectedModuleIds.map(id => {
                                                const m = modules.find(mod => mod.id === id);
                                                return m ? (
                                                    <span key={id} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold text-snow">
                                                        {m.name}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        className="h-12 flex-1 rounded-2xl border border-white/10 text-mist text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-12 flex-[2] rounded-2xl bg-signal text-asphalt text-[10px] font-black uppercase tracking-widest shadow-lg shadow-signal/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        {editingId ? "Mettre à jour l'offre" : "Publier l'Offre"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </Modal>
        </div>
    );
}
