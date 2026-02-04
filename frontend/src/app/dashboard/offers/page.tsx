"use client";

import { useState } from "react";
import { useOffers, useAuth } from "@/hooks";
import {
    Tag,
    Plus,
    Loader2,
    Edit2,
    Trash2,
    Clock,
    AlertCircle,
    X,
    Check,
    Coins,
    ChevronRight
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
}

const initialFormData: OfferFormData = {
    name: "",
    description: "",
    price: "",
    hours: "",
    permitType: "B"
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<OfferFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (offer: { id: string; name: string; description?: string; price: number; hours: number; permitType: string; imageUrl?: string }) => {
        setEditingId(offer.id);
        setFormData({
            name: offer.name,
            description: offer.description || "",
            price: offer.price.toString(),
            hours: offer.hours.toString(),
            permitType: offer.permitType || "B"
        });
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
            if (editingId) {
                await updateOffer(editingId, {
                    name: formData.name,
                    description: formData.description || undefined,
                    price: parseInt(formData.price),
                    hours: parseInt(formData.hours),
                    permitType: formData.permitType
                });
                toast.success("Offre mise à jour avec succès !");
            } else {
                await createOffer({
                    schoolId,
                    name: formData.name,
                    description: formData.description || undefined,
                    price: parseInt(formData.price),
                    hours: parseInt(formData.hours),
                    permitType: formData.permitType
                });
                toast.success("Offre créée avec succès !");
            }
            setIsModalOpen(false);
            setFormData(initialFormData);
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
                    <h1 className="text-3xl font-black text-snow uppercase tracking-tight">Gestion des Offres</h1>
                    <p className="text-mist font-bold">Définissez vos tarifs et formules de formation.</p>
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
                        <Tag className="h-8 w-8 text-mist" />
                    </div>
                    <h3 className="text-xl font-black text-snow mb-2">Aucune offre active</h3>
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
                            className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2rem] p-6 hover:border-signal/30 transition-all duration-500 group flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-white/5 text-signal group-hover:scale-110 transition-transform duration-500 overflow-hidden relative w-12 h-12 flex items-center justify-center">
                                    <Tag className="h-5 w-5" />
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
                                    <div className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_8px_rgba(255,193,7,0.5)]" />
                                    <span className="text-[10px] font-black text-mist uppercase tracking-widest">{offer.hours} heures de formation</span>
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
                title={editingId ? "Modifier l'offre" : "Nouvelle offre"}
            >
                <form onSubmit={handleSubmit} className="space-y-6 p-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-mist">Nom de l&apos;offre *</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Formule Accélérée B"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl focus:border-signal/50 focus:ring-signal/20"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="permitType" className="text-[10px] font-black uppercase tracking-widest text-mist">Type de permis *</Label>
                        <select
                            id="permitType"
                            value={formData.permitType}
                            onChange={(e) => setFormData({ ...formData, permitType: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-snow focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal/50 transition-all font-medium"
                            required
                        >
                            {PERMIT_TYPES.map((type) => (
                                <option key={type.value} value={type.value} className="bg-asphalt text-snow">
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-mist">Description</Label>
                        <textarea
                            id="description"
                            placeholder="Détaillez le contenu (ex: code inclus, frais de dossier...)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-snow placeholder:text-mist/30 focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal/50 transition-all resize-none font-medium"
                            rows={3}
                        />
                    </div>


                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-mist">Prix (FCFA) *</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="150000"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="bg-white/5 border-white/10 rounded-xl focus:border-signal/50 focus:ring-signal/20 text-signal font-black"
                                required
                                min="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hours" className="text-[10px] font-black uppercase tracking-widest text-mist">Nombre d&apos;heures *</Label>
                            <Input
                                id="hours"
                                type="number"
                                placeholder="20"
                                value={formData.hours}
                                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                className="bg-white/5 border-white/10 rounded-xl focus:border-signal/50 focus:ring-signal/20"
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-mist text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl bg-signal hover:bg-signal-dark text-asphalt text-[10px] font-black uppercase tracking-widest shadow-lg shadow-signal/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-none"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Check className="h-3 w-3" />
                            )}
                            {editingId ? "Sauvegarder" : "Créer l'offre"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
