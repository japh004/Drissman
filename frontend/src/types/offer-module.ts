export interface OfferModule {
    id: string;
    offerId: string;
    moduleId: string;
    orderIndex: number;
    moduleName?: string;
    moduleCategory?: string;
    moduleDescription?: string;
    moduleRequiredHours?: number;
}

export interface SetOfferModulesPayload {
    modules: {
        moduleId: string;
        orderIndex: number;
    }[];
}
