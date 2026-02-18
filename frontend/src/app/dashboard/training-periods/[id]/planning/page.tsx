"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useOfferModules } from "@/hooks";
import { trainingPeriodService, type TrainingPeriod } from "@/lib/api/training-periods";
import { lessonService } from "@/lib/api/lessons";
import { moduleService } from "@/lib/api/modules";
import type { Lesson, CreateLessonPayload } from "@/types/lesson";
import type { Module } from "@/types/module";
import {
    ArrowLeft, Plus, Calendar, Clock, Users, BookOpen,
    GraduationCap, UserCheck, Trash2, Edit2, CheckCircle2, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";

interface Monitor {
    id: string;
    firstName: string;
    lastName: string;
    status: string;
}

export default function PeriodPlanningPage() {
    const params = useParams();
    const router = useRouter();
    const periodId = params.id as string;
    const { user } = useAuth();

    const [period, setPeriod] = useState<TrainingPeriod | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [allModules, setAllModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    const { modules: offerModules } = useOfferModules(period?.offerId);

    const [formData, setFormData] = useState<CreateLessonPayload>({
        date: "",
        startTime: "08:00",
        endTime: "10:00",
        topic: "",
        lessonType: "CODE",
        moduleId: "",
        monitorId: "",
        description: "",
        roomId: "",
        capacity: 30,
        trainingPeriodId: periodId,
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [periodData, lessonsData, modulesData] = await Promise.all([
                trainingPeriodService.getById(periodId),
                lessonService.getLessonsByPeriod(periodId),
                moduleService.getModules(),
            ]);
            setPeriod(periodData);
            setLessons(lessonsData);
            setAllModules(modulesData);

            // Fetch monitors
            const { data: monitorsData } = await (await import("@/lib/api/client")).default.get<Monitor[]>("/monitors/me");
            if (monitorsData && Array.isArray(monitorsData)) {
                setMonitors(monitorsData);
            }
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    }, [periodId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await lessonService.createLesson({
                ...formData,
                trainingPeriodId: periodId,
            });
            toast.success("Cours créé avec succès");
            setShowCreateModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            toast.error("Erreur lors de la création du cours");
        }
    };

    const handleUpdateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLesson) return;
        try {
            await lessonService.updateLesson(editingLesson.id, {
                ...formData,
                trainingPeriodId: periodId,
            });
            toast.success("Cours modifié avec succès");
            setEditingLesson(null);
            resetForm();
            fetchData();
        } catch (err) {
            toast.error("Erreur lors de la modification du cours");
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        try {
            await lessonService.deleteLesson(lessonId);
            toast.success("Cours supprimé");
            fetchData();
        } catch (err) {
            toast.error("Impossible de supprimer ce cours");
        }
    };

    const handleCancelLesson = async (lessonId: string) => {
        try {
            await lessonService.cancelLesson(lessonId);
            toast.success("Cours annulé");
            fetchData();
        } catch (err) {
            toast.error("Erreur lors de l'annulation");
        }
    };

    const resetForm = () => {
        setFormData({
            date: "",
            startTime: "08:00",
            endTime: "10:00",
            topic: "",
            lessonType: "CODE",
            moduleId: "",
            monitorId: "",
            description: "",
            roomId: "",
            capacity: 30,
            trainingPeriodId: periodId,
        });
    };

    const openEditModal = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setFormData({
            date: lesson.date,
            startTime: lesson.startTime?.substring(0, 5) || "08:00",
            endTime: lesson.endTime?.substring(0, 5) || "10:00",
            topic: lesson.topic,
            lessonType: lesson.lessonType || "CODE",
            moduleId: lesson.moduleId || "",
            monitorId: lesson.monitorId || "",
            description: lesson.description || "",
            roomId: lesson.roomId || "",
            capacity: lesson.capacity || 30,
            trainingPeriodId: periodId,
        });
    };

    // Group lessons by date
    const lessonsByDate = lessons.reduce<Record<string, Lesson[]>>((acc, lesson) => {
        const date = lesson.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(lesson);
        return acc;
    }, {});

    const sortedDates = Object.keys(lessonsByDate).sort();

    // Choose which modules to show: offer-specific modules first, fallback to all
    const availableModules = offerModules.length > 0
        ? allModules.filter(m => offerModules.some(om => om.moduleId === m.id))
        : allModules;

    const statusBadge = (status: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            SCHEDULED: { label: "Planifié", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
            COMPLETED: { label: "Terminé", cls: "bg-signal/10 text-signal border-signal/20" },
            CANCELLED: { label: "Annulé", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
        };
        const s = map[status] || { label: status, cls: "bg-white/5 text-mist border-white/10" };
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>{s.label}</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-signal/30 border-t-signal" />
            </div>
        );
    }

    if (!period) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-mist">Période introuvable</p>
                <button onClick={() => router.back()} className="text-signal hover:underline">
                    ← Retour
                </button>
            </div>
        );
    }

    const LessonFormFields = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Date</Label>
                    <Input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        min={period.startDate}
                        max={period.endDate}
                        required
                    />
                </div>
                <div>
                    <Label>Type</Label>
                    <select
                        className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-snow text-sm"
                        value={formData.lessonType}
                        onChange={e => setFormData({ ...formData, lessonType: e.target.value })}
                    >
                        <option value="CODE">Code</option>
                        <option value="CONDUITE">Conduite</option>
                        <option value="EXAMEN_BLANC">Examen Blanc</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Début</Label>
                    <Input
                        type="time"
                        value={formData.startTime}
                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Label>Fin</Label>
                    <Input
                        type="time"
                        value={formData.endTime}
                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div>
                <Label>Sujet</Label>
                <Input
                    value={formData.topic}
                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="Ex: Introduction au code de la route"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Module</Label>
                    <select
                        className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-snow text-sm"
                        value={formData.moduleId}
                        onChange={e => setFormData({ ...formData, moduleId: e.target.value })}
                    >
                        <option value="">Aucun module</option>
                        {availableModules.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label>Moniteur</Label>
                    <select
                        className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-snow text-sm"
                        value={formData.monitorId}
                        onChange={e => setFormData({ ...formData, monitorId: e.target.value })}
                    >
                        <option value="">Non assigné</option>
                        {monitors.map(m => (
                            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Salle</Label>
                    <Input
                        value={formData.roomId || ""}
                        onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                        placeholder="Ex: Salle A"
                    />
                </div>
                <div>
                    <Label>Capacité</Label>
                    <Input
                        type="number"
                        value={formData.capacity}
                        onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                        min={1}
                    />
                </div>
            </div>

            <div>
                <Label>Description (optionnel)</Label>
                <textarea
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-snow text-sm min-h-[80px] resize-none"
                    value={formData.description || ""}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Notes supplémentaires..."
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push("/dashboard/training-periods")}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-mist hover:text-snow"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-snow">{period.name}</h1>
                    <p className="text-sm text-mist mt-1">
                        {new Date(period.startDate).toLocaleDateString("fr-FR")} — {new Date(period.endDate).toLocaleDateString("fr-FR")}
                        {period.offerName && <span className="ml-2 text-signal">• {period.offerName}</span>}
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreateModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-signal text-asphalt font-bold text-sm hover:bg-signal/90 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Ajouter un cours
                </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { icon: Calendar, label: "Jours planifiés", value: sortedDates.length },
                    { icon: BookOpen, label: "Total cours", value: lessons.length },
                    { icon: UserCheck, label: "Avec moniteur", value: lessons.filter(l => l.monitorId).length },
                    { icon: Users, label: "Capacité max", value: period.maxStudents },
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-signal/10">
                            <Icon className="h-5 w-5 text-signal" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-snow">{value}</p>
                            <p className="text-xs text-mist">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Offer Modules info */}
            {offerModules.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-mist mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-signal" />
                        Modules de la formation
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {offerModules.map(om => {
                            const lessonCount = lessons.filter(l => l.moduleId === om.moduleId).length;
                            return (
                                <div key={om.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                                    <span className="text-sm text-snow">{om.moduleName}</span>
                                    <span className="text-xs text-mist bg-white/5 px-1.5 py-0.5 rounded-full">
                                        {lessonCount} cours
                                    </span>
                                    {om.moduleRequiredHours && (
                                        <span className="text-xs text-signal/70">
                                            ({om.moduleRequiredHours}h req.)
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Timeline / Course list by date */}
            {sortedDates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Calendar className="h-12 w-12 text-mist/30 mb-4" />
                    <h3 className="text-lg font-semibold text-snow mb-2">Aucun cours planifié</h3>
                    <p className="text-sm text-mist mb-6">
                        Commencez par ajouter des cours à cette période de formation.
                    </p>
                    <button
                        onClick={() => { resetForm(); setShowCreateModal(true); }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-signal text-asphalt font-bold text-sm hover:bg-signal/90 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Créer le premier cours
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {sortedDates.map(date => (
                        <div key={date}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-px flex-1 bg-white/10" />
                                <span className="text-sm font-semibold text-mist bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                    {new Date(date).toLocaleDateString("fr-FR", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long"
                                    })}
                                </span>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>
                            <div className="grid gap-3">
                                {lessonsByDate[date]
                                    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
                                    .map(lesson => (
                                        <div
                                            key={lesson.id}
                                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4 group hover:border-signal/20 transition-all"
                                        >
                                            {/* Time */}
                                            <div className="text-center min-w-[80px]">
                                                <p className="text-lg font-bold text-snow">
                                                    {lesson.startTime?.substring(0, 5)}
                                                </p>
                                                <p className="text-xs text-mist">
                                                    {lesson.endTime?.substring(0, 5)}
                                                </p>
                                            </div>

                                            <div className="h-10 w-px bg-white/10" />

                                            {/* Type badge */}
                                            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${lesson.lessonType === "CONDUITE"
                                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                    : lesson.lessonType === "EXAMEN_BLANC"
                                                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                {lesson.lessonType === "CONDUITE" ? "🚗" : lesson.lessonType === "EXAMEN_BLANC" ? "📝" : "📖"}
                                                {" "}
                                                {lesson.lessonType}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-snow truncate">{lesson.topic}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {lesson.moduleName && (
                                                        <span className="text-xs text-signal/70">{lesson.moduleName}</span>
                                                    )}
                                                    {lesson.monitorName && (
                                                        <span className="text-xs text-mist flex items-center gap-1">
                                                            <UserCheck className="h-3 w-3" />
                                                            {lesson.monitorName}
                                                        </span>
                                                    )}
                                                    {lesson.roomId && (
                                                        <span className="text-xs text-mist">📍 {lesson.roomId}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Enrolled / Status */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-mist">
                                                    {lesson.enrolledCount}/{lesson.capacity}
                                                </span>
                                                {statusBadge(lesson.status)}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(lesson)}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-mist hover:text-snow transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                {lesson.status === "SCHEDULED" && (
                                                    <button
                                                        onClick={() => handleCancelLesson(lesson.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-mist hover:text-red-400 transition-colors"
                                                        title="Annuler"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteLesson(lesson.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-mist hover:text-red-400 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Ajouter un cours"
            >
                <form onSubmit={handleCreateLesson} className="space-y-4">
                    <LessonFormFields />
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-mist hover:text-snow transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-signal text-asphalt font-bold hover:bg-signal/90 transition-all"
                        >
                            Créer le cours
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingLesson}
                onClose={() => { setEditingLesson(null); resetForm(); }}
                title="Modifier le cours"
            >
                <form onSubmit={handleUpdateLesson} className="space-y-4">
                    <LessonFormFields />
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setEditingLesson(null); resetForm(); }}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-mist hover:text-snow transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-signal text-asphalt font-bold hover:bg-signal/90 transition-all"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
