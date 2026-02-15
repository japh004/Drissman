"use client";

import { useState, useMemo } from "react";
import { useAuth, useLessons, useMonitors, useModules } from "@/hooks";
import { Lesson, StudentRegistration } from "@/types/lesson";
import { lessonService } from "@/lib/api";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Calendar,
    User,
    Plus,
    X,
    MapPin,
    GraduationCap,
    BookOpen,
    Users,
    Edit3,
    XCircle,
    Info,
    Car,
    FileCheck,
    CheckCircle2,
    Trash2,
    Clock,
    Filter
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8h à 20h

const LESSON_TYPE_CONFIG = {
    CODE: {
        label: "Code",
        icon: BookOpen,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        badgeBg: "bg-blue-500/20",
    },
    CONDUITE: {
        label: "Conduite",
        icon: Car,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        badgeBg: "bg-amber-500/20",
    },
    EXAMEN_BLANC: {
        label: "Examen",
        icon: FileCheck,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        badgeBg: "bg-purple-500/20",
    },
};

/** Get fill-rate class: green < 50%, orange < 80%, red >= 80% */
function getFillRateStyle(enrolled: number, capacity: number): { bgClass: string; textClass: string; borderClass: string } {
    if (capacity === 0) return { bgClass: "bg-purple-500/10", textClass: "text-purple-400", borderClass: "border-purple-500/20" };
    const ratio = enrolled / capacity;
    if (ratio >= 0.8) return { bgClass: "bg-red-500/10", textClass: "text-red-400", borderClass: "border-red-500/20" };
    if (ratio >= 0.5) return { bgClass: "bg-orange-500/10", textClass: "text-orange-400", borderClass: "border-orange-500/20" };
    return { bgClass: "bg-emerald-500/10", textClass: "text-emerald-400", borderClass: "border-emerald-500/20" };
}

