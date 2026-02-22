import api from './client';
import type { Module, CreateModulePayload } from '@/types/module';

export const moduleService = {
    async getModules(): Promise<Module[]> {
        const { data, error } = await api.get<Module[]>('/modules');
        if (error) throw new Error(error);
        return data || [];
    },

    async createModule(payload: CreateModulePayload): Promise<Module> {
        const { data, error } = await api.post<Module>('/modules', payload);
        if (error) throw new Error(error);
        return data!;
    },

    async updateModule(moduleId: string, payload: CreateModulePayload): Promise<Module> {
        const { data, error } = await api.put<Module>(`/modules/${moduleId}`, payload);
        if (error) throw new Error(error);
        return data!;
    },

    async deleteModule(moduleId: string): Promise<void> {
        const { error } = await api.delete(`/modules/${moduleId}`);
        if (error) throw new Error(error);
    }
};
