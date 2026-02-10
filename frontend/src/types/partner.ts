export interface PartnerStats {
    revenue: string;
    enrollments: number;
    successRate: string;
    upcomingLessons: number;
    revenueGrowth: number;
    enrollmentGrowth: number;
}

export interface UpdateSchoolRequest {
    name?: string;
    description?: string;
    imageUrl?: string;
}
