package com.drissman.service;

import com.drissman.api.dto.EnrollmentDto;
import com.drissman.api.dto.PartnerStatsDto;
import com.drissman.domain.entity.Enrollment;
import com.drissman.domain.repository.EnrollmentRepository;
import com.drissman.domain.repository.InvoiceRepository;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.UserRepository;
import com.drissman.domain.repository.SessionRepository;
import com.drissman.domain.entity.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PartnerService {

        private final EnrollmentRepository enrollmentRepository;
        private final OfferRepository offerRepository;
        private final UserRepository userRepository;
        private final SessionRepository sessionRepository;
        private final InvoiceRepository invoiceRepository;

        public Flux<EnrollmentDto> getEnrollments(UUID schoolId) {
                if (schoolId == null) {
                        return Flux.empty();
                }
                return enrollmentRepository.findBySchoolId(schoolId)
                                .flatMap(enrollment -> Mono.zip(
                                                userRepository.findById(enrollment.getUserId()),
                                                offerRepository.findById(enrollment.getOfferId()))
                                                .map(tuple -> EnrollmentDto.builder()
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

                Mono<Long> enrollmentCount = enrollmentRepository.findBySchoolId(schoolId).count();

                Mono<Long> upcomingSessions = sessionRepository.findBySchoolId(schoolId)
                                .filter(s -> s.getDate() != null && !s.getDate().isBefore(LocalDate.now()))
                                .filter(s -> s.getStatus() == Session.SessionStatus.SCHEDULED
                                                || s.getStatus() == Session.SessionStatus.CONFIRMED)
                                .count();

                Mono<Long> totalRevenue = enrollmentRepository.findBySchoolId(schoolId)
                                .filter(e -> e.getStatus() == Enrollment.EnrollmentStatus.ACTIVE
                                                || e.getStatus() == Enrollment.EnrollmentStatus.COMPLETED)
                                .flatMap(e -> offerRepository.findById(e.getOfferId()))
                                .map(offer -> offer.getPrice() != null ? offer.getPrice().longValue() : 0L)
                                .reduce(0L, Long::sum);

                return Mono.zip(enrollmentCount, upcomingSessions, totalRevenue)
                                .map(tuple -> PartnerStatsDto.builder()
                                                .revenue(String.format("%,d FCFA", tuple.getT3()).replace(",", " "))
                                                .enrollments(tuple.getT1().intValue())
                                                .successRate("N/A")
                                                .upcomingLessons(tuple.getT2().intValue())
                                                .revenueGrowth(0.0)
                                                .enrollmentGrowth(0)
                                                .build());
        }
}
