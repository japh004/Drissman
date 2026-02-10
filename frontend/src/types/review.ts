export interface Review {
    id: string;
    userId: string;
    userName: string;
    schoolId: string;
    rating: number;
    comment: string;
    verified: boolean;
    createdAt: string;
}

export interface CreateReviewPayload {
    schoolId: string;
    rating: number;
    comment: string;
}
