"use client";

import { usePartnerEnrollments } from "@/hooks";
import { Loader2, GraduationCap, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function CandidatEnrollmentsPage() {
    const { enrollments, loading, error } = usePartnerEnrollments();

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 text-signal animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                Une erreur est survenue lors du chargement de vos formations.
            </div>
        );
    }

    if (enrollments.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Mes Formations</h1>
                    <p className="text-white/60">Retrouvez ici le détail de vos forfaits souscrits.</p>
                </div>
                <div className="bg-asphalt-light border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
                    <GraduationCap className="h-12 w-12 text-white/20 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Aucune formation active</h3>
                    <p className="text-white/60 text-sm max-w-sm">
                        Vous n'avez pas encore souscrit à une offre de formation dans votre auto-école, ou votre dossier est en cours de validation.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Mes Formations</h1>
                    <p className="text-white/60">
                        Consultez l'avancement de vos forfaits et le solde de vos heures.
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrollments.map((enrollment) => {
                        const progressPercentage = enrollment.hoursPurchased > 0
                            ? Math.round((enrollment.hoursConsumed / enrollment.hoursPurchased) * 100)
                            : 0;

                        return (
                            <div key={enrollment.id} className="bg-asphalt-light border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-blue-400/10 flex items-center justify-center border border-blue-400/20">
                                                <GraduationCap className="h-6 w-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">
                                                    {enrollment.offerName || 'Forfait Standard'}
                                                </h3>
                                                <div className="flex items-center text-sm text-white/50 mt-1">
                                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                                    Forfait {enrollment.hoursPurchased} Heures
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${enrollment.status === 'ACTIVE'
                                            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                                            : enrollment.status === 'PENDING'
                                                ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                                                : 'bg-white/5 text-white/40 border-white/10'
                                            }`}>
                                            {enrollment.status === 'ACTIVE' ? 'En cours'
                                                : enrollment.status === 'PENDING' ? 'En attente'
                                                    : enrollment.status === 'COMPLETED' ? 'Terminée'
                                                        : enrollment.status}
                                        </span>
                                    </div>

                                    {/* Progress Section */}
                                    <div className="space-y-2 mt-8">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Heures consommées</span>
                                            <span className="font-medium text-white">
                                                {enrollment.hoursConsumed} <span className="text-white/40">/ {enrollment.hoursPurchased}h</span>
                                            </span>
                                        </div>
                                        <div className="h-2 bg-asphalt rounded-full overflow-hidden border border-white/5 relative">
                                            <div
                                                className={`absolute left-0 top-0 bottom-0 ${progressPercentage === 100 ? 'bg-emerald-400' : 'bg-blue-400'} transition-all`}
                                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-xs ${progressPercentage === 100 ? 'text-emerald-400' : 'text-white/40'}`}>
                                                {progressPercentage}% complété
                                            </span>
                                        </div>
                                    </div>

                                    {progressPercentage === 100 && (
                                        <div className="mt-6 flex items-center p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
                                            <CheckCircle className="h-5 w-5 text-emerald-400 mr-2 shrink-0" />
                                            <p className="text-sm text-emerald-400">
                                                Félicitations, vous avez complété toutes les heures de ce forfait !
                                            </p>
                                        </div>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
