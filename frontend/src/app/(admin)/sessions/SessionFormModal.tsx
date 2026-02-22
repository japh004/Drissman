"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, CalendarDays, Clock, MapPin, User, GraduationCap } from "lucide-react";
import { useSessions, useMonitors } from "@/hooks";
import { CreateSessionRequest, Enrollment } from "@/types/partner";
import { partnerService } from "@/lib/api/partners";
import { toast } from "sonner";

interface SessionFormModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function SessionFormModal({ onClose, onSuccess }: SessionFormModalProps) {
    const { createSession } = useSessions();
    const { monitors, loading: monitorsLoading } = useMonitors();

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default form to tomorrow at 09:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [formData, setFormData] = useState<CreateSessionRequest>({
        enrollmentId: "",
        monitorId: "",
        date: tomorrow.toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "10:00",
        meetingPoint: "",
        status: "SCHEDULED",
    });

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                // Fetch enrollments under the authenticated user's school implicitly 
                // using the updated partner endpoint structure
                const data = await partnerService.getEnrollments();
                setEnrollments(data.filter(e => e.status === 'ACTIVE' || e.status === 'PENDING'));
            } catch (error) {
                console.error("Failed to fetch enrollments", error);
                toast.error("Impossible de charger la liste des élèves");
            } finally {
                setEnrollmentsLoading(false);
            }
        };

        fetchEnrollments();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.enrollmentId || !formData.date || !formData.startTime || !formData.endTime) {
            toast.error("Veuillez remplir les champs obligatoires");
            return;
        }

        // Basic time validation
        if (formData.startTime >= formData.endTime) {
            toast.error("L'heure de fin doit être postérieure à l'heure de début");
            return;
        }

        setIsSubmitting(true);
        try {
            await createSession(formData);
            toast.success("Séance planifiée avec succès !");
            onSuccess();
        } catch (error: any) {
            console.error("Failed to create session", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDataLoading = monitorsLoading || enrollmentsLoading;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-asphalt-light border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-asphalt">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <CalendarDays className="mr-2 h-5 w-5 text-signal" />
                        Planifier une séance
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
                    {isDataLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-4">
                            <Loader2 className="w-8 h-8 text-signal animate-spin" />
                            <p className="text-white/50 text-sm">Chargement des élèves et moniteurs...</p>
                        </div>
                    ) : (
                        <form id="session-form" onSubmit={handleSubmit} className="space-y-5">

                            {/* Enrollment Selection */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-white/80 ml-1 flex items-center">
                                    <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-white/40" />
                                    Dossier Élève (Contrat) *
                                </label>
                                <select
                                    name="enrollmentId"
                                    value={formData.enrollmentId}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all"
                                >
                                    <option value="" disabled>Sélectionner un élève...</option>
                                    {enrollments.map((enr) => (
                                        <option key={enr.id} value={enr.id}>
                                            {enr.userName || 'Sans nom'} - {enr.offerName || 'Forfait'} ({enr.hoursConsumed}/{enr.hoursPurchased}h)
                                        </option>
                                    ))}
                                </select>
                                {enrollments.length === 0 && (
                                    <p className="text-xs text-amber-400 mt-1 ml-1">
                                        Aucun élève actif trouvé. Ils doivent souscrire à une offre d'abord.
                                    </p>
                                )}
                            </div>

                            {/* Monitor Selection */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-white/80 ml-1 flex items-center">
                                    <User className="h-3.5 w-3.5 mr-1.5 text-white/40" />
                                    Moniteur Assigné
                                </label>
                                <select
                                    name="monitorId"
                                    value={formData.monitorId}
                                    onChange={handleChange}
                                    className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all"
                                >
                                    <option value="">À définir plus tard</option>
                                    {monitors.map((mon) => (
                                        <option key={mon.id} value={mon.id}>
                                            {mon.firstName} {mon.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-white/80 ml-1 flex items-center">
                                        <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-white/40" />
                                        Date prévue *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-white/80 ml-1 flex items-center truncate">
                                            <Clock className="h-3.5 w-3.5 mr-1 text-white/40 shrink-0" />
                                            Début *
                                        </label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-asphalt border border-white/10 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-white/80 ml-1 truncate">
                                            Fin *
                                        </label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-asphalt border border-white/10 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Meeting Point */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-white/80 ml-1 flex items-center">
                                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-white/40" />
                                    Lieu de RDV
                                </label>
                                <input
                                    type="text"
                                    name="meetingPoint"
                                    value={formData.meetingPoint || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Devant la gare, Parking Ouest..."
                                    className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all"
                                />
                                <p className="text-xs text-white/40 ml-1 mt-1">
                                    Si laissé vide, le point de rdv sera l'auto-école par défaut.
                                </p>
                            </div>

                        </form>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-white/5 bg-asphalt/50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting || isDataLoading}
                        className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        form="session-form"
                        type="submit"
                        disabled={isSubmitting || isDataLoading}
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
                                Planifier
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
