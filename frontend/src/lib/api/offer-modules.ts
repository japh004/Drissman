import api from './client';
import type { OfferModule, SetOfferModulesPayload } from '@/types/offer-module';

export const offerModuleService = {
    async getModulesForOffer(offerId: string): Promise<OfferModule[]> {
        const { data, error } = await api.get<OfferModule[]>(`/offers/${offerId}/modules`);
        if (error) throw new Error(error);
        return data || [];
    },

    async setModulesForOffer(offerId: string, payload: SetOfferModulesPayload): Promise<OfferModule[]> {
        const { data, error } = await api.put<OfferModule[]>(`/offers/${offerId}/modules`, payload);
        if (error) throw new Error(error);
        return data || [];
    },

    async removeModuleFromOffer(offerId: string, moduleId: string): Promise<void> {
        const { error } = await api.delete(`/offers/${offerId}/modules/${moduleId}`);
        if (error) throw new Error(error);
    }
};
