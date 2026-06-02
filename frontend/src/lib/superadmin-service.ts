import { apiClient } from "@/lib/api-client";

export interface School {
    id: string;
    name: string;
    address?: string;
    city?: string;
    description?: string;
    isVerified: boolean;
}

export interface GlobalStatsDto {
    totalUsers: number;
    totalSchools: number;
    pendingSchools: number;
}

export const superAdminService = {
    getStats: (token: string) =>
        apiClient.get<GlobalStatsDto>("/superadmin/stats", token),

    getPendingSchools: (token: string) =>
        apiClient.get<School[]>("/superadmin/schools/pending", token),

    validateSchool: (id: string, token: string) =>
        apiClient.put<School>(`/superadmin/schools/${id}/validate`, undefined, token),
};
