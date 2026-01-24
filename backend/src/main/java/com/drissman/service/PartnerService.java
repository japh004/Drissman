package com.drissman.service;

import com.drissman.api.dto.BookingDto;
import com.drissman.api.dto.PartnerStatsDto;
import com.drissman.domain.entity.Booking;
import com.drissman.domain.repository.BookingRepository;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.SchoolRepository;
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
        private final SchoolRepository schoolRepository;

        public Flux<BookingDto> getBookings(UUID schoolId) {
                return bookingRepository.findBySchoolId(schoolId)
                                .flatMap(booking -> {
                                        // Enrich with student details (User info) if needed, but for now reuse existing
                                        // enrichment
                                        // Since enrichment is private in BookingService, I'll duplicate or refactor.
                                        // Let's duplicate enrichment logic for simplicity or use a public method.
                                        return enrichWithDetails(booking);
                                });
        }

        private Mono<BookingDto> enrichWithDetails(Booking booking) {
                Mono<BookingDto.SchoolInfo> schoolInfo = schoolRepository.findById(booking.getSchoolId())
                                .map(school -> BookingDto.SchoolInfo.builder()
                                                .id(school.getId())
                                                .name(school.getName())
                                                .build());

                Mono<BookingDto.OfferInfo> offerInfo = offerRepository.findById(booking.getOfferId())
                                .map(offer -> BookingDto.OfferInfo.builder()
                                                .id(offer.getId())
                                                .name(offer.getName())
                                                .price(offer.getPrice())
                                                .build());

                return Mono.zip(schoolInfo, offerInfo)
                                .map(tuple -> BookingDto.builder()
                                                .id(booking.getId())
                                                .school(tuple.getT1())
                                                .offer(tuple.getT2())
                                                .date(booking.getBookingDate())
                                                .time(booking.getBookingTime())
                                                .status(booking.getStatus().name())
                                                .build());
        }

        public Mono<PartnerStatsDto> getStats(UUID schoolId) {
                return bookingRepository.findBySchoolId(schoolId)
                                .collectList()
                                .flatMap(bookings -> {
                                        int enrollments = bookings.size();

                                        long upcoming = bookings.stream()
                                                        .filter(b -> b.getBookingDate()
                                                                        .isAfter(LocalDate.now().minusDays(1)))
                                                        .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                                                        .count();

                                        return Mono.just(bookings)
                                                        .flatMapIterable(b -> b)
                                                        .flatMap(b -> offerRepository.findById(b.getOfferId()))
                                                        .map(offer -> offer.getPrice())
                                                        .reduce(0, Integer::sum)
                                                        .map(totalRevenue -> PartnerStatsDto.builder()
                                                                        .revenue(String.format("%,d FCFA", totalRevenue)
                                                                                        .replace(",", " "))
                                                                        .enrollments(enrollments)
                                                                        .successRate("85%") // Placeholder for now
                                                                        .upcomingLessons((int) upcoming)
                                                                        .revenueGrowth(12.5) // Placeholder
                                                                        .enrollmentGrowth(3) // Placeholder
                                                                        .build());
                                });
        }
}
