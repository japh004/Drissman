package com.drissman.service;

import com.drissman.api.dto.BookingDto;
import com.drissman.api.dto.PartnerStatsDto;
import com.drissman.domain.entity.Booking;
import com.drissman.domain.repository.BookingRepository;
import com.drissman.domain.repository.EnrollmentRepository;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.UserRepository;
import com.drissman.service.mapper.BookingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PartnerService {

        private final BookingRepository bookingRepository;
        private final OfferRepository offerRepository;
        private final EnrollmentRepository enrollmentRepository;
        private final UserRepository userRepository;
        private final BookingMapper bookingMapper;

        public Flux<BookingDto> getBookings(UUID schoolId) {
                if (schoolId == null) {
                        return Flux.empty();
                }
                return bookingRepository.findBySchoolId(schoolId)
                                .flatMap(bookingMapper::enrichWithDetails);
        }

        public Flux<com.drissman.api.dto.EnrollmentDto> getEnrollments(UUID schoolId) {
                if (schoolId == null) {
                        return Flux.empty();
                }
                return enrollmentRepository.findBySchoolId(schoolId)
                                .flatMap(enrollment -> Mono.zip(
                                                userRepository.findById(enrollment.getUserId()),
                                                offerRepository.findById(enrollment.getOfferId()))
                                                .map(tuple -> com.drissman.api.dto.EnrollmentDto.builder()
                                                                .id(enrollment.getId())
                                                                .userId(enrollment.getUserId())
                                                                .schoolId(enrollment.getSchoolId())
                                                                .offerId(enrollment.getOfferId())
                                                                .userName(tuple.getT1().getFirstName() + " "
                                                                                + tuple.getT1().getLastName())
                                                                .offerName(tuple.getT2().getName())
                                                                .hoursPurchased(enrollment.getHoursPurchased())
                                                                .hoursConsumed(enrollment.getHoursConsumed())
                                                                .status(enrollment.getStatus().name())
                                                                .build()));
        }

        public Mono<PartnerStatsDto> getStats(UUID schoolId) {
                if (schoolId == null) {
                        return Mono.empty();
                }
                return bookingRepository.findBySchoolId(schoolId)
                                .collectList()
                                .flatMap(bookings -> {
                                        int enrollments = bookings.size();

                                        long upcoming = bookings.stream()
                                                        .filter(b -> b.getBookingDate() != null && b.getBookingDate()
                                                                        .isAfter(LocalDate.now().minusDays(1)))
                                                        .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                                                        .count();

                                        return Flux.fromIterable(bookings)
                                                        .filter(b -> b.getOfferId() != null)
                                                        .flatMap(b -> offerRepository.findById(b.getOfferId()))
                                                        .map(offer -> offer.getPrice() != null
                                                                        ? offer.getPrice().longValue()
                                                                        : 0L)
                                                        .reduce(0L, (a, b) -> a + b)
                                                        .map(totalRevenue -> PartnerStatsDto.builder()
                                                                        .revenue(String.format("%,d FCFA", totalRevenue)
                                                                                        .replace(",", " "))
                                                                        .enrollments(enrollments)
                                                                        .successRate("N/A")
                                                                        .upcomingLessons((int) upcoming)
                                                                        .revenueGrowth(0.0)
                                                                        .enrollmentGrowth(0)
                                                                        .build());
                                });
        }
}
