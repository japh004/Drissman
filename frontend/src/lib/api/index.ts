// Export all API services
export { api } from './client';
export { authService, type AuthUser, type AuthResponse } from './auth';
export { schoolsService, offersService, type School, type Offer } from './schools';
export { bookingsService, type Booking, type CreateBookingPayload } from './bookings';
export { reviewsService, type Review, type CreateReviewPayload } from './reviews';
export { invoicesService, type Invoice } from './invoices';
export { availabilitiesService, DAYS_OF_WEEK, type Availability, type CreateAvailabilityPayload } from './availabilities';
export { partnerService, type PartnerStats, type UpdateSchoolRequest } from './partners';
