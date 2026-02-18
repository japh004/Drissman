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
import { Loader2, Plus, Car, BookOpen, Calendar as CalendarIcon, Clock, AlertCircle, MapPin, User, ChevronRight, Activity, Sparkles } from "lucide-react";
import { toast } from "sonner";

// --- Utilities ---
function computeEndTime(startTime: string, durationMinutes: number): string | null {
    const parts = startTime.split(":");
    if (parts.length < 2) return null;
    const startH = parseInt(parts[0], 10);
    const startM = parseInt(parts[1], 10);
    if (isNaN(startH) || isNaN(startM)) return null;
    const totalMinutes = startH * 60 + startM + durationMinutes;
    if (totalMinutes > 23 * 60 + 59) return null;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
}

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

    const { monitors } = useMonitors(schoolId);
    const { createSession } = useSessions(schoolId);
    const { createLesson } = useLessons(schoolId);

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [sessionForm, setSessionForm] = useState({
        enrollmentId: "",
        monitorId: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "08:00",
        durationMinutes: 60,
        meetingPoint: "",
    });

    const [lessonForm, setLessonForm] = useState({
        monitorId: "",
        topic: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "18:00",
        roomId: "",
        capacity: 20,
    });

    useEffect(() => {
        if (open && schoolId) {
            const fetchEnrollments = async () => {
                setLoadingEnrollments(true);
                try {
                    const data = await partnerService.getEnrollments(schoolId);
                    setEnrollments(data.filter((e) => e.status === "VALIDATED" || e.status === "IN_PROGRESS"));
                } catch (err) {
                    toast.error("Erreur élèves");
                } finally {
                    setLoadingEnrollments(false);
                }
            };
            fetchEnrollments();
        }
    }, [open, schoolId]);

    const selectedEnrollment = useMemo(() => enrollments.find((e) => e.id === sessionForm.enrollmentId), [sessionForm.enrollmentId, enrollments]);
    const sessionEndTime = useMemo(() => computeEndTime(sessionForm.startTime, sessionForm.durationMinutes), [sessionForm.startTime, sessionForm.durationMinutes]);
    const lessonEndTime = useMemo(() => computeEndTime(lessonForm.startTime, 60), [lessonForm.startTime]);

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionForm.enrollmentId) return toast.error("Choix élève requis");
        setIsSubmitting(true);
        try {
            await createSession({
                ...sessionForm,
                endTime: sessionEndTime!,
                status: "SCHEDULED"
            });
            toast.success("Séance Conduite planifiée");
            setOpen(false);
        } catch (err) { } finally { setIsSubmitting(false); }
    };

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lessonForm.topic) return toast.error("Sujet requis");
        setIsSubmitting(true);
        try {
            await createLesson({
                ...lessonForm,
                endTime: lessonEndTime!,
            });
            toast.success("Cours de Code ouvert");
            setOpen(false);
        } catch (err) { } finally { setIsSubmitting(false); }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="w-full relative group mb-8">
                    <div className="absolute inset-0 bg-signal blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative h-16 bg-signal text-asphalt rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-signal/10 transition-transform active:scale-95">
                        <Plus className="h-5 w-5 stroke-[3]" />
                        Ajouter un cours
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-asphalt/95 backdrop-blur-2xl border-white/5 text-snow p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                <div className="p-8 pb-0">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-signal" />
                            Planification Rapide
                        </DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="session" onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1.5 rounded-2xl mb-10 h-auto">
                            <TabsTrigger value="session" className="py-3 rounded-xl data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist text-[10px] font-black uppercase tracking-widest transition-all">
                                <Car className="mr-2 h-4 w-4" /> Conduite
                            </TabsTrigger>
                            <TabsTrigger value="lesson" className="py-3 rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-snow text-mist text-[10px] font-black uppercase tracking-widest transition-all">
                                <BookOpen className="mr-2 h-4 w-4" /> Code
                            </TabsTrigger>
                        </TabsList>

                        <div className="min-h-[400px] pb-10">
                            {activeTab === "session" ? (
                                <form onSubmit={handleCreateSession} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Sélection Élève</Label>
                                        <select
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-snow font-bold focus:border-signal/50 outline-none appearance-none cursor-pointer"
                                            value={sessionForm.enrollmentId}
                                            onChange={(e) => setSessionForm({ ...sessionForm, enrollmentId: e.target.value })}
                                            required
                                        >
                                            <option value="" className="bg-asphalt italic">Parcourir le registre...</option>
                                            {enrollments.map(e => (
                                                <option key={e.id} value={e.id} className="bg-asphalt">{(e as any).studentName} — {e.offerName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Moniteur</Label>
                                            <select
                                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-snow font-bold focus:border-signal/50 outline-none appearance-none"
                                                value={sessionForm.monitorId}
                                                onChange={(e) => setSessionForm({ ...sessionForm, monitorId: e.target.value })}
                                            >
                                                <option value="" className="bg-asphalt">Auto-assigné</option>
                                                {monitors.map(m => (
                                                    <option key={m.id} value={m.id} className="bg-asphalt">{m.firstName} {m.lastName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Lieu de RDV</Label>
                                            <Input
                                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6"
                                                placeholder="Agence centrale"
                                                value={sessionForm.meetingPoint}
                                                onChange={(e) => setSessionForm({ ...sessionForm, meetingPoint: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Date</Label>
                                            <Input type="date" className="h-14 bg-white/5 border-white/10 rounded-2xl px-6" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Heure</Label>
                                            <Input type="time" className="h-14 bg-white/5 border-white/10 rounded-2xl px-6" value={sessionForm.startTime} onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Durée : <span className="text-signal">{sessionForm.durationMinutes} min</span></Label>
                                        <div className="flex gap-3">
                                            {DURATION_OPTIONS.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setSessionForm({ ...sessionForm, durationMinutes: opt.value })}
                                                    className={`h-12 flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${sessionForm.durationMinutes === opt.value ? "bg-signal/20 border-signal text-signal" : "bg-white/5 border-white/10 text-mist hover:bg-white/10"}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button type="submit" disabled={isSubmitting} className="w-full h-16 bg-signal text-asphalt rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-signal/20 flex items-center justify-center gap-3">
                                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Activity className="h-5 w-5" />} Planifier la séance
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleCreateLesson} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Sujet du cours collectif</Label>
                                        <Input
                                            placeholder="Ex: Signalisation horizontale"
                                            className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-snow font-bold focus:border-blue-500/50"
                                            value={lessonForm.topic}
                                            onChange={(e) => setLessonForm({ ...lessonForm, topic: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Animateur</Label>
                                            <select
                                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-snow font-bold focus:border-blue-500/50 outline-none appearance-none"
                                                value={lessonForm.monitorId}
                                                onChange={(e) => setLessonForm({ ...lessonForm, monitorId: e.target.value })}
                                            >
                                                <option value="" className="bg-asphalt">Par défaut</option>
                                                {monitors.map(m => (
                                                    <option key={m.id} value={m.id} className="bg-asphalt">{m.firstName} {m.lastName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Salle académique</Label>
                                            <Input className="h-14 bg-white/5 border-white/10 rounded-2xl px-6" placeholder="Salle 1-B" value={lessonForm.roomId} onChange={(e) => setLessonForm({ ...lessonForm, roomId: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Date d&apos;ouverture</Label>
                                            <Input type="date" className="h-14 bg-white/5 border-white/10 rounded-2xl px-6" value={lessonForm.date} onChange={(e) => setLessonForm({ ...lessonForm, date: e.target.value })} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Heure de début</Label>
                                            <Input type="time" className="h-14 bg-white/5 border-white/10 rounded-2xl px-6" value={lessonForm.startTime} onChange={(e) => setLessonForm({ ...lessonForm, startTime: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Capacité élèves</Label>
                                        <Input type="number" className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-black text-blue-400" value={lessonForm.capacity} onChange={(e) => setLessonForm({ ...lessonForm, capacity: parseInt(e.target.value) })} />
                                    </div>

                                    <button type="submit" disabled={isSubmitting} className="w-full h-16 bg-blue-500 text-snow rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3">
                                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CalendarIcon className="h-5 w-5" />} Ouvrir le cours
                                    </button>
                                </form>
                            )}
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
