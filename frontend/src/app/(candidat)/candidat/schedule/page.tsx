"use client";

import { useStudentSessions } from "@/hooks";
import { Loader2, CalendarDays, Clock, MapPin, User, CheckCircle, XCircle } from "lucide-react";
import { format, isFuture, isPast } from "date-fns";
import { fr } from "date-fns/locale";

export default function CandidatSchedulePage() {
    const { sessions, loading, error } = useStudentSessions();

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
                Une erreur est survenue lors du chargement de votre planning.
            </div>
        );
    }

    const upcomingSessions = sessions.filter(s => isFuture(new Date(`${s.date}T${s.startTime}`)) && s.status !== 'CANCELED').sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
    const pastSessions = sessions.filter(s => isPast(new Date(`${s.date}T${s.startTime}`)) || s.status === 'CANCELED').sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime());

    return (
        <div className="space-y-8 flex flex-col h-[calc(100vh-8rem)]">
            <div className="shrink-0">
                <h1 className="text-3xl font-bold text-white mb-2">Mon Planning</h1>
                <p className="text-white/60">
                    Consultez vos prochaines leçons de conduite et votre historique.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-12">
                {/* Upcoming Sessions Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <CalendarDays className="h-5 w-5 text-signal" />
                        <h2 className="text-xl font-bold text-white">À venir</h2>
                    </div>

                    {upcomingSessions.length === 0 ? (
                        <div className="bg-asphalt-light border border-white/5 rounded-2xl p-8 text-center">
                            <p className="text-white/60">Aucune leçon planifiée dans le futur.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {upcomingSessions.map((session) => (
                                <div key={session.id} className="bg-asphalt-light border border-white/10 rounded-2xl p-5 hover:border-signal/30 transition-colors relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-signal" />

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-lg font-bold text-white capitalize">
                                                {format(new Date(session.date), 'EEEE d MMMM', { locale: fr })}
                                            </p>
                                            <div className="flex items-center text-signal mt-1 font-medium">
                                                <Clock className="h-4 w-4 mr-1.5" />
                                                {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20">
                                            Planifiée
                                        </span>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        {session.monitorName && (
                                            <div className="flex items-center text-sm text-white/70">
                                                <User className="h-4 w-4 mr-3 text-white/40" />
                                                Avec {session.monitorName}
                                            </div>
                                        )}
                                        <div className="flex items-center text-sm text-white/70">
                                            <MapPin className="h-4 w-4 mr-3 text-white/40" />
                                            RDV : {session.meetingPoint || 'Auto-école (Défaut)'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Past Sessions Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <CheckCircle className="h-5 w-5 text-white/40" />
                        <h2 className="text-xl font-bold text-white/60">Historique</h2>
                    </div>

                    {pastSessions.length === 0 ? (
                        <div className="bg-asphalt-light border border-white/5 rounded-2xl p-8 text-center">
                            <p className="text-white/40">Aucun historique de leçon disponible.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pastSessions.map((session) => (
                                <div key={session.id} className="bg-asphalt/50 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                            <CalendarDays className="h-5 w-5 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium capitalize">
                                                {format(new Date(session.date), 'd MMM yyyy', { locale: fr })}
                                            </p>
                                            <div className="flex items-center text-xs text-white/50 space-x-3 mt-0.5">
                                                <span className="flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
                                                </span>
                                                {session.monitorName && (
                                                    <span className="flex items-center">
                                                        <User className="h-3 w-3 mr-1" />
                                                        {session.monitorName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center w-full sm:w-auto justify-end">
                                        {session.status === 'COMPLETED' ? (
                                            <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                Effectuée
                                            </span>
                                        ) : session.status === 'CANCELED' ? (
                                            <span className="flex items-center text-xs font-medium text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full">
                                                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                                Annulée
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-xs font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-full">
                                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                                Passée
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
