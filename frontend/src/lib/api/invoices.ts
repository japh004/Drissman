import api from './client';
import type { Invoice } from '@/types/booking';

// Invoices Service
export const invoicesService = {
    async getMyInvoices(): Promise<Invoice[]> {
        const { data, error } = await api.get<Invoice[]>('/invoices/my');
        if (error) throw new Error(error);
        return data || [];
    },

    async getBySchool(schoolId: string): Promise<Invoice[]> {
        const { data, error } = await api.get<Invoice[]>(`/invoices/school/${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    },

    async getById(id: string): Promise<Invoice> {
        const { data, error } = await api.get<Invoice>(`/invoices/${id}`);
        if (error) throw new Error(error);
        return data!;
    },

    async pay(id: string, method: Invoice['paymentMethod'], reference: string): Promise<Invoice> {
        const { data, error } = await api.post<Invoice>(
            `/invoices/${id}/pay?method=${method}&reference=${reference}`
        );
        if (error) throw new Error(error);
        return data!;
    }
};
