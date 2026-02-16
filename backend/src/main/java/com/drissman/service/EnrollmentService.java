package com.drissman.service;

import com.drissman.api.dto.CreateEnrollmentRequest;
import com.drissman.api.dto.EnrollmentDto;
import com.drissman.domain.entity.Enrollment;
import com.drissman.domain.repository.EnrollmentRepository;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.UserRepository;
import com.drissman.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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
        private final @Lazy InvoiceService invoiceService;

        public Flux<EnrollmentDto> getMyEnrollments(UUID userId) {
                return enrollmentRepository.findByUserId(userId)
                                .flatMap(this::toDto);
        }

        public Flux<EnrollmentDto> getSchoolEnrollments(UUID schoolId) {
                return enrollmentRepository.findBySchoolId(schoolId)
                                .flatMap(this::toDto);
        }

        public Mono<EnrollmentDto> createEnrollment(UUID userId, CreateEnrollmentRequest request) {
                return offerRepository.findById(request.getOfferId())
                                .flatMap(offer -> {
                                        Enrollment enrollment = Enrollment.builder()
                                                        .userId(userId)
                                                        .schoolId(request.getSchoolId() != null ? request.getSchoolId()
                                                                        : offer.getSchoolId())
                                                        .offerId(offer.getId())
                                                        .hoursPurchased(offer.getHours())
                                                        .hoursConsumed(0)
                                                        .status(Enrollment.EnrollmentStatus.PENDING)
                                                        .enrolledAt(LocalDateTime.now())
                                                        .createdAt(LocalDateTime.now())
                                                        .build();
                                        return enrollmentRepository.save(enrollment)
                                                        .flatMap(savedEnrollment -> userRepository.findById(userId)
                                                                        .flatMap(user -> {
                                                                                if (user.getRole() == com.drissman.domain.entity.User.Role.VISITOR) {
                                                                                        user.setRole(com.drissman.domain.entity.User.Role.STUDENT);
                                                                                        return userRepository.save(user)
                                                                                                        .thenReturn(savedEnrollment);
                                                                                }
                                                                                return Mono.just(savedEnrollment);
                                                                        }));
                                })
                                .flatMap(this::toDto);
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
                                                                .onErrorResume(e -> {
                                                                        // Log error but allow enrollment update to
                                                                        // succeed
                                                                        System.err.println(
                                                                                        "Erreur lors de la création de la facture: "
                                                                                                        + e.getMessage());
                                                                        return Mono.empty();
                                                                })
                                                                .thenReturn(saved));
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
                                                                .map(school -> EnrollmentDto.builder()
                                                                                .id(enrollment.getId())
                                                                                .userId(enrollment.getUserId())
                                                                                .schoolId(enrollment.getSchoolId())
                                                                                .offerId(enrollment.getOfferId())
                                                                                .userName(user.getFirstName() + " "
                                                                                                + user.getLastName())
                                                                                .offerName(offer.getName())
                                                                                .schoolName(school.getName())
                                                                                .hoursPurchased(enrollment
                                                                                                .getHoursPurchased())
                                                                                .hoursConsumed(enrollment
                                                                                                .getHoursConsumed())
                                                                                .status(enrollment.getStatus().name())
                                                                                .createdAt(enrollment
                                                                                                .getCreatedAt() != null
                                                                                                                ? enrollment.getCreatedAt()
                                                                                                                                .toString()
                                                                                                                : null)
                                                                                .offerPrice(offer.getPrice() != null
                                                                                                ? offer.getPrice()
                                                                                                                .longValue()
                                                                                                : 0L)
                                                                                .userEmail(user.getEmail())
                                                                                .build())));
        }
}
