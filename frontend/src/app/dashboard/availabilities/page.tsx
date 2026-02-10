"use client";
// Force fresh build to pick up TypeScript fixes

import { useState } from "react";
import { useAvailabilities } from "@/hooks";
import { useAuth } from "@/hooks/useAuth";
import { DAYS_OF_WEEK, Availability } from "@/lib/api";
import {
    Clock,
    Plus,
    Loader2,
    Edit2,
    Trash2,
    AlertCircle,
    Check,
    Users
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";

interface AvailabilityFormData {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    maxBookings: string;
}

const initialFormData: AvailabilityFormData = {
    dayOfWeek: "1",
    startTime: "08:00",
    endTime: "17:00",
    maxBookings: "4"
};

export default function AvailabilitiesPage() {
    const { user } = useAuth();
    const schoolId = user?.schoolId;

    const {
        availabilities,
        groupedByDay,
        loading,
        error,
        refetch,
        createAvailability,
        updateAvailability,
        deleteAvailability
    } = useAvailabilities(schoolId || "");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<AvailabilityFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleOpenCreate = (dayOfWeek?: number) => {
        setEditingId(null);
        setFormData({
            ...initialFormData,
            dayOfWeek: dayOfWeek?.toString() || "1"
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (availability: Availability) => {
        setEditingId(availability.id);
        setFormData({
            dayOfWeek: availability.dayOfWeek.toString(),
            startTime: availability.startTime,
            endTime: availability.endTime,
            maxBookings: (availability.maxBookings || 4).toString()
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.startTime || !formData.endTime) {
            toast.error("Veuillez sélectionner les horaires");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                schoolId: schoolId || "",
                dayOfWeek: parseInt(formData.dayOfWeek),
                startTime: formData.startTime,
                endTime: formData.endTime,
                maxBookings: parseInt(formData.maxBookings)
            };

            if (editingId) {
                await updateAvailability(editingId, payload);
                toast.success("Disponibilité mise à jour !");
            } else {
                await createAvailability(payload);
                toast.success("Disponibilité ajoutée !");
            }
            setIsModalOpen(false);
            setFormData(initialFormData);
        } catch (err) {
            console.error("Failed to save availability:", err);
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce créneau ?")) return;

        setDeletingId(id);
        try {
            await deleteAvailability(id);
            toast.success("Créneau supprimé");
        } catch (err) {
            console.error("Failed to delete availability:", err);
            toast.error("Erreur lors de la suppression");
        } finally {
            setDeletingId(null);
        }
    };

    const getDayName = (dayOfWeek: number) => {
        return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || `Jour ${dayOfWeek}`;
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-signal animate-spin mx-auto mb-4" />
                    <p className="text-mist">Chargement des disponibilités...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-snow mb-2">Erreur de chargement</h3>
                    <p className="text-mist mb-4">{error}</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-snow font-medium transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-snow mb-2">Disponibilités</h1>
                    <p className="text-mist">Définissez vos créneaux horaires pour les réservations.</p>
                </div>
                <Button onClick={() => handleOpenCreate()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter un créneau
                </Button>
            </div>

            {/* Weekly View */}
            <div className="grid gap-4 lg:grid-cols-2">
                {DAYS_OF_WEEK.filter(day => day.value !== 0).map((day) => {
                    const daySlots = groupedByDay[day.value] || [];

                    return (
                        <div
                            key={day.value}
                            className="bg-white/5 border border-white/10 rounded-xl p-5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-snow text-lg">{day.label}</h3>
                                <button
                                    onClick={() => handleOpenCreate(day.value)}
                                    className="p-2 text-mist hover:text-signal hover:bg-white/5 rounded-lg transition-colors"
                                    title="Ajouter un créneau"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {daySlots.length === 0 ? (
                                <p className="text-sm text-mist/60 italic">Aucun créneau défini</p>
                            ) : (
                                <div className="space-y-2">
                                    {daySlots.map((slot: Availability) => (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-4 w-4 text-signal" />
                                                <span className="font-medium text-snow">
                                                    {slot.startTime} - {slot.endTime}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-mist bg-white/5 px-2 py-1 rounded">
                                                    <Users className="h-3 w-3" />
                                                    {slot.maxBookings} max
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleOpenEdit(slot)}
                                                    className="p-1.5 text-mist hover:text-signal hover:bg-white/5 rounded transition-colors"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(slot.id)}
                                                    disabled={deletingId === slot.id}
                                                    className="p-1.5 text-mist hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                                                >
                                                    {deletingId === slot.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Sunday (optional) */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 opacity-60">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-snow text-lg">Dimanche</h3>
                    <span className="text-xs text-mist bg-white/10 px-2 py-1 rounded">Fermé</span>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Modifier le créneau" : "Nouveau créneau"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="dayOfWeek">Jour de la semaine</Label>
                        <select
                            id="dayOfWeek"
                            value={formData.dayOfWeek}
                            onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {DAYS_OF_WEEK.filter(d => d.value !== 0).map((day) => (
                                <option key={day.value} value={day.value}>
                                    {day.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="startTime">Heure de début</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="endTime">Heure de fin</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="maxBookings">Réservations max. par créneau</Label>
                        <Input
                            id="maxBookings"
                            type="number"
                            min="1"
                            max="20"
                            value={formData.maxBookings}
                            onChange={(e) => setFormData({ ...formData, maxBookings: e.target.value })}
                            required
                        />
                        <p className="text-xs text-gray-500">Nombre maximum d&apos;élèves pouvant réserver ce créneau</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            {editingId ? "Enregistrer" : "Créer"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
