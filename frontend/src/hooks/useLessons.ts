import { useState, useCallback, useEffect } from "react";
import { lessonService } from "@/lib/api";
import { Lesson, CreateLessonPayload } from "@/types/lesson";
import { toast } from "sonner";

export function useLessons(schoolId?: string) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLessons = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const data = await lessonService.getLessons();
            setLessons(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erreur lors du chargement des cours");
            toast.error("Impossible de charger le planning");
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchLessons();
    }, [fetchLessons]);

    const createLesson = async (payload: CreateLessonPayload) => {
        try {
            await lessonService.createLesson(payload);
            await fetchLessons();
            toast.success("Cours créé avec succès");
            return true;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création du cours");
            return false;
        }
    };

    const updateLesson = async (lessonId: string, payload: CreateLessonPayload) => {
        try {
            await lessonService.updateLesson(lessonId, payload);
            await fetchLessons();
            toast.success("Cours modifié avec succès");
            return true;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la modification du cours");
            return false;
        }
    };

    const cancelLesson = async (lessonId: string) => {
        try {
            await lessonService.cancelLesson(lessonId);
            await fetchLessons();
            toast.success("Cours annulé");
            return true;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'annulation du cours");
            return false;
        }
    };

    const completeLesson = async (lessonId: string) => {
        try {
            await lessonService.completeLesson(lessonId);
            await fetchLessons();
            toast.success("Cours marqué comme terminé");
            return true;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la complétion du cours");
            return false;
        }
    };

    const deleteLesson = async (lessonId: string) => {
        try {
            await lessonService.deleteLesson(lessonId);
            await fetchLessons();
            toast.success("Cours supprimé");
            return true;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la suppression");
            return false;
        }
    };

    const registerStudent = async (lessonId: string) => {
        try {
            await lessonService.registerStudent(lessonId);
            await fetchLessons();
            toast.success("Inscription validée");
            return true;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'inscription");
            return false;
        }
    };

    return {
        lessons,
        loading,
        error,
        refetch: fetchLessons,
        createLesson,
        updateLesson,
        cancelLesson,
        completeLesson,
        deleteLesson,
        registerStudent
    };
}
