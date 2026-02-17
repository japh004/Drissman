import api from './client';

export interface TrainingPeriod {
    id: string;
    schoolId: string;
    offerId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    maxStudents: number;
    status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    enrollmentDeadline?: string;
    scheduleDescription?: string;
    createdAt?: string;
    // Enriched fields
    offerName?: string;
    schoolName?: string;
    enrolledCount?: number;
    remainingSpots?: number;
    offerPrice?: number;
    permitType?: string;
}

export interface CreateTrainingPeriodPayload {
    offerId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    maxStudents?: number;
    enrollmentDeadline?: string;
    scheduleDescription?: string;
}

export const trainingPeriodService = {
    // Get training periods for current admin's school
    async getMySchoolPeriods(): Promise<TrainingPeriod[]> {
        const { data, error } = await api.get<TrainingPeriod[]>('/training-periods/school');
        if (error) throw new Error(error);
        return data || [];
    },

    // Get training periods for a specific school (admin)
    async getBySchool(schoolId: string): Promise<TrainingPeriod[]> {
        const { data, error } = await api.get<TrainingPeriod[]>(`/training-periods/school/${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    },

    // Get all published periods (student-facing)
    async getPublished(): Promise<TrainingPeriod[]> {
        const { data, error } = await api.get<TrainingPeriod[]>('/training-periods/published');
        if (error) throw new Error(error);
        return data || [];
    },

    // Get published periods for a specific school
    async getPublishedBySchool(schoolId: string): Promise<TrainingPeriod[]> {
        const { data, error } = await api.get<TrainingPeriod[]>(`/training-periods/published/${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    },

    // Get a single period by ID
    async getById(id: string): Promise<TrainingPeriod> {
        const { data, error } = await api.get<TrainingPeriod>(`/training-periods/${id}`);
        if (error) throw new Error(error);
        return data!;
    },

    // Create a new training period (admin)
    async create(payload: CreateTrainingPeriodPayload): Promise<TrainingPeriod> {
        const { data, error } = await api.post<TrainingPeriod>('/training-periods', payload);
        if (error) throw new Error(error);
        return data!;
    },

    // Update a DRAFT period
    async update(id: string, payload: Partial<CreateTrainingPeriodPayload>): Promise<TrainingPeriod> {
        const { data, error } = await api.put<TrainingPeriod>(`/training-periods/${id}`, payload);
        if (error) throw new Error(error);
        return data!;
    },

    // Publish a DRAFT period
    async publish(id: string): Promise<TrainingPeriod> {
        const { data, error } = await api.patch<TrainingPeriod>(`/training-periods/${id}/publish`);
        if (error) throw new Error(error);
        return data!;
    },

    // Start a PUBLISHED period
    async start(id: string): Promise<TrainingPeriod> {
        const { data, error } = await api.patch<TrainingPeriod>(`/training-periods/${id}/start`);
        if (error) throw new Error(error);
        return data!;
    },

    // Complete an IN_PROGRESS period
    async complete(id: string): Promise<TrainingPeriod> {
        const { data, error } = await api.patch<TrainingPeriod>(`/training-periods/${id}/complete`);
        if (error) throw new Error(error);
        return data!;
    },

    // Cancel a non-completed period
    async cancel(id: string): Promise<TrainingPeriod> {
        const { data, error } = await api.patch<TrainingPeriod>(`/training-periods/${id}/cancel`);
        if (error) throw new Error(error);
        return data!;
    },
};
