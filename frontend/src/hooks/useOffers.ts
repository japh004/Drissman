'use client';

import { useState, useEffect, useCallback } from 'react';
import { offersService, Offer } from '@/lib/api';

interface CreateOfferPayload {
    schoolId: string;
    name: string;
    description?: string;
    price: number;
    hours: number;
    permitType?: string;
}

export function useOffers(schoolId?: string) {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOffers = useCallback(async () => {
        if (!schoolId) {
            setOffers([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await offersService.getBySchool(schoolId);
            setOffers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const createOffer = useCallback(async (payload: CreateOfferPayload) => {
        const newOffer = await offersService.create(payload);
        setOffers(prev => [...prev, newOffer]);
        return newOffer;
    }, []);

    const updateOffer = useCallback(async (id: string, payload: Partial<Offer>) => {
        const updated = await offersService.update(id, payload);
        setOffers(prev => prev.map(o => o.id === id ? updated : o));
        return updated;
    }, []);

    const deleteOffer = useCallback(async (id: string) => {
        await offersService.delete(id);
        setOffers(prev => prev.filter(o => o.id !== id));
    }, []);

    return {
        offers,
        loading,
        error,
        refetch: fetchOffers,
        createOffer,
        updateOffer,
        deleteOffer
    };
}
