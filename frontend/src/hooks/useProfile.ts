import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    schoolId?: string;
}

interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    email?: string;
}

interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export function useProfile(userId?: string) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: apiError } = await api.get<UserProfile>(`/users/${userId}`);
            if (apiError) throw new Error(apiError);
            setProfile(data || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de chargement du profil');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfile = useCallback(async (data: UpdateProfileData) => {
        if (!userId) throw new Error('Utilisateur non connecté');

        const { data: updated, error: apiError } = await api.put<UserProfile>(`/users/${userId}`, data);
        if (apiError) throw new Error(apiError);

        setProfile(updated || null);
        return updated;
    }, [userId]);

    const changePassword = useCallback(async (data: ChangePasswordData) => {
        if (!userId) throw new Error('Utilisateur non connecté');

        const { error: apiError } = await api.put(`/users/${userId}/password`, data);
        if (apiError) throw new Error(apiError);
    }, [userId]);

    return {
        profile,
        loading,
        error,
        refetch: fetchProfile,
        updateProfile,
        changePassword
    };
}
