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
    Shield,
    Mail,
    ChevronRight,
    Star,
    MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";

const STATUS_CONFIG: Record<MonitorStatus, { label: string, color: string, bgColor: string }> = {
    'ACTIVE': { label: 'En Activité', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
    'INACTIVE': { label: 'Inactif', color: 'text-mist', bgColor: 'bg-white/5 border-white/10' },
    'ON_LEAVE': { label: 'En Congé', color: 'text-amber-500', bgColor: 'bg-amber-500/10 border-amber-500/20' }
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
            const payload = { ...formData, schoolId: schoolId || "" };
            if (editingId) {
                await updateMonitor(editingId, payload);
                toast.success("Profil moniteur mis à jour");
            } else {
                await createMonitor(payload);
                toast.success("Nouveau moniteur accrédité");
            }
            setIsModalOpen(false);
            refetch();
        } catch (err: any) {
            toast.error(err.message || "Action échouée");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Révoquer l'accès de ce moniteur ?")) return;
        setDeletingId(id);
        try {
            await deleteMonitor(id);
            toast.success("Moniteur révoqué");
            refetch();
        } catch (err: any) {
            toast.error("Erreur de révocation");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 text-signal animate-spin" />
            <p className="text-[10px] font-black text-mist uppercase tracking-widest animate-pulse">Chargement de l&apos;équipe...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-snow tracking-tight uppercase">Équipe Instructeurs</h1>
                    <p className="text-mist font-medium">Gérez vos moniteurs, leurs habilitations et leur disponibilité opérationnelle.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-8 py-4 bg-signal text-asphalt font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-signal/80 transition-all shadow-lg shadow-signal/10 shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    Accréditer un moniteur
                </button>
            </div>

            {/* Profile Grid */}
            <div className="px-4">
                {monitors.length === 0 ? (
                    <div className="bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3.5rem] p-24 text-center">
                        <Shield className="h-16 w-16 text-mist/10 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-snow mb-2 italic tracking-tight uppercase">Aucun moniteur enregistré</h3>
                        <p className="text-mist text-xs max-w-sm mx-auto mb-10 font-bold uppercase tracking-widest opacity-60">Votre équipe est actuellement vide. Ajoutez votre premier instructeur pour commencer le planning.</p>
                        <button onClick={handleOpenCreate} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-snow font-black text-[10px] uppercase tracking-widest hover:bg-signal hover:text-asphalt transition-all">
                            Ajouter un instructeur
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {monitors.map((monitor) => {
                            const config = STATUS_CONFIG[monitor.status];
                            const initials = `${monitor.firstName[0]}${monitor.lastName[0]}`.toUpperCase();

                            return (
                                <div
                                    key={monitor.id}
                                    className="group relative bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.06] hover:border-signal/20 transition-all duration-500 flex flex-col overflow-hidden"
                                >
                                    {/* Decorative BG */}
                                    <div className="absolute top-0 right-0 -m-10 h-32 w-32 bg-signal/10 blur-[50px] rounded-full group-hover:bg-signal/20 transition-colors" />

                                    {/* Top Profile Area */}
                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-signal/30 to-signal/5 border border-signal/20 flex items-center justify-center text-2xl font-black text-signal shadow-lg shadow-signal/5 group-hover:scale-110 transition-transform duration-500">
                                            {initials}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${config.bgColor} ${config.color}`}>
                                                {config.label}
                                            </span>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleOpenEdit(monitor)} className="p-2 text-mist hover:text-signal transition-colors">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(monitor.id)} className="p-2 text-mist hover:text-red-400 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Name & Credentials */}
                                    <div className="space-y-4 relative z-10 flex-1">
                                        <div>
                                            <h3 className="text-2xl font-black text-snow leading-none uppercase tracking-tight group-hover:text-signal transition-colors">
                                                {monitor.firstName} {monitor.lastName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Star className="h-3 w-3 text-signal fill-signal" />
                                                <span className="text-[10px] font-black text-mist uppercase tracking-widest">Instructeur Principal</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center gap-3 text-xs text-snow/60 font-medium">
                                                <CreditCard className="h-4 w-4 text-signal" />
                                                <span className="tabular-nums">Licence: {monitor.licenseNumber}</span>
                                            </div>
                                            {monitor.phoneNumber && (
                                                <div className="flex items-center gap-3 text-xs text-snow/60 font-medium">
                                                    <Phone className="h-4 w-4 text-signal" />
                                                    <span>{monitor.phoneNumber}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-snow/60 font-medium">
                                                <Mail className="h-4 w-4 text-signal" />
                                                <span className="truncate">{monitor.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-1.5">
                                            <Shield className="h-3.5 w-3.5 text-signal" />
                                            <span className="text-[9px] font-black text-mist uppercase tracking-widest">Accrédité Drissman</span>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {['B', 'A'].map(p => (
                                                <div key={p} className="h-6 w-6 rounded-full bg-asphalt border border-white/10 flex items-center justify-center text-[8px] font-black text-snow">
                                                    {p}
                                                </div>
                                            ))}
                                            <div className="h-6 w-6 rounded-full bg-signal/10 border border-signal/20 flex items-center justify-center text-[8px] font-black text-signal">
                                                +
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Accreditation Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="">
                <div className="p-4 space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-snow tracking-tight uppercase">Accréditation</h2>
                        <p className="text-mist font-medium">Enregistrez un nouvel instructeur au sein de votre établissement.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Prénom</Label>
                                <Input
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-snow font-bold focus:border-signal/50"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Nom</Label>
                                <Input
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-snow font-bold focus:border-signal/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">N° Licence BEPECASER</Label>
                            <Input
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                placeholder="8 chiffres (ex: 12345678)"
                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-snow font-black tracking-widest focus:border-signal/50"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Point de Contact (Email)</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-snow font-bold focus:border-signal/50"
                                required
                                disabled={!!editingId}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Téléphone</Label>
                                <Input
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-snow font-bold focus:border-signal/50"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Assignation Statut</Label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MonitorStatus })}
                                    className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-snow appearance-none focus:ring-2 focus:ring-signal/20 outline-none cursor-pointer"
                                >
                                    <option value="ACTIVE" className="bg-asphalt">En Activité</option>
                                    <option value="INACTIVE" className="bg-asphalt">Inactif</option>
                                    <option value="ON_LEAVE" className="bg-asphalt">En Congé</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6 mt-6 border-t border-white/5">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="h-14 flex-1 rounded-2xl border border-white/10 text-mist text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-14 flex-[2] rounded-2xl bg-signal text-asphalt font-black uppercase tracking-widest text-[10px] hover:bg-signal/80 transition-all flex items-center justify-center gap-2 shadow-xl shadow-signal/20"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                                {editingId ? "Actualiser le Profil" : "Valider l'Accréditation"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
