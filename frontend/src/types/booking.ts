import type { School } from './school';

export interface Booking {
    id: string;
    school: Pick<School, 'id' | 'name'>;
    offer: {
        id: string;
        name: string;
    };
    date: string;
    time?: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    createdAt: string;
}

export interface CreateBookingPayload {
    schoolId: string;
    offerId: string;
    date: string;
    time?: string;
}

export interface Invoice {
    id: string;
    bookingId: string;
    booking: {
        schoolName: string;
        offerName: string;
    };
    amount: number;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'OVERDUE';
    paymentMethod?: 'MTN_MOMO' | 'ORANGE_MONEY' | 'CARD' | 'CASH';
    paymentReference?: string;
    paidAt?: string;
}
