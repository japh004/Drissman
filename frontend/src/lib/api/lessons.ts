import api from './client';
import type { Lesson, CreateLessonPayload, StudentRegistration } from '@/types/lesson';

export const lessonService = {
    async getLessons(): Promise<Lesson[]> {
        const { data, error } = await api.get<Lesson[]>('/lessons');
        if (error) throw new Error(error);
        return data || [];
    },

    async createLesson(payload: CreateLessonPayload): Promise<Lesson> {
        const { data, error } = await api.post<Lesson>('/lessons', payload);
        if (error) throw new Error(error);
        return data!;
    },

    async updateLesson(lessonId: string, payload: CreateLessonPayload): Promise<Lesson> {
        const { data, error } = await api.put<Lesson>(`/lessons/${lessonId}`, payload);
        if (error) throw new Error(error);
        return data!;
    },

    async cancelLesson(lessonId: string): Promise<Lesson> {
        const { data, error } = await api.patch<Lesson>(`/lessons/${lessonId}/cancel`, {});
        if (error) throw new Error(error);
        return data!;
    },

    async completeLesson(lessonId: string): Promise<Lesson> {
        const { data, error } = await api.patch<Lesson>(`/lessons/${lessonId}/complete`, {});
        if (error) throw new Error(error);
        return data!;
    },

    async deleteLesson(lessonId: string): Promise<void> {
        const { error } = await api.delete(`/lessons/${lessonId}`);
        if (error) throw new Error(error);
    },

    async getStudents(lessonId: string): Promise<StudentRegistration[]> {
        const { data, error } = await api.get<StudentRegistration[]>(`/lessons/${lessonId}/students`);
        if (error) throw new Error(error);
        return data || [];
    },

    async markAttendance(lessonId: string, studentId: string, status: string, notes?: string): Promise<void> {
        const { error } = await api.patch(`/lessons/${lessonId}/attendance/${studentId}`, { status, notes });
        if (error) throw new Error(error);
    },

    async registerStudent(lessonId: string): Promise<void> {
        const { error } = await api.post(`/lessons/${lessonId}/register`, {});
        if (error) throw new Error(error);
    },

    async unregisterStudent(lessonId: string, studentId: string): Promise<void> {
        const { error } = await api.delete(`/lessons/${lessonId}/registrations/${studentId}`);
        if (error) throw new Error(error);
    }
};
