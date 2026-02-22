'use client';

import { useState, useEffect, useCallback } from 'react';
import { reviewsService, Review, CreateReviewPayload } from '@/lib/api';

export function useReviews(schoolId: string) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await reviewsService.getBySchool(schoolId);
            setReviews(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        if (schoolId) {
            fetchReviews();
        }
    }, [fetchReviews, schoolId]);

    const createReview = useCallback(async (payload: CreateReviewPayload, userId: string) => {
        const newReview = await reviewsService.create(payload);
        setReviews(prev => [newReview, ...prev]);
        return newReview;
    }, []);

    const deleteReview = useCallback(async (id: string) => {
        await reviewsService.delete(id);
        setReviews(prev => prev.filter(r => r.id !== id));
    }, []);

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    return {
        reviews,
        loading,
        error,
        refetch: fetchReviews,
        createReview,
        deleteReview,
        averageRating,
        reviewCount: reviews.length
    };
}
