export interface Availability {
    id: string;
    schoolId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    maxBookings?: number;
}

export interface CreateAvailabilityPayload {
    schoolId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    maxBookings?: number;
}
