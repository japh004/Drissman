"use client";

import { useState } from "react";
import { X, Loader2, Save, User, Mail, Phone, Hash } from "lucide-react";
import { useMonitors } from "@/hooks";
import { CreateMonitorRequest } from "@/types/partner";
import { toast } from "sonner";

interface MonitorFormModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function MonitorFormModal({ onClose, onSuccess }: MonitorFormModalProps) {
    const { createMonitor } = useMonitors();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreateMonitorRequest>({
        schoolId: "", // Obsolete under new API, but kept for type compatibility if strictly required by old interface, will be ignored by backend
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        licenseNumber: "",
        status: "ACTIVE",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.licenseNumber) {
            toast.error("Veuillez remplir les champs obligatoires");
            return;
        }

        setIsSubmitting(true);
        try {
            await createMonitor(formData);
            toast.success("Moniteur ajouté avec succès !");
            onSuccess();
        } catch (error: any) {
            // Error toast handled in the hook, but we catch to stop loading state
            console.error("Failed to create monitor", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-asphalt-light border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-asphalt">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <User className="mr-2 h-5 w-5 text-signal" />
                        Ajouter un Moniteur
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body / Scrollable Form */}
                <div className="p-6 overflow-y-auto">
                    <form id="monitor-form" onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-white/80 ml-1">Prénom *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Jean"
                                    className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-white/80 ml-1">Nom *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Dupont"
                                    className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-white/80 ml-1 flex items-center">
                                <Mail className="h-3.5 w-3.5 mr-1.5 text-white/40" />
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="jean.dupont@example.com"
                                className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all"
                            />
                            <p className="text-xs text-white/40 ml-1 mt-1">
                                Utilisé pour provisionner son compte d'accès à l'application.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-white/80 ml-1 flex items-center">
                                    <Phone className="h-3.5 w-3.5 mr-1.5 text-white/40" />
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="06 12 34 56 78"
                                    className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-white/80 ml-1 flex items-center">
                                    <Hash className="h-3.5 w-3.5 mr-1.5 text-white/40" />
                                    N° Agrément / Permis *
                                </label>
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    required
                                    placeholder="A123456789"
                                    className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-white/5 bg-asphalt/50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        form="monitor-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center px-5 py-2.5 text-sm font-medium bg-signal text-asphalt rounded-xl hover:bg-signal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(204,255,0,0.15)]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Création...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
