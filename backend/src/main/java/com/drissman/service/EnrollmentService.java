package com.drissman.service;

import com.drissman.api.dto.CreateEnrollmentRequest;
import com.drissman.api.dto.EnrollmentDto;
import com.drissman.domain.entity.Enrollment;
import com.drissman.domain.entity.TrainingPeriod;
import com.drissman.domain.repository.EnrollmentRepository;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.TrainingPeriodRepository;
import com.drissman.domain.repository.UserRepository;
import com.drissman.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

        private final EnrollmentRepository enrollmentRepository;
        private final OfferRepository offerRepository;
        private final UserRepository userRepository;
        private final com.drissman.domain.repository.SchoolRepository schoolRepository;
        private final com.drissman.domain.repository.InvoiceRepository invoiceRepository;
        private final InvoiceService invoiceService;
        private final TrainingPeriodRepository trainingPeriodRepository;

        public Flux<EnrollmentDto> getMyEnrollments(UUID userId) {
                return enrollmentRepository.findByUserId(userId)
                                .flatMap(this::toDto);
        }

        public Flux<EnrollmentDto> getSchoolEnrollments(UUID schoolId) {
                return enrollmentRepository.findBySchoolId(schoolId)
                                .flatMap(this::toDto);
        }

        public Mono<EnrollmentDto> createEnrollment(UUID userId, CreateEnrollmentRequest request) {
                if (request.getTrainingPeriodId() == null) {
                        return Mono.error(new RuntimeException(
                                        "Une session de formation est requise pour l'inscription"));
                }
                return createViaTrainingPeriod(userId, request.getTrainingPeriodId())
                                .flatMap(this::toDto);
        }

        /**
         * New cohort model: enroll student in a training period.
         * Checks that the period is PUBLISHED, has capacity, and deadline not passed.
         */
        private Mono<Enrollment> createViaTrainingPeriod(UUID userId, UUID trainingPeriodId) {
                return trainingPeriodRepository.findById(trainingPeriodId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Période de formation non trouvée")))
                                .flatMap(period -> {
                                        // Validate period is open for enrollment
                                        if (period.getStatus() != TrainingPeriod.TrainingPeriodStatus.PUBLISHED) {
                                                return Mono.error(new RuntimeException(
                                                                "Cette période n'est pas ouverte aux inscriptions"));
                                        }
                                        // Check deadline
                                        if (period.getEnrollmentDeadline() != null
                                                        && LocalDate.now().isAfter(period.getEnrollmentDeadline())) {
                                                return Mono.error(new RuntimeException(
                                                                "La date limite d'inscription est dépassée"));
                                        }
                                        // Check capacity
                                        return enrollmentRepository.countByTrainingPeriodId(trainingPeriodId)
                                                        .defaultIfEmpty(0L)
                                                        .flatMap(count -> {
                                                                if (count >= period.getMaxStudents()) {
                                                                        return Mono.error(new RuntimeException(
                                                                                        "Plus de places disponibles pour cette période"));
                                                                }
                                                                // Resolve the offer from the period
                                                                return offerRepository.findById(period.getOfferId())
                                                                                .flatMap(offer -> {
                                                                                        Enrollment enrollment = Enrollment
                                                                                                        .builder()
                                                                                                        .userId(userId)
                                                                                                        .schoolId(period.getSchoolId())
                                                                                                        .offerId(period.getOfferId())
                                                                                                        .trainingPeriodId(
                                                                                                                        trainingPeriodId)
                                                                                                        .hoursPurchased(offer
                                                                                                                        .getHours())
                                                                                                        .hoursConsumed(0)
                                                                                                        .status(Enrollment.EnrollmentStatus.PENDING)
                                                                                                        .enrolledAt(LocalDateTime
                                                                                                                        .now())
                                                                                                        .createdAt(LocalDateTime
                                                                                                                        .now())
                                                                                                        .build();
                                                                                        return enrollmentRepository
                                                                                                        .save(enrollment)
                                                                                                        .flatMap(saved -> promoteVisitorToStudent(
                                                                                                                        userId,
                                                                                                                        saved));
                                                                                });
                                                        });
                                });
        }

        /**
         * Promote a VISITOR user to STUDENT role upon first enrollment.
         */
        private Mono<Enrollment> promoteVisitorToStudent(UUID userId, Enrollment savedEnrollment) {
                return userRepository.findById(userId)
                                .flatMap(user -> {
                                        if (user.getRole() == com.drissman.domain.entity.User.Role.VISITOR) {
                                                user.setRole(com.drissman.domain.entity.User.Role.STUDENT);
                                                return userRepository.save(user).thenReturn(savedEnrollment);
                                        }
                                        return Mono.just(savedEnrollment);
                                });
        }

        public Mono<EnrollmentDto> updateStatus(UUID id, String status) {
                return enrollmentRepository.findById(id)
                                .switchIfEmpty(Mono.error(new RuntimeException("Inscription non trouvée")))
                                .flatMap(enrollment -> {
                                        enrollment.setStatus(Enrollment.EnrollmentStatus.valueOf(status));
                                        Mono<Enrollment> saveMono = enrollmentRepository.save(enrollment);

                                        if (enrollment.getStatus() == Enrollment.EnrollmentStatus.ACTIVE) {
                                                return saveMono.flatMap(saved -> invoiceRepository
                                                                .findByEnrollmentId(saved.getId())
                                                                .next()
                                                                .switchIfEmpty(offerRepository
                                                                                .findById(saved.getOfferId())
                                                                                .flatMap(offer -> invoiceService
                                                                                                .createForEnrollment(
                                                                                                                saved,
                                                                                                                offer.getPrice() != null
                                                                                                                                ? offer.getPrice()
                                                                                                                                : 0)))
                                                                .thenReturn(saved)
                                                                .onErrorResume(e -> {
                                                                        // Log error but don't fail the request
                                                                        System.err.println(
                                                                                        "Error creating invoice for enrollment "
                                                                                                        + saved.getId()
                                                                                                        + ": "
                                                                                                        + e.getMessage());
                                                                        return Mono.just(saved);
                                                                }));
                                        }
                                        return saveMono;
                                })
                                .flatMap(this::toDto);
        }

        public Mono<EnrollmentDto> toDto(Enrollment enrollment) {
                return userRepository.findById(enrollment.getUserId())
                                .defaultIfEmpty(com.drissman.domain.entity.User.builder()
                                                .firstName("Utilisateur")
                                                .lastName("Inconnu")
                                                .build())
                                .flatMap(user -> offerRepository.findById(enrollment.getOfferId())
                                                .defaultIfEmpty(com.drissman.domain.entity.Offer.builder()
                                                                .name("Offre inconnue")
                                                                .price(0)
                                                                .build())
                                                .flatMap(offer -> schoolRepository.findById(enrollment.getSchoolId())
                                                                .defaultIfEmpty(com.drissman.domain.entity.School
                                                                                .builder()
                                                                                .name("Auto-école inconnue")
                                                                                .build())
                                                                .flatMap(school -> {
                                                                        // Resolve training period name if linked
                                                                        Mono<String> periodNameMono;
                                                                        if (enrollment.getTrainingPeriodId() != null) {
                                                                                periodNameMono = trainingPeriodRepository
                                                                                                .findById(enrollment
                                                                                                                .getTrainingPeriodId())
                                                                                                .map(TrainingPeriod::getName)
                                                                                                .defaultIfEmpty("Période inconnue");
                                                                        } else {
                                                                                periodNameMono = Mono.just("");
                                                                        }
                                                                        return periodNameMono.map(
                                                                                        periodName -> EnrollmentDto
                                                                                                        .builder()
                                                                                                        .id(enrollment.getId())
                                                                                                        .userId(enrollment
                                                                                                                        .getUserId())
                                                                                                        .schoolId(enrollment
                                                                                                                        .getSchoolId())
                                                                                                        .offerId(enrollment
                                                                                                                        .getOfferId())
                                                                                                        .trainingPeriodId(
                                                                                                                        enrollment
                                                                                                                                        .getTrainingPeriodId())
                                                                                                        .trainingPeriodName(
                                                                                                                        periodName.isEmpty()
                                                                                                                                        ? null
                                                                                                                                        : periodName)
                                                                                                        .userName(user.getFirstName()
                                                                                                                        + " "
                                                                                                                        + user.getLastName())
                                                                                                        .offerName(offer.getName())
                                                                                                        .schoolName(school
                                                                                                                        .getName())
                                                                                                        .hoursPurchased(enrollment
                                                                                                                        .getHoursPurchased())
                                                                                                        .hoursConsumed(enrollment
                                                                                                                        .getHoursConsumed())
                                                                                                        .status(enrollment
                                                                                                                        .getStatus()
                                                                                                                        .name())
                                                                                                        .createdAt(enrollment
                                                                                                                        .getCreatedAt() != null
                                                                                                                                        ? enrollment.getCreatedAt()
                                                                                                                                                        .toString()
                                                                                                                                        : null)
                                                                                                        .offerPrice(offer
                                                                                                                        .getPrice() != null
                                                                                                                                        ? offer.getPrice()
                                                                                                                                                        .longValue()
                                                                                                                                        : 0L)
                                                                                                        .userEmail(user.getEmail())
                                                                                                        .build());
                                                                })));
        }
}
