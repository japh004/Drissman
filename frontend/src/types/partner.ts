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

export type MonitorStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export interface Monitor {
    id: string;
    schoolId: string;
    firstName: string;
    lastName: string;
    email?: string;
    licenseNumber: string;
    phoneNumber?: string;
    status: MonitorStatus;
    createdAt: string;
}

export interface CreateMonitorRequest {
    schoolId: string;
    firstName: string;
    lastName: string;
    email: string;
    licenseNumber: string;
    phoneNumber?: string;
    status?: MonitorStatus;
}

export type SessionStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Session {
    id: string;
    enrollmentId: string;
    monitorId?: string;
    studentName?: string;
    monitorName?: string;
    offerName?: string;
    date: string;
    startTime: string;
    endTime: string;
    status: SessionStatus;
    meetingPoint?: string;
}

export interface CreateSessionRequest {
    enrollmentId: string;
    monitorId?: string;
    date: string;
    startTime: string;
    endTime: string;
    meetingPoint?: string;
    status?: SessionStatus;
}

export interface Enrollment {
    id: string;
    userId: string;
    schoolId: string;
    offerId: string;
    userName?: string;
    userEmail?: string;
    offerName?: string;
    offerPrice?: number;
    hoursPurchased: number;
    hoursConsumed: number;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PENDING' | 'SUSPENDED';
    createdAt?: string;
}
