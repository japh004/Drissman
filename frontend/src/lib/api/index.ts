// Centralized exports for all API services and types
export { api } from './client';
export { authService } from './auth';
export { schoolsService, offersService } from './schools';
export { bookingsService } from './bookings';
export { reviewsService } from './reviews';
export { invoicesService } from './invoices';
export { availabilitiesService, DAYS_OF_WEEK } from './availabilities';
export { partnerService } from './partners';

// Re-export all types from centralized types directory
export * from '@/types/auth';
export * from '@/types/school';
export * from '@/types/booking';
export * from '@/types/review';
export * from '@/types/partner';
