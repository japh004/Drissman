"use client";

import { useMonitors } from "@/hooks";
import { useState } from "react";
import { Loader2, Users, Plus, Mail, Phone, Hash, AlertTriangle, ShieldCheck } from "lucide-react";
import { MonitorStatus } from "@/types/partner";
import MonitorFormModal from "./MonitorFormModal";

export default function AdminMonitorsPage() {
    const { monitors, loading, error, deleteMonitor } = useMonitors();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-signal animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-400/10 border border-red-400/20 text-red-400 p-4 rounded-xl flex items-center">
                <AlertTriangle className="mr-3 h-5 w-5" />
                Erreur: {error}
            </div>
        );
    }

    const getStatusStyle = (status: MonitorStatus) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
            case 'INACTIVE': return 'bg-white/10 text-white/40 border-white/10';
            case 'SUSPENDED': return 'bg-red-400/10 text-red-400 border-red-400/20';
            default: return 'bg-white/10 text-white/70 border-white/20';
        }
    };

    const getStatusLabel = (status: MonitorStatus) => {
        switch (status) {
            case 'ACTIVE': return 'Actif';
            case 'INACTIVE': return 'Inactif';
            case 'SUSPENDED': return 'Suspendu';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <Users className="mr-3 h-6 w-6 text-signal" />
                        Équipe Pédagogique (Moniteurs)
                    </h1>
                    <p className="text-white/60 text-sm mt-1">
                        Gérez vos instructeurs, leurs accès et leurs assignations.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-signal text-asphalt font-medium rounded-xl hover:bg-signal/90 transition-colors shrink-0"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Ajouter un Moniteur
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {monitors.length === 0 ? (
                    <div className="col-span-full bg-asphalt-light border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
                        <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-white/20">
                            <Users className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Aucun instructeur dans l'équipe</h3>
                        <p className="text-white/40 text-sm max-w-sm mb-6">
                            Vous n'avez pas encore ajouté de moniteurs pour accompagner vos auto-écoles.
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-signal text-sm font-medium hover:underline"
                        >
                            Créer le premier profil Moniteur
                        </button>
                    </div>
                ) : (
                    monitors.map((monitor) => (
                        <div key={monitor.id} className="bg-asphalt-light border border-white/5 rounded-2xl flex flex-col overflow-hidden hover:border-white/10 transition-colors">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 bg-signal/10 rounded-full flex items-center justify-center text-signal font-bold text-xl border border-signal/20">
                                        {monitor.firstName.charAt(0)}{monitor.lastName.charAt(0)}
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusStyle(monitor.status)}`}>
                                        {getStatusLabel(monitor.status)}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white truncate">
                                    {monitor.firstName} {monitor.lastName}
                                </h3>

                                <div className="mt-4 space-y-2 text-sm">
                                    {monitor.userAccountProvisioned ? (
                                        <div className="flex items-center text-emerald-400">
                                            <ShieldCheck className="h-4 w-4 mr-2" />
                                            Compte App provisionné
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-amber-400/80">
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Accès App non configuré
                                        </div>
                                    )}

                                    <div className="flex items-center text-white/60">
                                        <Hash className="h-4 w-4 mr-2 text-white/20" />
                                        Permis: {monitor.licenseNumber}
                                    </div>

                                    {monitor.phoneNumber && (
                                        <div className="flex items-center text-white/60">
                                            <Phone className="h-4 w-4 mr-2 text-white/20" />
                                            {monitor.phoneNumber}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border-t border-white/5 p-4 flex justify-between items-center">
                                <span className="text-xs text-white/30">ID: {monitor.id?.substring(0, 8)}</span>
                                <button
                                    onClick={() => deleteMonitor(monitor.id!)}
                                    className="text-xs text-red-400/80 hover:text-red-400 font-medium transition-colors"
                                >
                                    Retirer
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <MonitorFormModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
