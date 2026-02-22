"use client";

import { useState } from "react";
import { useInstructorProfile, useInstructorSessions } from "@/hooks";
import { Loader2, CalendarDays, MapPin, Clock, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, isFuture, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export default function MonitorSchedulePage() {
    const { monitorProfile } = useInstructorProfile();
    const { sessions, loading, error, validateSession } = useInstructorSessions(monitorProfile?.id);
    const [validatingId, setValidatingId] = useState<string | null>(null);

    const handleValidate = async (sessionId: string) => {
        setValidatingId(sessionId);
        try {
            await validateSession(sessionId, "Leçon complétée et validée par le moniteur.");
            toast.success("Leçon validée avec succès");
        } catch (err: any) {
            // Error managed by hook
        } finally {
            setValidatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 text-signal animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-8">
                <div className="bg-red-400/10 border border-red-400/20 rounded-2xl p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                    <p className="text-red-400 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    const upcomingSessions = sessions.filter(s => isFuture(new Date(`${s.date}T${s.startTime}`)) && s.status !== 'CANCELED').sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
    const needsValidationSessions = sessions.filter(s => isPast(new Date(`${s.date}T${s.startTime}`)) && s.status === 'SCHEDULED').sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime());
    const pastSessions = sessions.filter(s => (isPast(new Date(`${s.date}T${s.startTime}`)) && s.status !== 'SCHEDULED') || s.status === 'CANCELED').sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime());

    return (
        <div className="space-y-8 flex flex-col h-[calc(100vh-8rem)]">
            <header className="shrink-0 space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Mon Planning</h1>
                <p className="text-white/60">
                    Consultez vos horaires et validez la progression de vos élèves.
                </p>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 space-y-12">

                {/* À Valider Section */}
                {needsValidationSessions.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2 text-amber-400" />
                            Leçons à Valider
                            <span className="ml-3 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400">
                                {needsValidationSessions.length} en attente
                            </span>
                        </h2>

                        <div className="space-y-4">
                            {needsValidationSessions.map((session) => (
                                <div key={session.id} className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="h-12 w-12 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                                            <CalendarDays className="h-6 w-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium capitalize">
                                                {format(new Date(session.date), 'EEEE d MMMM yyyy', { locale: fr })}
                                            </p>
                                            <div className="flex items-center text-sm text-white/50 space-x-4 mt-1">
                                                <span className="flex items-center text-white/70">
                                                    <Clock className="h-4 w-4 mr-1 text-white/40" />
                                                    {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
                                                </span>
                                                <span className="flex items-center text-white/70">
                                                    <Users className="h-4 w-4 mr-1 text-white/40" />
                                                    {session.studentName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto flex flex-col gap-2">
                                        <button
                                            onClick={() => handleValidate(session.id)}
                                            disabled={validatingId === session.id}
                                            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                                        >
                                            {validatingId === session.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                            )}
                                            Valider la leçon
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming Sessions Section */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <CalendarDays className="h-5 w-5 mr-2 text-blue-400" />
                        À Venir
                    </h2>

                    {upcomingSessions.length === 0 ? (
                        <div className="text-center py-12 bg-asphalt-light border border-white/5 rounded-2xl">
                            <CalendarDays className="h-10 w-10 text-white/20 mx-auto mb-3" />
                            <p className="text-white/40 font-medium">Aucun cours planifié prochainement</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {upcomingSessions.map((session) => (
                                <div key={session.id} className="relative bg-asphalt-light border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white/5 text-white/90 font-medium px-3 py-1.5 rounded-lg text-sm">
                                                {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
                                            </div>
                                        </div>
                                        <span className="flex items-center text-xs font-medium text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full">
                                            <Clock className="w-3.5 h-3.5 mr-1" />
                                            Prévu
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-white font-medium text-lg capitalize">
                                                    {format(new Date(session.date), 'EEEE d MMMM', { locale: fr })}
                                                </p>
                                                <div className="flex flex-col gap-2 mt-2">
                                                    <span className="flex items-center text-sm text-white/60">
                                                        <Users className="h-4 w-4 mr-2 text-white/40" />
                                                        {session.studentName}
                                                    </span>
                                                    <span className="flex items-center text-sm text-white/60">
                                                        <MapPin className="h-4 w-4 mr-2 text-white/40" />
                                                        {session.meetingPoint || 'Lieu habituel'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Past Sessions Section */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-white/40" />
                        Historique des cours
                    </h2>

                    {pastSessions.length === 0 ? (
                        <div className="text-center py-8 bg-asphalt/50 border border-white/5 rounded-2xl">
                            <p className="text-white/40 text-sm">Aucun historique disponible</p>
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
                                                <span className="flex items-center">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {session.studentName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center w-full sm:w-auto justify-end">
                                        {session.status === 'COMPLETED' ? (
                                            <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                Validée
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
