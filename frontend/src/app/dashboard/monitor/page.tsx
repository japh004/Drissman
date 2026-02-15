"use client";

import { useEffect, useState } from "react";
import { partnerService } from "@/lib/api/partners";
import { Monitor, Session, SessionStatus } from "@/types/partner";
import { Loader2, Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MonitorDashboardPage() {
    const [monitor, setMonitor] = useState<Monitor | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const monitorProfile = await partnerService.getMonitorProfile();
            setMonitor(monitorProfile);

            const mySessions = await partnerService.getSessionsByMonitor(monitorProfile.id);
            mySessions.sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
            setSessions(mySessions);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Impossible de charger le tableau de bord");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (sessionId: string, status: SessionStatus) => {
        try {
            setProcessingId(sessionId);
            await partnerService.updateSessionStatus(sessionId, status);
            toast.success(`Séance ${status === 'COMPLETED' ? 'validée' : 'annulée'}`);
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status } : s));
        } catch (err: any) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <Loader2 className="h-12 w-12 text-signal animate-spin" />
            </div>
        );
    }

    if (error || !monitor) {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p>{error || "Profil moniteur introuvable"}</p>
                <Button onClick={loadDashboard} variant="outline" className="mt-4">Réessayer</Button>
            </div>
        );
    }

    const upcomingSessions = sessions.filter(s => ['SCHEDULED', 'CONFIRMED'].includes(s.status));
    const pastSessions = sessions.filter(s => ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(s.status));

    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-6">
            {/* Header */}
            <div className="bg-asphalt/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 mb-8">
                <h1 className="text-3xl font-black text-snow uppercase tracking-tight mb-2">
                    Bonjour, {monitor.firstName}
                </h1>
                <p className="text-mist font-bold flex items-center gap-2">
                    <User className="h-4 w-4 text-signal" />
                    Moniteur - Licence {monitor.licenseNumber}
                </p>
            </div>

            {/* Upcoming Sessions */}
            <div className="space-y-4">
                <h2 className="text-xl font-black text-snow uppercase tracking-tight flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-signal" />
                    Mes Séances à venir
                </h2>

                {upcomingSessions.length === 0 ? (
                    <div className="text-center py-12 bg-white/[0.02] rounded-3xl border border-white/5">
                        <p className="text-mist">Aucune séance planifiée prochainement.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {upcomingSessions.map(session => (
                            <div key={session.id} className="bg-asphalt/50 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-signal font-bold uppercase tracking-wider text-sm">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(session.date), 'EEEE d MMMM yyyy', { locale: fr })}
                                    </div>
                                    <div className="flex items-center gap-2 text-snow text-xl font-black">
                                        <Clock className="h-5 w-5 text-mist" />
                                        {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
                                    </div>
                                    <div className="flex items-center gap-2 text-mist">
                                        <User className="h-4 w-4" />
                                        <span>Candidat : {session.studentName || 'Non assigné'}</span>
                                    </div>
                                    {session.meetingPoint && (
                                        <div className="flex items-center gap-2 text-mist text-sm">
                                            <MapPin className="h-3 w-3" />
                                            {session.meetingPoint}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button
                                        onClick={() => handleUpdateStatus(session.id, 'COMPLETED')}
                                        disabled={!!processingId}
                                        className="flex-1 md:flex-none bg-signal/20 text-signal hover:bg-signal/30 border border-signal/50"
                                    >
                                        {processingId === session.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                        Valider
                                    </Button>
                                    <Button
                                        onClick={() => handleUpdateStatus(session.id, 'CANCELLED')}
                                        disabled={!!processingId}
                                        variant="ghost"
                                        className="flex-1 md:flex-none hover:bg-red-500/20 hover:text-red-500"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* History */}
            <div className="pt-8 border-t border-white/5">
                <h2 className="text-lg font-bold text-mist mb-4">Historique récent</h2>
                <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                    {pastSessions.length === 0 ? (
                        <p className="text-mist text-sm text-center py-4">Aucune séance passée.</p>
                    ) : pastSessions.slice(0, 5).map(session => (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`h-2 w-2 rounded-full ${session.status === 'COMPLETED' ? 'bg-signal' : 'bg-red-500'}`} />
                                <span className="text-snow font-medium">
                                    {format(new Date(session.date), 'dd/MM/yyyy')}
                                </span>
                                <span className="text-mist">
                                    {session.startTime.substring(0, 5)}
                                </span>
                                <span className="text-snow">
                                    {session.studentName}
                                </span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-mist">
                                {session.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
