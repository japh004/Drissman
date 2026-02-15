export interface Module {
    id: string;
    name: string;
    category: 'CODE' | 'CONDUITE' | 'EXAMEN_BLANC';
    description?: string;
    orderIndex: number;
    requiredHours: number;
    scheduledHours?: number;
}

export interface CreateModulePayload {
    name: string;
    category: string;
    description?: string;
    orderIndex?: number;
    requiredHours?: number;
}
