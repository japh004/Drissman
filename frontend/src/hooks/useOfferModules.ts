'use client';

import { useState, useEffect, useCallback } from 'react';
import { offerModuleService } from '@/lib/api/offer-modules';
import type { OfferModule, SetOfferModulesPayload } from '@/types/offer-module';

export function useOfferModules(offerId?: string) {
    const [modules, setModules] = useState<OfferModule[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchModules = useCallback(async () => {
        if (!offerId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await offerModuleService.getModulesForOffer(offerId);
            setModules(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    }, [offerId]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    const setOfferModules = useCallback(async (payload: SetOfferModulesPayload) => {
        if (!offerId) return;
        setLoading(true);
        try {
            const data = await offerModuleService.setModulesForOffer(offerId, payload);
            setModules(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [offerId]);

    const removeModule = useCallback(async (moduleId: string) => {
        if (!offerId) return;
        try {
            await offerModuleService.removeModuleFromOffer(offerId, moduleId);
            setModules(prev => prev.filter(m => m.moduleId !== moduleId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            throw err;
        }
    }, [offerId]);

    return {
        modules,
        loading,
        error,
        refetch: fetchModules,
        setOfferModules,
        removeModule
    };
}
