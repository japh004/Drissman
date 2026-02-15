"use client";

import { useState } from "react";
import { useMonitors, useAuth } from "@/hooks";
import { Monitor, MonitorStatus } from "@/types/partner";
import {
    Users,
    Plus,
    Loader2,
    Edit2,
    Trash2,
    AlertCircle,
    Check,
    Phone,
    CreditCard,
    MoreVertical,
    Shield
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";

const STATUS_LABELS: Record<MonitorStatus, { label: string, color: string }> = {
    'ACTIVE': { label: 'Actif', color: 'text-signal bg-signal/10' },
    'INACTIVE': { label: 'Inactif', color: 'text-mist bg-white/5' },
    'ON_LEAVE': { label: 'En congé', color: 'text-amber-500 bg-amber-500/10' }
};

interface MonitorFormData {
    firstName: string;
    lastName: string;
    licenseNumber: string;
    email: string;
    phoneNumber: string;
    status: MonitorStatus;
}

const initialFormData: MonitorFormData = {
    firstName: "",
    lastName: "",
    licenseNumber: "",
    email: "",
    phoneNumber: "",
    status: "ACTIVE"
};

export default function MonitorsPage() {
    const { user } = useAuth();
    const schoolId = user?.schoolId;

    const {
        monitors,
        loading,
        error,
        refetch,
        createMonitor,
        updateMonitor,
        deleteMonitor
    } = useMonitors(schoolId || "");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MonitorFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (monitor: Monitor) => {
        setEditingId(monitor.id);
        setFormData({
            firstName: monitor.firstName,
            lastName: monitor.lastName,
            licenseNumber: monitor.licenseNumber,
            email: monitor.email || "",
            phoneNumber: monitor.phoneNumber || "",
            status: monitor.status
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                schoolId: schoolId || ""
            };

            if (editingId) {
                await updateMonitor(editingId, payload);
                toast.success("Moniteur mis à jour !");
            } else {
                await createMonitor(payload);
                toast.success("Moniteur ajouté avec succès !");
            }
            setIsModalOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce moniteur ?")) return;

        setDeletingId(id);
        try {
            await deleteMonitor(id);
            toast.success("Moniteur supprimé");
        } catch (err: any) {
            toast.error("Erreur lors de la suppression");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <Loader2 className="h-12 w-12 text-signal animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-snow mb-2">Erreur</h3>
                <p className="text-mist mb-4">{error}</p>
                <Button onClick={refetch} variant="outline">Réessayer</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-snow uppercase tracking-tight flex items-center gap-3">
                        <Users className="h-8 w-8 text-signal" />
                        Moniteurs
                    </h1>
                    <p className="text-mist font-bold">Gérez vos instructeurs et leurs informations.</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-signal text-asphalt hover:bg-signal/90 font-black uppercase tracking-widest text-xs px-6 py-6 rounded-2xl shadow-[0_0_20px_rgba(255,193,7,0.3)]">
                    <Plus className="h-4 w-4 mr-2" strokeWidth={3} />
                    Nouveau Moniteur
                </Button>
            </div>

            {/* Monitors Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {monitors.map((monitor) => (
                    <div
                        key={monitor.id}
                        className="bg-asphalt/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-signal/30 transition-all duration-300 group relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-signal">
                                {monitor.firstName[0]}{monitor.lastName[0]}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_LABELS[monitor.status].color}`}>
                                {STATUS_LABELS[monitor.status].label}
                            </div>
                        </div>

                        <div className="space-y-1 mb-6">
                            <h3 className="text-xl font-black text-snow uppercase tracking-tight">
                                {monitor.firstName} {monitor.lastName}
                            </h3>
                            <p className="text-mist text-sm font-bold flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5 text-signal" />
                                {monitor.licenseNumber}
                            </p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            {monitor.phoneNumber && (
                                <div className="flex items-center gap-3 text-sm text-mist/80">
                                    <Phone className="h-4 w-4 text-signal" />
                                    <span className="font-medium">{monitor.phoneNumber}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm text-mist/80">
                                <Shield className="h-4 w-4 text-signal" />
                                <span className="font-medium text-[10px] uppercase tracking-wider">Habilité B, A1, A2</span>
                            </div>
                        </div>

                        {/* Actions Overlay */}
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleOpenEdit(monitor)}
                                className="p-2 bg-white/5 hover:bg-signal/20 hover:text-signal rounded-xl transition-all"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(monitor.id)}
                                disabled={deletingId === monitor.id}
                                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all"
                            >
                                {deletingId === monitor.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}

                {monitors.length === 0 && (
                    <div className="col-span-full py-20 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                        <Users className="h-16 w-16 text-mist/20 mb-4" />
                        <h3 className="text-xl font-bold text-snow">Aucun moniteur</h3>
                        <p className="text-mist max-w-xs mx-auto mt-2">Commencez par ajouter les moniteurs de votre auto-école pour planifier des cours.</p>
                        <Button onClick={handleOpenCreate} variant="outline" className="mt-6">
                            Ajouter mon premier moniteur
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Modifier Moniteur" : "Nouveau Moniteur"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-mist ml-1">Prénom</Label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="bg-white/5 border-white/10 rounded-xl py-6 focus:border-signal/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-mist ml-1">Nom</Label>
                            <Input
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="bg-white/5 border-white/10 rounded-xl py-6 focus:border-signal/50"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-mist ml-1">N° de Licence BEPECASER</Label>
                        <Input
                            value={formData.licenseNumber}
                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            placeholder="Ex: 12345678"
                            className="bg-white/5 border-white/10 rounded-xl py-6 focus:border-signal/50"
                            required
                        />
                    </div>

                    {!editingId && (
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-mist ml-1">Email (compte moniteur)</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="moniteur@email.com"
                                className="bg-white/5 border-white/10 rounded-xl py-6 focus:border-signal/50"
                                required
                            />
                            <p className="text-[10px] text-mist/60 ml-1">Le mot de passe par défaut sera le n° de licence</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-mist ml-1">Téléphone</Label>
                        <Input
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl py-6 focus:border-signal/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-mist ml-1">Statut</Label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as MonitorStatus })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-snow outline-none focus:border-signal/50"
                        >
                            <option value="ACTIVE" className="bg-asphalt">Actif</option>
                            <option value="INACTIVE" className="bg-asphalt">Inactif</option>
                            <option value="ON_LEAVE" className="bg-asphalt">En congé</option>
                        </select>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 hover:bg-white/5"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-signal text-asphalt hover:bg-signal/90 font-black uppercase tracking-widest text-xs py-6"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                editingId ? "Enregistrer" : "Créer le moniteur"
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
