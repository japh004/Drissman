export interface Lesson {
    id: string;
    monitorId?: string;
    monitorName?: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm:ss
    endTime: string; // HH:mm:ss
    topic: string;
    lessonType: 'CODE' | 'CONDUITE' | 'EXAMEN_BLANC';
    moduleId?: string;
    moduleName?: string;
    description?: string;
    roomId?: string;
    capacity: number;
    enrolledCount: number;
    status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
    registeredStudents?: StudentRegistration[];
}

export interface StudentRegistration {
    studentId: string;
    studentName: string;
    status: 'REGISTERED' | 'ATTENDED' | 'ABSENT' | 'CANCELLED';
    notes?: string;
}

export interface CreateLessonPayload {
    monitorId?: string;
    date: string;
    startTime: string;
    endTime: string;
    topic: string;
    lessonType?: string;
    moduleId?: string;
    description?: string;
    roomId?: string;
    capacity?: number;
}
