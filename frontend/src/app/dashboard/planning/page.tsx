"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth, useMonitors, useSessions } from "@/hooks";
import { partnerService } from "@/lib/api/partners";
import { Enrollment, Monitor, Session, CreateSessionRequest, SessionStatus } from "@/types/partner";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    Calendar,
    Clock,
    User,
    Plus,
    X,
    MapPin,
    GraduationCap,
    CheckCircle2,
    Check
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8h à 18h

const STATUS_CONFIG: Record<string, { label: string, color: string, iconColor: string }> = {
    'SCHEDULED': { label: 'Planifié', color: 'bg-blue-500/10 border-blue-500/20 text-blue-500', iconColor: 'text-blue-500' },
    'CONFIRMED': { label: 'Confirmé', color: 'bg-signal/10 border-signal/20 text-signal', iconColor: 'text-signal' },
    'PENDING': { label: 'En attente', color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500', iconColor: 'text-yellow-500' },
    'COMPLETED': { label: 'Effectué', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', iconColor: 'text-emerald-500' },
    'CANCELLED': { label: 'Annulé', color: 'bg-red-500/10 border-red-500/20 text-red-500', iconColor: 'text-red-500' },
};

export default function PlanningPage() {
    const { user } = useAuth();
    const schoolId = user?.schoolId || "";


    const { sessions, loading: loadingSessions, error: errorSessions, refetch: refetchSessions, createSession, updateStatus } = useSessions(schoolId);
    const { monitors } = useMonitors(schoolId);

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date, hour: number } | null>(null);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    // Create form state
    const [createForm, setCreateForm] = useState({
        enrollmentId: "",
        monitorId: "",
        meetingPoint: "Auto-école",
        duration: 1
    });

    useEffect(() => {
        if (schoolId) {
            partnerService.getEnrollments(schoolId).then(setEnrollments).catch(console.error);
        }
    }, [schoolId]);

    // Get start and end of current week
    const { weekStart, weekEnd, weekDates } = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

        const start = new Date(today);
        start.setDate(diff + (currentWeekOffset * 7));
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        const dates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            return date;
        });

        return { weekStart: start, weekEnd: end, weekDates: dates };
    }, [currentWeekOffset]);

    // Calendar items (sessions only)
    const calendarItems = useMemo(() => {
        return sessions.filter(s => {
            const d = new Date(s.date);
            return d >= weekStart && d <= weekEnd;
        });
    }, [sessions, weekStart, weekEnd]);

    const getItemAt = (dayIndex: number, hour: number) => {
        const targetDate = weekDates[dayIndex];
        const dateStr = targetDate.toISOString().split('T')[0];

        // Check sessions
        const session = calendarItems.find(s => {
            return s.date === dateStr && parseInt(s.startTime.split(':')[0]) === hour;
        });
        if (session) return { type: 'session', data: session };

        return null;
    };

    const handleSlotClick = (dayIndex: number, hour: number) => {
        const item = getItemAt(dayIndex, hour);
        if (item) {
            if (item.type === 'session') {
                setSelectedSession(item.data as Session);
                setIsDetailModalOpen(true);
            }
            return;
        }

        const date = weekDates[dayIndex];
        setSelectedSlot({ date, hour });
        setIsCreateModalOpen(true);
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;

        const startTime = `${selectedSlot.hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(selectedSlot.hour + createForm.duration).toString().padStart(2, '0')}:00`;

        try {
            await createSession({
                enrollmentId: createForm.enrollmentId,
                monitorId: createForm.monitorId || undefined,
                date: selectedSlot.date.toISOString().split('T')[0],
                startTime,
                endTime,
                meetingPoint: createForm.meetingPoint,
                status: 'SCHEDULED'
            });
            toast.success("Cours planifié avec succès !");
            setIsCreateModalOpen(false);
            setCreateForm(prev => ({ ...prev, enrollmentId: "" }));
        } catch (err) {
            // Error toast handled in hook
        }
    };

    const handleStatusUpdate = async (id: string, status: SessionStatus) => {
        try {
            await updateStatus(id, status);
            toast.success(`Séance mise à jour : ${STATUS_CONFIG[status].label}`);
            setIsDetailModalOpen(false);
        } catch (err) { }
    };

    const formatWeekRange = () => {
        const startStr = weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
        const endStr = weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        return `${startStr} - ${endStr}`;
    };

    if (loadingSessions) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-12 w-12 text-signal animate-spin" />
                <p className="text-mist font-bold uppercase tracking-widest text-xs">Chargement du planning...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-snow uppercase tracking-tight flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-signal" />
                        Planning Interactif
                    </h1>
                    <p className="text-mist font-bold">Gérez vos cours et assignations moniteurs.</p>
                </div>

                <div className="flex items-center gap-4 bg-asphalt/50 border border-white/5 rounded-2xl p-2 backdrop-blur-xl">
                    <button onClick={() => setCurrentWeekOffset(prev => prev - 1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-mist group">
                        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <span className="text-snow font-black text-xs uppercase tracking-widest px-2">{formatWeekRange()}</span>
                    <button onClick={() => setCurrentWeekOffset(prev => prev + 1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-mist group">
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    {currentWeekOffset !== 0 && (
                        <Button onClick={() => setCurrentWeekOffset(0)} variant="ghost" className="h-8 px-3 text-[10px] font-black uppercase text-signal hover:bg-signal/10">
                            Aujourd'hui
                        </Button>
                    )}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-asphalt/30 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-6 text-left text-[10px] font-black text-mist uppercase tracking-[0.2em] w-24">Heure</th>
                                {DAYS.map((day, index) => (
                                    <th key={day} className="p-4 text-center min-w-[120px]">
                                        <span className="text-[10px] font-black text-mist/50 uppercase tracking-[0.2em] block mb-1">{day}</span>
                                        <div className={`text-2xl font-black inline-flex items-center justify-center w-10 h-10 rounded-2xl ${weekDates[index].toDateString() === new Date().toDateString()
                                            ? 'bg-signal text-asphalt'
                                            : 'text-snow'
                                            }`}>
                                            {weekDates[index].getDate()}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {HOURS.map((hour) => (
                                <tr key={hour} className="border-b border-white/[0.02] group/row">
                                    <td className="p-6 text-xs font-black text-mist/60 group-hover/row:text-snow transition-colors">
                                        {hour.toString().padStart(2, '0')}:00
                                    </td>
                                    {DAYS.map((_, dayIndex) => {
                                        const item = getItemAt(dayIndex, hour);
                                        return (
                                            <td key={dayIndex} className="p-1.5 relative h-24">
                                                <div
                                                    onClick={() => handleSlotClick(dayIndex, hour)}
                                                    className={`h-full w-full rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden p-3 flex flex-col justify-between ${item
                                                        ? item.type === 'session'
                                                            ? STATUS_CONFIG[item.data.status]?.color || 'bg-white/5'
                                                            : 'bg-white/10 border border-white/10'
                                                        : 'hover:bg-white/[0.03] border border-dashed border-transparent hover:border-white/10 flex items-center justify-center'
                                                        }`}
                                                >
                                                    {item ? (
                                                        <>
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    <User className={`h-3 w-3 flex-shrink-0 ${item.type === 'session' ? STATUS_CONFIG[item.data.status]?.iconColor : 'text-signal'}`} />
                                                                    <span className="text-[10px] font-black uppercase tracking-tighter truncate text-snow">
                                                                        {item.type === 'session' ? (item.data as Session).studentName : (item.data as any).user?.name}
                                                                    </span>
                                                                </div>
                                                                {item.type === 'session' && (item.data as Session).status === 'COMPLETED' && (
                                                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                                )}
                                                            </div>
                                                            <div className="mt-1">
                                                                <div className="flex items-center gap-1">
                                                                    <GraduationCap className="h-2.5 w-2.5 text-mist" />
                                                                    <span className="text-[9px] font-bold text-mist/80 truncate">
                                                                        {item.type === 'session' ? (item.data as Session).monitorName : 'Cours élève'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <Plus className="h-4 w-4 text-mist opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100" />
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Session Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Planifier un cours"
            >
                <form onSubmit={handleCreateSession} className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Élève & Inscription</Label>
                        <select
                            value={createForm.enrollmentId}
                            onChange={(e) => setCreateForm({ ...createForm, enrollmentId: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-snow outline-none focus:border-signal/50"
                            required
                        >
                            <option value="" className="bg-asphalt">Sélectionner un élève</option>
                            {enrollments.map(e => (
                                <option key={e.id} value={e.id} className="bg-asphalt">
                                    {e.userName} - {e.offerName} ({e.hoursPurchased - e.hoursConsumed}h restantes)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Moniteur</Label>
                        <select
                            value={createForm.monitorId}
                            onChange={(e) => setCreateForm({ ...createForm, monitorId: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-snow outline-none focus:border-signal/50"
                        >
                            <option value="" className="bg-asphalt">Non assigné (à faire plus tard)</option>
                            {monitors.filter(m => m.status === 'ACTIVE').map(m => (
                                <option key={m.id} value={m.id} className="bg-asphalt">
                                    {m.firstName} {m.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Heure de début</Label>
                            <Input
                                disabled
                                value={`${selectedSlot?.hour}:00`}
                                className="bg-white/5 border-white/10 text-mist"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Durée (Heures)</Label>
                            <select
                                value={createForm.duration}
                                onChange={(e) => setCreateForm({ ...createForm, duration: parseInt(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-snow outline-none"
                            >
                                <option value={1} className="bg-asphalt">1 heure</option>
                                <option value={2} className="bg-asphalt">2 heures</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Lieu de RDV</Label>
                        <Input
                            value={createForm.meetingPoint}
                            onChange={(e) => setCreateForm({ ...createForm, meetingPoint: e.target.value })}
                            className="bg-white/5 border-white/10"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="flex-1">Annuler</Button>
                        <Button type="submit" className="flex-1 bg-signal text-asphalt font-black uppercase tracking-widest text-xs py-6">
                            Confirmer la planification
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Session Detail/Update Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Détails du cours"
            >
                {selectedSession && (
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-signal/10 flex items-center justify-center">
                                    <User className="h-6 w-6 text-signal" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-snow uppercase tracking-tight">{selectedSession.studentName}</h4>
                                    <p className="text-mist text-xs font-bold uppercase tracking-widest">{selectedSession.offerName}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-mist uppercase tracking-widest block">Moniteur</span>
                                    <div className="flex items-center gap-2 text-snow font-bold italic">
                                        <GraduationCap className="h-4 w-4 text-signal/50" />
                                        {selectedSession.monitorName}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-mist uppercase tracking-widest block">Lieu de RDV</span>
                                    <div className="flex items-center gap-2 text-snow font-bold">
                                        <MapPin className="h-4 w-4 text-signal/50" />
                                        {selectedSession.meetingPoint}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Mettre à jour le statut</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {selectedSession.status !== 'COMPLETED' && (
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedSession.id, 'COMPLETED')}
                                        className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/30 font-black uppercase text-[10px] tracking-widest h-12"
                                    >
                                        <Check className="h-4 w-4 mr-2" strokeWidth={3} />
                                        Cours terminé
                                    </Button>
                                )}
                                {selectedSession.status !== 'CANCELLED' && (
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedSession.id, 'CANCELLED')}
                                        variant="ghost"
                                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 font-black uppercase text-[10px] tracking-widest h-12"
                                    >
                                        <X className="h-4 w-4 mr-2" strokeWidth={3} />
                                        Annuler le cours
                                    </Button>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => setIsDetailModalOpen(false)}
                            className="w-full text-mist hover:text-snow"
                        >
                            Fermer
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
