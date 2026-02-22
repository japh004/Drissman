"use client";

import { useSessions } from "@/hooks";
import { useState } from "react";
import { Loader2, CalendarDays, Plus, Clock, MapPin, User, CheckCircle, XCircle } from "lucide-react";
import { SessionStatus } from "@/types/partner";
import SessionFormModal from "../SessionFormModal";

export default function AdminSessionsPage() {
    const { sessions, loading, error, updateStatus } = useSessions();
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
            <div className="bg-red-400/10 border border-red-400/20 text-red-400 p-4 rounded-xl">
                Erreur: {error}
            </div>
        );
    }

    const formatTime = (timeStr: string) => {
        return timeStr.substring(0, 5); // Assumes HH:mm:ss format from API
    };

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date(dateStr));
    };

    const getStatusStyle = (status: SessionStatus) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
            case 'CONFIRMED': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
            case 'COMPLETED': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
            case 'CANCELED': return 'bg-red-400/10 text-red-400 border-red-400/20';
            default: return 'bg-white/10 text-white/70 border-white/20';
        }
    };

    const getStatusLabel = (status: SessionStatus) => {
        switch (status) {
            case 'SCHEDULED': return 'Planifiée';
            case 'CONFIRMED': return 'Confirmée';
            case 'COMPLETED': return 'Terminée';
            case 'CANCELED': return 'Annulée';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <CalendarDays className="mr-3 h-6 w-6 text-signal" />
                        Plannings & Cours
                    </h1>
                    <p className="text-white/60 text-sm mt-1">
                        Gérez les séances de conduite, assignez les moniteurs et suivez les heures consommées.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-signal text-asphalt font-medium rounded-xl hover:bg-signal/90 transition-colors shrink-0"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Nouvelle Séance
                </button>
            </div>

            <div className="bg-asphalt-light border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                {sessions.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-white/20">
                            <CalendarDays className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Aucune séance planifiée</h3>
                        <p className="text-white/40 text-sm max-w-sm mb-6">
                            Vous n'avez pas encore planifié de séances de conduite pour vos étudiants.
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-signal text-sm font-medium hover:underline"
                        >
                            Planifier la première séance
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Date & Heure</th>
                                    <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Moniteur (ID)</th>
                                    <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Lieu de RDV</th>
                                    <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Statut</th>
                                    <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium capitalize">{formatDate(session.date)}</span>
                                                <div className="flex items-center text-white/50 text-sm mt-1">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                                    {session.durationHours ? ` (${session.durationHours}h)` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center text-white/80">
                                                <User className="h-4 w-4 mr-2 text-white/30" />
                                                <span className="text-sm">{session.monitorId?.substring(0, 8)}...</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center text-white/70">
                                                <MapPin className="h-4 w-4 mr-2 text-white/30" />
                                                <span className="text-sm truncate max-w-[150px]">{session.meetingPoint || 'Non défini'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(session.status)}`}>
                                                {getStatusLabel(session.status)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {session.status === 'SCHEDULED' && (
                                                <button
                                                    onClick={() => updateStatus(session.id, 'CANCELED')}
                                                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Annuler"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            )}
                                            {(session.status === 'SCHEDULED' || session.status === 'CONFIRMED') && (
                                                <button
                                                    onClick={() => updateStatus(session.id, 'COMPLETED')}
                                                    className="p-2 text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                                    title="Marquer comme terminée"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <SessionFormModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