export default function TheoryPage() {
    const { user } = useAuth();
    const schoolId = user?.schoolId || "";

    const { lessons, loading, createLesson, updateLesson, cancelLesson, completeLesson, deleteLesson, refetch } = useLessons(schoolId);
    const { monitors } = useMonitors(schoolId);
    const { modules } = useModules(schoolId);

    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date, hour: number } | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [filterType, setFilterType] = useState<string>("ALL");

    // Students list for detail modal
    const [students, setStudents] = useState<StudentRegistration[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Create/Edit form state
    const [formState, setFormState] = useState({
        monitorId: "",
        topic: "",
        lessonType: "CODE",
        moduleId: "",
        description: "",
        roomId: "",
        capacity: 20,
        startTime: "",
        endTime: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const weekLessons = useMemo(() => {
        return lessons.filter(l => {
            const d = new Date(l.date);
            const inWeek = d >= weekStart && d <= weekEnd;
            const matchesFilter = filterType === "ALL" || l.lessonType === filterType;
            return inWeek && matchesFilter;
        });
    }, [lessons, weekStart, weekEnd, filterType]);

    const getLessonAt = (dayIndex: number, hour: number) => {
        const targetDate = weekDates[dayIndex];
        const dateStr = targetDate.toISOString().split('T')[0];

        return weekLessons.find(l => {
            return l.date === dateStr && parseInt(l.startTime.split(':')[0]) === hour;
        });
    };

    const getLessonSpan = (lesson: Lesson): number => {
        const startHour = parseInt(lesson.startTime.split(':')[0]);
        const endHour = parseInt(lesson.endTime.split(':')[0]);
        const endMin = parseInt(lesson.endTime.split(':')[1] || '0');
        return Math.max(1, endHour - startHour + (endMin > 0 ? 1 : 0));
    };

    const isSlotOccupiedByMultiHour = (dayIndex: number, hour: number): boolean => {
        const targetDate = weekDates[dayIndex];
        const dateStr = targetDate.toISOString().split('T')[0];

        return weekLessons.some(l => {
            if (l.date !== dateStr) return false;
            const startHour = parseInt(l.startTime.split(':')[0]);
            const span = getLessonSpan(l);
            return hour > startHour && hour < startHour + span;
        });
    };

    const handleSlotClick = (dayIndex: number, hour: number) => {
        if (isSlotOccupiedByMultiHour(dayIndex, hour)) return;

        const existingLesson = getLessonAt(dayIndex, hour);
        if (existingLesson) {
            openDetailModal(existingLesson);
            return;
        }

        const date = weekDates[dayIndex];
        if (date < new Date() && date.toDateString() !== new Date().toDateString()) {
            toast.error("Impossible de planifier dans le passé");
            return;
        }

        setSelectedSlot({ date, hour });
        setFormState({
            monitorId: "",
            topic: "",
            lessonType: "CODE",
            moduleId: "",
            description: "",
            roomId: "",
            capacity: 20,
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        });
        setIsEditMode(false);
        setIsCreateModalOpen(true);
    };

    const openDetailModal = async (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setIsDetailModalOpen(true);
        setLoadingStudents(true);
        try {
            const data = await lessonService.getStudents(lesson.id);
            setStudents(data);
        } catch {
            setStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleOpenEdit = () => {
        if (!selectedLesson) return;
        setFormState({
            monitorId: selectedLesson.monitorId || "",
            topic: selectedLesson.topic,
            lessonType: selectedLesson.lessonType || "CODE",
            moduleId: selectedLesson.moduleId || "",
            description: selectedLesson.description || "",
            roomId: selectedLesson.roomId || "",
            capacity: selectedLesson.capacity,
            startTime: selectedLesson.startTime.slice(0, 5),
            endTime: selectedLesson.endTime.slice(0, 5),
        });
        setIsEditMode(true);
        setIsDetailModalOpen(false);
        setIsCreateModalOpen(true);
    };

    const handleCancelLesson = async () => {
        if (!selectedLesson) return;
        const confirmed = window.confirm(`Voulez-vous vraiment annuler le cours "${selectedLesson.topic}" ?`);
        if (!confirmed) return;

        setIsSubmitting(true);
        try {
            await cancelLesson(selectedLesson.id);
            setIsDetailModalOpen(false);
            setSelectedLesson(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteLesson = async () => {
        if (!selectedLesson) return;
        setIsSubmitting(true);
        try {
            await completeLesson(selectedLesson.id);
            setIsDetailModalOpen(false);
            setSelectedLesson(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLesson = async () => {
        if (!selectedLesson) return;
        const confirmed = window.confirm(`Voulez-vous vraiment supprimer ce cours ? Cette action est irréversible.`);
        if (!confirmed) return;

        setIsSubmitting(true);
        try {
            await deleteLesson(selectedLesson.id);
            setIsDetailModalOpen(false);
            setSelectedLesson(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkAttendance = async (studentId: string, status: string) => {
        if (!selectedLesson) return;
        try {
            await lessonService.markAttendance(selectedLesson.id, studentId, status);
            const data = await lessonService.getStudents(selectedLesson.id);
            setStudents(data);
            toast.success("Présence mise à jour");
        } catch (err: any) {
            toast.error(err.message || "Erreur");
        }
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode && selectedLesson) {
            setIsSubmitting(true);
            try {
                const success = await updateLesson(selectedLesson.id, {
                    monitorId: formState.monitorId || undefined,
                    date: selectedLesson.date,
                    startTime: formState.startTime,
                    endTime: formState.endTime,
                    topic: formState.topic,
                    lessonType: formState.lessonType,
                    moduleId: formState.moduleId || undefined,
                    description: formState.description,
                    roomId: formState.roomId,
                    capacity: formState.capacity,
                });
                if (success) {
                    setIsCreateModalOpen(false);
                    setSelectedLesson(null);
                    setIsEditMode(false);
                }
            } finally {
                setIsSubmitting(false);
            }
        } else if (selectedSlot) {
            setIsSubmitting(true);
            try {
                const success = await createLesson({
                    monitorId: formState.monitorId || undefined,
                    date: selectedSlot.date.toISOString().split('T')[0],
                    startTime: formState.startTime,
                    endTime: formState.endTime,
                    topic: formState.topic,
                    lessonType: formState.lessonType,
                    moduleId: formState.moduleId || undefined,
                    description: formState.description,
                    roomId: formState.roomId,
                    capacity: formState.capacity,
                });

                if (success) {
                    setIsCreateModalOpen(false);
                    setFormState({ monitorId: "", topic: "", lessonType: "CODE", moduleId: "", description: "", roomId: "", capacity: 20, startTime: "", endTime: "" });
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const formatWeekRange = () => {
        const startStr = weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
        const endStr = weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        return `${startStr} - ${endStr}`;
    };

    if (loading) {
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
                        <BookOpen className="h-8 w-8 text-signal" />
                        Planning des cours
                    </h1>
                    <p className="text-mist font-bold">Planifiez et gérez vos cours théoriques, pratiques et examens blancs.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Filter by Type */}
                    <div className="flex items-center gap-1 bg-asphalt/50 border border-white/5 rounded-2xl p-1 backdrop-blur-xl">
                        <button
                            onClick={() => setFilterType("ALL")}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filterType === "ALL" ? "bg-signal text-asphalt" : "text-mist hover:text-snow hover:bg-white/5"}`}
                        >
                            Tous
                        </button>
                        {Object.entries(LESSON_TYPE_CONFIG).map(([key, cfg]) => {
                            const Icon = cfg.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setFilterType(key)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${filterType === key ? `${cfg.badgeBg} ${cfg.color}` : "text-mist hover:text-snow hover:bg-white/5"}`}
                                >
                                    <Icon className="h-3 w-3" />
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Week Navigation */}
                    <div className="flex items-center gap-2 bg-asphalt/50 border border-white/5 rounded-2xl p-2 backdrop-blur-xl">
                        <button onClick={() => setCurrentWeekOffset(prev => prev - 1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-mist group">
                            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <span className="text-snow font-black text-xs uppercase tracking-widest px-2">{formatWeekRange()}</span>
                        <button onClick={() => setCurrentWeekOffset(prev => prev + 1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-mist group">
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        {currentWeekOffset !== 0 && (
                            <Button onClick={() => setCurrentWeekOffset(0)} variant="ghost" className="h-8 px-3 text-[10px] font-black uppercase text-signal hover:bg-signal/10">
                                Aujourd&apos;hui
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider text-mist">
                <span className="text-snow/40">Types :</span>
                {Object.entries(LESSON_TYPE_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                        <div key={key} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded ${cfg.bgColor} border ${cfg.borderColor}`} />
                            <Icon className={`h-3 w-3 ${cfg.color}`} />
                            <span>{cfg.label}</span>
                        </div>
                    );
                })}
                <span className="ml-4 text-snow/40">Remplissage :</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/30" />
                    <span>&lt; 50%</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/30" />
                    <span>50-80%</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500/30" />
                    <span>&ge; 80%</span>
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
                                        // Skip if this slot is part of a multi-hour lesson
                                        if (isSlotOccupiedByMultiHour(dayIndex, hour)) {
                                            return null;
                                        }

                                        const lesson = getLessonAt(dayIndex, hour);
                                        const isCancelled = lesson?.status === 'CANCELLED';
                                        const isCompleted = lesson?.status === 'COMPLETED';
                                        const fillStyle = lesson ? getFillRateStyle(lesson.enrolledCount, lesson.capacity) : null;
                                        const typeConfig = lesson ? LESSON_TYPE_CONFIG[lesson.lessonType || 'CODE'] : null;
                                        const TypeIcon = typeConfig?.icon || BookOpen;
                                        const span = lesson ? getLessonSpan(lesson) : 1;

                                        return (
                                            <td key={dayIndex} className="p-1.5 relative h-24" rowSpan={span}>
                                                <div
                                                    onClick={() => handleSlotClick(dayIndex, hour)}
                                                    className={`h-full w-full rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden p-3 flex flex-col justify-between border ${lesson
                                                        ? isCancelled
                                                            ? 'bg-white/5 border-white/10 opacity-50'
                                                            : isCompleted
                                                                ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                                                                : `${typeConfig!.bgColor} ${typeConfig!.borderColor}`
                                                        : 'hover:bg-white/[0.03] border-dashed border-transparent hover:border-white/10 flex items-center justify-center'
                                                        }`}
                                                >
                                                    {lesson ? (
                                                        <>
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    <TypeIcon className={`h-3 w-3 flex-shrink-0 ${isCancelled ? 'text-mist' : typeConfig!.color}`} />
                                                                    <span className={`text-[10px] font-black uppercase tracking-tighter truncate ${isCancelled ? 'text-mist line-through' : 'text-snow'}`}>
                                                                        {lesson.topic}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {isCompleted && (
                                                                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                                                    )}
                                                                    {isCancelled && (
                                                                        <span className="text-[8px] font-black text-red-400 uppercase">Annulé</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="mt-1 space-y-1">
                                                                <div className="flex items-center gap-1">
                                                                    <GraduationCap className="h-2.5 w-2.5 text-mist" />
                                                                    <span className="text-[9px] font-bold text-mist/80 truncate">
                                                                        {lesson.monitorName}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <Users className={`h-2.5 w-2.5 ${isCancelled ? 'text-mist' : fillStyle!.textClass}`} />
                                                                        <span className={`text-[9px] font-bold ${isCancelled ? 'text-mist' : fillStyle!.textClass}`}>
                                                                            {lesson.enrolledCount}/{lesson.capacity}
                                                                        </span>
                                                                    </div>
                                                                    {lesson.startTime && lesson.endTime && (
                                                                        <div className="flex items-center gap-0.5">
                                                                            <Clock className="h-2 w-2 text-mist/50" />
                                                                            <span className="text-[8px] text-mist/50">{lesson.startTime.slice(0, 5)}-{lesson.endTime.slice(0, 5)}</span>
                                                                        </div>
                                                                    )}
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

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => { setIsDetailModalOpen(false); setSelectedLesson(null); setStudents([]); }}
                title="Détails du cours"
            >
                {selectedLesson && (() => {
                    const typeConfig = LESSON_TYPE_CONFIG[selectedLesson.lessonType || 'CODE'];
                    const TypeIcon = typeConfig?.icon || BookOpen;
                    return (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg border ${typeConfig.badgeBg} ${typeConfig.color} ${typeConfig.borderColor}`}>
                                        <TypeIcon className="h-3 w-3" />
                                        {typeConfig.label}
                                    </span>
                                    <h3 className="text-lg font-black text-snow uppercase tracking-tight">{selectedLesson.topic}</h3>
                                    {selectedLesson.status === 'CANCELLED' && (
                                        <span className="text-[10px] font-black bg-red-500/10 text-red-400 px-2 py-1 rounded-lg border border-red-500/20">ANNULÉ</span>
                                    )}
                                    {selectedLesson.status === 'COMPLETED' && (
                                        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/20">TERMINÉ</span>
                                    )}
                                </div>

                                {selectedLesson.description && (
                                    <p className="text-sm text-mist/80 bg-white/5 rounded-xl p-3 border border-white/5">
                                        {selectedLesson.description}
                                    </p>
                                )}

                                {selectedLesson.moduleName && (
                                    <div className="flex items-center gap-2 text-mist text-xs">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        <span>Module : <strong className="text-snow">{selectedLesson.moduleName}</strong></span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <p className="text-[10px] font-black text-mist uppercase tracking-wider mb-1">Date</p>
                                        <p className="text-sm font-bold text-snow">
                                            {new Date(selectedLesson.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <p className="text-[10px] font-black text-mist uppercase tracking-wider mb-1">Horaire</p>
                                        <p className="text-sm font-bold text-snow">
                                            {selectedLesson.startTime.slice(0, 5)} - {selectedLesson.endTime.slice(0, 5)}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <p className="text-[10px] font-black text-mist uppercase tracking-wider mb-1">Moniteur</p>
                                        <p className="text-sm font-bold text-snow">{selectedLesson.monitorName || "Non assigné"}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <p className="text-[10px] font-black text-mist uppercase tracking-wider mb-1">Inscrits</p>
                                        <p className={`text-sm font-bold ${(() => {
                                            const style = getFillRateStyle(selectedLesson.enrolledCount, selectedLesson.capacity);
                                            return style.textClass;
                                        })()}`}>
                                            {selectedLesson.enrolledCount} / {selectedLesson.capacity}
                                        </p>
                                    </div>
                                </div>

                                {selectedLesson.roomId && (
                                    <div className="flex items-center gap-2 text-mist text-sm">
                                        <MapPin className="h-4 w-4" />
                                        <span>{selectedLesson.roomId}</span>
                                    </div>
                                )}
                            </div>

                            {/* Student List with Attendance */}
                            {selectedLesson.enrolledCount > 0 && (
                                <div className="border-t border-white/5 pt-4">
                                    <h4 className="text-[10px] font-black text-mist uppercase tracking-[0.2em] mb-3">
                                        Élèves inscrits ({selectedLesson.enrolledCount})
                                    </h4>
                                    {loadingStudents ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="h-5 w-5 animate-spin text-signal" />
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {students.map(student => (
                                                <div key={student.studentId} className="flex items-center justify-between bg-white/5 rounded-xl p-2.5 border border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3.5 w-3.5 text-mist" />
                                                        <span className="text-sm font-bold text-snow">{student.studentName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {selectedLesson.status === 'SCHEDULED' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleMarkAttendance(student.studentId, 'ATTENDED')}
                                                                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${student.status === 'ATTENDED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-mist hover:bg-white/5'}`}
                                                                >
                                                                    Présent
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMarkAttendance(student.studentId, 'ABSENT')}
                                                                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${student.status === 'ABSENT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-mist hover:bg-white/5'}`}
                                                                >
                                                                    Absent
                                                                </button>
                                                            </>
                                                        )}
                                                        {selectedLesson.status !== 'SCHEDULED' && (
                                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${student.status === 'ATTENDED' ? 'bg-emerald-500/20 text-emerald-400' : student.status === 'ABSENT' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-mist'}`}>
                                                                {student.status === 'ATTENDED' ? 'Présent' : student.status === 'ABSENT' ? 'Absent' : student.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            {selectedLesson.status === 'SCHEDULED' && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                    <Button
                                        onClick={handleOpenEdit}
                                        variant="ghost"
                                        className="flex-1 text-signal hover:bg-signal/10 font-bold uppercase text-xs"
                                    >
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Modifier
                                    </Button>
                                    <Button
                                        onClick={handleCompleteLesson}
                                        disabled={isSubmitting}
                                        variant="ghost"
                                        className="flex-1 text-emerald-400 hover:bg-emerald-400/10 font-bold uppercase text-xs"
                                    >
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-2" />Terminer</>}
                                    </Button>
                                    <Button
                                        onClick={handleCancelLesson}
                                        disabled={isSubmitting}
                                        variant="ghost"
                                        className="text-red-400 hover:bg-red-400/10 font-bold uppercase text-xs"
                                    >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Annuler
                                    </Button>
                                    {selectedLesson.enrolledCount === 0 && (
                                        <Button
                                            onClick={handleDeleteLesson}
                                            disabled={isSubmitting}
                                            variant="ghost"
                                            className="text-red-400 hover:bg-red-400/10 font-bold uppercase text-xs"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Supprimer
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </Modal>

            {/* Create/Edit Lesson Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => { setIsCreateModalOpen(false); setIsEditMode(false); }}
                title={isEditMode ? "Modifier le cours" : "Planifier un cours"}
            >
                <form onSubmit={handleSubmitForm} className="space-y-5">
                    {/* Type de cours */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Type de cours *</Label>
                        <div className="flex gap-2">
                            {Object.entries(LESSON_TYPE_CONFIG).map(([key, cfg]) => {
                                const Icon = cfg.icon;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setFormState({ ...formState, lessonType: key })}
                                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-black uppercase ${formState.lessonType === key
                                            ? `${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`
                                            : 'bg-white/5 border-white/10 text-mist hover:bg-white/10'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Thématique *</Label>
                        <Input
                            placeholder="Ex: Signalisation, Priorités, Créneau..."
                            value={formState.topic}
                            onChange={(e) => setFormState({ ...formState, topic: e.target.value })}
                            className="bg-white/5 border-white/10"
                            required
                        />
                    </div>

                    {/* Module */}
                    {modules.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Module du programme</Label>
                            <select
                                value={formState.moduleId}
                                onChange={(e) => setFormState({ ...formState, moduleId: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-snow outline-none focus:border-signal/50"
                            >
                                <option value="" className="bg-asphalt">Aucun module</option>
                                {modules
                                    .filter(m => m.category === formState.lessonType)
                                    .map(m => (
                                        <option key={m.id} value={m.id} className="bg-asphalt">
                                            {m.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Description / Notes</Label>
                        <textarea
                            placeholder="Notes pour les élèves ou le moniteur..."
                            value={formState.description}
                            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-snow outline-none focus:border-signal/50 min-h-[80px] resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Moniteur (Animateur)</Label>
                        <select
                            value={formState.monitorId}
                            onChange={(e) => setFormState({ ...formState, monitorId: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-snow outline-none focus:border-signal/50"
                        >
                            <option value="" className="bg-asphalt">Non assigné</option>
                            {monitors.filter(m => m.status === 'ACTIVE').map(m => (
                                <option key={m.id} value={m.id} className="bg-asphalt">
                                    {m.firstName} {m.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Horaires flexibles */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Heure de début</Label>
                            <Input
                                type="time"
                                value={formState.startTime}
                                onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
                                className="bg-white/5 border-white/10"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Heure de fin</Label>
                            <Input
                                type="time"
                                value={formState.endTime}
                                onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
                                className="bg-white/5 border-white/10"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Salle / Lieu</Label>
                            <Input
                                placeholder="Salle 1"
                                value={formState.roomId}
                                onChange={(e) => setFormState({ ...formState, roomId: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist ml-1">Capacité</Label>
                            <Input
                                type="number"
                                value={formState.capacity}
                                onChange={(e) => setFormState({ ...formState, capacity: parseInt(e.target.value) || 1 })}
                                className="bg-white/5 border-white/10"
                                min={1}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="ghost" onClick={() => { setIsCreateModalOpen(false); setIsEditMode(false); }} className="flex-1">Annuler</Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-signal text-asphalt font-black uppercase tracking-widest text-xs py-6">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditMode ? "Enregistrer" : "Créer le cours"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
