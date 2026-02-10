export interface School {
    id: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    phone?: string;
    email?: string;
    rating: number;
    minPrice?: number;
    imageUrl?: string;
    offers?: Offer[];
}

export interface Offer {
    id: string;
    name: string;
    description?: string;
    price: number;
    hours: number;
    permitType: string;
}

export interface SchoolFilters {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
}
