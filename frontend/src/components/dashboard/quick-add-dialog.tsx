"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth, useMonitors, useLessons, useSessions } from "@/hooks";
import { partnerService } from "@/lib/api/partners";
import { Enrollment } from "@/types/partner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Car, BookOpen, Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// --- Utilities ---

/** Safely compute endTime string from startTime + durationMinutes. Returns null if invalid. */
function computeEndTime(startTime: string, durationMinutes: number): string | null {
    const parts = startTime.split(":");
    if (parts.length < 2) return null;
    const startH = parseInt(parts[0], 10);
    const startM = parseInt(parts[1], 10);
    if (isNaN(startH) || isNaN(startM)) return null;

    const totalMinutes = startH * 60 + startM + durationMinutes;
    if (totalMinutes > 23 * 60 + 59) return null; // Cannot exceed 23:59

    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
}

/** Check if a date string is today or in the future */
function isDateValid(dateStr: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr + "T00:00:00");
    return date >= today;
}

// --- Duration Options ---
const DURATION_OPTIONS = [
    { value: 60, label: "1h" },
    { value: 90, label: "1h30" },
    { value: 120, label: "2h" },
];

export function QuickAddDialog() {
    const { user } = useAuth();
    const schoolId = user?.schoolId || "";

    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("session");

    // Data Loading
    const { monitors } = useMonitors(schoolId);
    const { createSession } = useSessions(schoolId);
    const { createLesson } = useLessons(schoolId);

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);

    // Form States
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Session Form (Conduite)
    const [sessionForm, setSessionForm] = useState({
        enrollmentId: "",
        monitorId: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "08:00",
        durationMinutes: 60,
        meetingPoint: "",
    });

    // Lesson Form (Code)
    const [lessonForm, setLessonForm] = useState({
        monitorId: "",
        topic: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "18:00",
        roomId: "",
        capacity: 20,
    });

    // Validation errors
    const [sessionErrors, setSessionErrors] = useState<Record<string, string>>({});
    const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open && schoolId) {
            fetchEnrollments();
        }
    }, [open, schoolId]);

    const fetchEnrollments = async () => {
        setLoadingEnrollments(true);
        try {
            const data = await partnerService.getEnrollments(schoolId);
            setEnrollments(data.filter((e) => e.status === "ACTIVE"));
        } catch (err) {
            toast.error("Erreur lors du chargement des élèves");
        } finally {
            setLoadingEnrollments(false);
        }
    };

    // --- Computed values ---

    const selectedEnrollment = useMemo(() => {
        if (!sessionForm.enrollmentId) return null;
        return enrollments.find((e) => e.id === sessionForm.enrollmentId) || null;
    }, [sessionForm.enrollmentId, enrollments]);

    const remainingHours = useMemo(() => {
        if (!selectedEnrollment) return null;
        return selectedEnrollment.hoursPurchased - selectedEnrollment.hoursConsumed;
    }, [selectedEnrollment]);

    const sessionEndTime = useMemo(() => {
        return computeEndTime(sessionForm.startTime, sessionForm.durationMinutes);
    }, [sessionForm.startTime, sessionForm.durationMinutes]);

    const lessonEndTime = useMemo(() => {
        return computeEndTime(lessonForm.startTime, 60); // Cours de code = 1h fixe
    }, [lessonForm.startTime]);

    // --- Validation ---

    const validateSession = (): boolean => {
        const errors: Record<string, string> = {};

        if (!sessionForm.enrollmentId) errors.enrollmentId = "Veuillez sélectionner un élève";
        if (!sessionForm.date) errors.date = "La date est requise";
        else if (!isDateValid(sessionForm.date)) errors.date = "La date doit être aujourd'hui ou dans le futur";
        if (!sessionForm.startTime) errors.startTime = "L'heure de début est requise";
        if (!sessionEndTime) errors.startTime = "L'heure de fin dépasse la journée. Choisissez une heure plus tôt ou réduisez la durée.";

        if (remainingHours !== null && remainingHours < sessionForm.durationMinutes / 60) {
            errors.enrollmentId = `Heures insuffisantes (${remainingHours}h restantes, ${sessionForm.durationMinutes / 60}h requises)`;
        }

        setSessionErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateLesson = (): boolean => {
        const errors: Record<string, string> = {};

        if (!lessonForm.topic.trim()) errors.topic = "La thématique est requise";
        if (!lessonForm.date) errors.date = "La date est requise";
        else if (!isDateValid(lessonForm.date)) errors.date = "La date doit être aujourd'hui ou dans le futur";
        if (!lessonForm.startTime) errors.startTime = "L'heure de début est requise";
        if (!lessonEndTime) errors.startTime = "L'heure de fin dépasse la journée";
        if (lessonForm.capacity < 1) errors.capacity = "La capacité doit être d'au moins 1";

        setLessonErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // --- Submit handlers ---

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateSession()) return;

        setIsSubmitting(true);
        try {
            await createSession({
                enrollmentId: sessionForm.enrollmentId,
                monitorId: sessionForm.monitorId || undefined,
                date: sessionForm.date,
                startTime: sessionForm.startTime,
                endTime: sessionEndTime!,
                meetingPoint: sessionForm.meetingPoint || undefined,
                status: "SCHEDULED",
            });

            toast.success("Leçon de conduite planifiée avec succès");
            setOpen(false);
            resetSessionForm();
        } catch (err) {
            // Error handled in hook (toast)
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateLesson()) return;

        setIsSubmitting(true);
        try {
            const success = await createLesson({
                monitorId: lessonForm.monitorId || undefined,
                date: lessonForm.date,
                startTime: lessonForm.startTime,
                endTime: lessonEndTime!,
                topic: lessonForm.topic,
                roomId: lessonForm.roomId,
                capacity: lessonForm.capacity,
            });

            if (success) {
                setOpen(false);
                resetLessonForm();
            }
        } catch (err) {
            // Handled in hook
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetSessionForm = () => {
        setSessionForm({
            enrollmentId: "",
            monitorId: "",
            date: new Date().toISOString().split("T")[0],
            startTime: "08:00",
            durationMinutes: 60,
            meetingPoint: "",
        });
        setSessionErrors({});
    };

    const resetLessonForm = () => {
        setLessonForm({
            monitorId: "",
            topic: "",
            date: new Date().toISOString().split("T")[0],
            startTime: "18:00",
            roomId: "",
            capacity: 20,
        });
        setLessonErrors({});
    };

    const activeMonitors = monitors.filter((m) => m.status === "ACTIVE");

    // --- Error display helper ---
    const FieldError = ({ message }: { message?: string }) => {
        if (!message) return null;
        return (
            <p className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {message}
            </p>
        );
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSessionErrors({}); setLessonErrors({}); } }}>
            <DialogTrigger asChild>
                <Button className="w-full bg-signal text-asphalt font-black uppercase tracking-widest hover:bg-signal/90 mb-6 py-6 shadow-lg shadow-signal/20 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Plus className="mr-2 h-5 w-5" />
                    Nouveau Cours
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] bg-asphalt border-white/10 text-snow max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-signal" />
                        Planifier une session
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="session" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl mb-6">
                        <TabsTrigger value="session" className="data-[state=active]:bg-signal data-[state=active]:text-asphalt font-bold uppercase tracking-wide text-xs">
                            <Car className="mr-2 h-4 w-4" />
                            Conduite
                        </TabsTrigger>
                        <TabsTrigger value="lesson" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white font-bold uppercase tracking-wide text-xs">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Code (Collectif)
                        </TabsTrigger>
                    </TabsList>

                    {/* ONGLET CONDUITE */}
                    <TabsContent value="session">
                        <form onSubmit={handleCreateSession} className="space-y-4">
                            {/* Élève */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Élève *</Label>
                                <select
                                    className={`w-full bg-white/5 border rounded-xl p-3 text-sm text-snow outline-none focus:border-signal/50 transition-colors ${sessionErrors.enrollmentId ? "border-red-400/50" : "border-white/10"}`}
                                    required
                                    value={sessionForm.enrollmentId}
                                    onChange={(e) => { setSessionForm({ ...sessionForm, enrollmentId: e.target.value }); setSessionErrors({ ...sessionErrors, enrollmentId: "" }); }}
                                >
                                    <option value="" className="bg-asphalt">Sélectionner un élève...</option>
                                    {enrollments.map((enrollment) => (
                                        <option key={enrollment.id} value={enrollment.id} className="bg-asphalt">
                                            {enrollment.userName || "Sans nom"} ({enrollment.offerName})
                                        </option>
                                    ))}
                                </select>
                                <FieldError message={sessionErrors.enrollmentId} />

                                {/* Real-time remaining hours */}
                                {selectedEnrollment && remainingHours !== null && (
                                    <div className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-xs font-semibold ${remainingHours <= 2 ? "bg-red-400/10 text-red-400 border border-red-400/20" : remainingHours <= 5 ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20" : "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"}`}>
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{remainingHours}h restantes sur {selectedEnrollment.hoursPurchased}h</span>
                                        <span className="text-[10px] opacity-70 ml-auto">{selectedEnrollment.offerName}</span>
                                    </div>
                                )}
                            </div>

                            {/* Moniteur + Lieu */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Moniteur</Label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-snow outline-none focus:border-signal/50"
                                        value={sessionForm.monitorId}
                                        onChange={(e) => setSessionForm({ ...sessionForm, monitorId: e.target.value })}
                                    >
                                        <option value="" className="bg-asphalt">Non assigné</option>
                                        {activeMonitors.map((m) => (
                                            <option key={m.id} value={m.id} className="bg-asphalt">{m.firstName} {m.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Lieu de RDV</Label>
                                    <Input
                                        className="bg-white/5 border-white/10"
                                        placeholder="Bureau / Gare..."
                                        value={sessionForm.meetingPoint}
                                        onChange={(e) => setSessionForm({ ...sessionForm, meetingPoint: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Date + Heure */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Date *</Label>
                                    <Input
                                        type="date"
                                        className={`bg-white/5 block ${sessionErrors.date ? "border-red-400/50" : "border-white/10"}`}
                                        required
                                        value={sessionForm.date}
                                        onChange={(e) => { setSessionForm({ ...sessionForm, date: e.target.value }); setSessionErrors({ ...sessionErrors, date: "" }); }}
                                    />
                                    <FieldError message={sessionErrors.date} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Heure début *</Label>
                                    <Input
                                        type="time"
                                        className={`bg-white/5 ${sessionErrors.startTime ? "border-red-400/50" : "border-white/10"}`}
                                        required
                                        value={sessionForm.startTime}
                                        onChange={(e) => { setSessionForm({ ...sessionForm, startTime: e.target.value }); setSessionErrors({ ...sessionErrors, startTime: "" }); }}
                                    />
                                    <FieldError message={sessionErrors.startTime} />
                                </div>
                            </div>

                            {/* Duration Selector */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Durée</Label>
                                <div className="flex gap-2">
                                    {DURATION_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setSessionForm({ ...sessionForm, durationMinutes: opt.value })}
                                            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold border transition-all duration-200 ${sessionForm.durationMinutes === opt.value
                                                    ? "bg-signal/20 border-signal text-signal shadow-md shadow-signal/10"
                                                    : "bg-white/5 border-white/10 text-mist hover:border-white/20 hover:text-snow"
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                {sessionEndTime && (
                                    <p className="text-[11px] text-mist mt-1 ml-1">
                                        Fin prévue : <span className="text-snow font-semibold">{sessionEndTime}</span>
                                    </p>
                                )}
                            </div>

                            <Button type="submit" disabled={isSubmitting || loadingEnrollments} className="w-full bg-signal text-asphalt font-black uppercase tracking-widest py-6 mt-2">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer la leçon"}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* ONGLET CODE */}
                    <TabsContent value="lesson">
                        <form onSubmit={handleCreateLesson} className="space-y-4">
                            {/* Thématique */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Thématique *</Label>
                                <Input
                                    className={`bg-white/5 ${lessonErrors.topic ? "border-red-400/50" : "border-white/10"}`}
                                    placeholder="Ex: Priorités, Signalisation..."
                                    required
                                    value={lessonForm.topic}
                                    onChange={(e) => { setLessonForm({ ...lessonForm, topic: e.target.value }); setLessonErrors({ ...lessonErrors, topic: "" }); }}
                                />
                                <FieldError message={lessonErrors.topic} />
                            </div>

                            {/* Animateur */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Animateur</Label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-snow outline-none focus:border-signal/50"
                                    value={lessonForm.monitorId}
                                    onChange={(e) => setLessonForm({ ...lessonForm, monitorId: e.target.value })}
                                >
                                    <option value="" className="bg-asphalt">Non assigné</option>
                                    {activeMonitors.map((m) => (
                                        <option key={m.id} value={m.id} className="bg-asphalt">{m.firstName} {m.lastName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date + Heure */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Date *</Label>
                                    <Input
                                        type="date"
                                        className={`bg-white/5 block ${lessonErrors.date ? "border-red-400/50" : "border-white/10"}`}
                                        required
                                        value={lessonForm.date}
                                        onChange={(e) => { setLessonForm({ ...lessonForm, date: e.target.value }); setLessonErrors({ ...lessonErrors, date: "" }); }}
                                    />
                                    <FieldError message={lessonErrors.date} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Heure (Début) *</Label>
                                    <Input
                                        type="time"
                                        className={`bg-white/5 ${lessonErrors.startTime ? "border-red-400/50" : "border-white/10"}`}
                                        required
                                        value={lessonForm.startTime}
                                        onChange={(e) => { setLessonForm({ ...lessonForm, startTime: e.target.value }); setLessonErrors({ ...lessonErrors, startTime: "" }); }}
                                    />
                                    <FieldError message={lessonErrors.startTime} />
                                    {lessonEndTime && (
                                        <p className="text-[11px] text-mist mt-1">
                                            Fin : <span className="text-snow font-semibold">{lessonEndTime}</span> (1h)
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Salle + Capacité */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Salle</Label>
                                    <Input
                                        className="bg-white/5 border-white/10"
                                        placeholder="Salle 1"
                                        value={lessonForm.roomId}
                                        onChange={(e) => setLessonForm({ ...lessonForm, roomId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-mist ml-1">Capacité</Label>
                                    <Input
                                        type="number"
                                        className={`bg-white/5 ${lessonErrors.capacity ? "border-red-400/50" : "border-white/10"}`}
                                        min={1}
                                        value={lessonForm.capacity}
                                        onChange={(e) => setLessonForm({ ...lessonForm, capacity: parseInt(e.target.value) || 1 })}
                                    />
                                    <FieldError message={lessonErrors.capacity} />
                                </div>
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-500 text-white font-black uppercase tracking-widest py-6 mt-2 hover:bg-purple-600">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le cours de code"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
