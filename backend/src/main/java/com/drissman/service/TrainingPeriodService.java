package com.drissman.service;

import com.drissman.api.dto.CreateTrainingPeriodRequest;
import com.drissman.api.dto.TrainingPeriodDto;
import com.drissman.domain.entity.TrainingPeriod;
import com.drissman.domain.entity.TrainingPeriod.TrainingPeriodStatus;
import com.drissman.domain.repository.EnrollmentRepository;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.SchoolRepository;
import com.drissman.domain.repository.TrainingPeriodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainingPeriodService {

    private final TrainingPeriodRepository trainingPeriodRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final OfferRepository offerRepository;
    private final SchoolRepository schoolRepository;

    /**
     * Create a new training period (DRAFT status).
     */
    public Mono<TrainingPeriodDto> create(UUID schoolId, CreateTrainingPeriodRequest request) {
        TrainingPeriod period = TrainingPeriod.builder()
                .schoolId(schoolId)
                .offerId(request.getOfferId())
                .name(request.getName())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .maxStudents(request.getMaxStudents() != null ? request.getMaxStudents() : 30)
                .status(TrainingPeriodStatus.DRAFT)
                .enrollmentDeadline(request.getEnrollmentDeadline())
                .scheduleDescription(request.getScheduleDescription())
                .createdAt(LocalDateTime.now())
                .build();
        return trainingPeriodRepository.save(period).flatMap(this::toDto);
    }

    /**
     * Get all training periods for a school.
     */
    public Flux<TrainingPeriodDto> getBySchool(UUID schoolId) {
        return trainingPeriodRepository.findBySchoolId(schoolId)
                .flatMap(this::toDto);
    }

    /**
     * Get all published/open training periods (for students to browse).
     */
    public Flux<TrainingPeriodDto> getPublished() {
        return trainingPeriodRepository.findByStatus(TrainingPeriodStatus.PUBLISHED)
                .flatMap(this::toDto);
    }

    /**
     * Get published periods for a specific school.
     */
    public Flux<TrainingPeriodDto> getPublishedBySchool(UUID schoolId) {
        return trainingPeriodRepository.findBySchoolIdAndStatus(schoolId, TrainingPeriodStatus.PUBLISHED)
                .flatMap(this::toDto);
    }

    /**
     * Get a single training period by ID.
     */
    public Mono<TrainingPeriodDto> getById(UUID id) {
        return trainingPeriodRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Période de formation non trouvée")))
                .flatMap(this::toDto);
    }

    /**
     * Publish a DRAFT period → PUBLISHED.
     */
    public Mono<TrainingPeriodDto> publish(UUID id) {
        return trainingPeriodRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Période non trouvée")))
                .flatMap(period -> {
                    if (period.getStatus() != TrainingPeriodStatus.DRAFT) {
                        return Mono
                                .error(new RuntimeException("Seules les périodes en brouillon peuvent être publiées"));
                    }
                    period.setStatus(TrainingPeriodStatus.PUBLISHED);
                    return trainingPeriodRepository.save(period);
                })
                .flatMap(this::toDto);
    }

    /**
     * Start a PUBLISHED period → IN_PROGRESS.
     */
    public Mono<TrainingPeriodDto> start(UUID id) {
        return trainingPeriodRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Période non trouvée")))
                .flatMap(period -> {
                    if (period.getStatus() != TrainingPeriodStatus.PUBLISHED) {
                        return Mono.error(new RuntimeException("Seules les périodes publiées peuvent être démarrées"));
                    }
                    period.setStatus(TrainingPeriodStatus.IN_PROGRESS);
                    return trainingPeriodRepository.save(period);
                })
                .flatMap(this::toDto);
    }

    /**
     * Complete an IN_PROGRESS period → COMPLETED.
     */
    public Mono<TrainingPeriodDto> complete(UUID id) {
        return trainingPeriodRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Période non trouvée")))
                .flatMap(period -> {
                    if (period.getStatus() != TrainingPeriodStatus.IN_PROGRESS) {
                        return Mono.error(new RuntimeException("Seules les périodes en cours peuvent être terminées"));
                    }
                    period.setStatus(TrainingPeriodStatus.COMPLETED);
                    return trainingPeriodRepository.save(period);
                })
                .flatMap(this::toDto);
    }

    /**
     * Cancel any non-completed period → CANCELLED.
     */
    public Mono<TrainingPeriodDto> cancel(UUID id) {
        return trainingPeriodRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Période non trouvée")))
                .flatMap(period -> {
                    if (period.getStatus() == TrainingPeriodStatus.COMPLETED) {
                        return Mono.error(new RuntimeException("Impossible d'annuler une période terminée"));
                    }
                    period.setStatus(TrainingPeriodStatus.CANCELLED);
                    return trainingPeriodRepository.save(period);
                })
                .flatMap(this::toDto);
    }

    /**
     * Update a DRAFT period's details.
     */
    public Mono<TrainingPeriodDto> update(UUID id, CreateTrainingPeriodRequest request) {
        return trainingPeriodRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Période non trouvée")))
                .flatMap(period -> {
                    if (period.getStatus() != TrainingPeriodStatus.DRAFT) {
                        return Mono
                                .error(new RuntimeException("Seules les périodes en brouillon peuvent être modifiées"));
                    }
                    if (request.getOfferId() != null)
                        period.setOfferId(request.getOfferId());
                    if (request.getName() != null)
                        period.setName(request.getName());
                    if (request.getDescription() != null)
                        period.setDescription(request.getDescription());
                    if (request.getStartDate() != null)
                        period.setStartDate(request.getStartDate());
                    if (request.getEndDate() != null)
                        period.setEndDate(request.getEndDate());
                    if (request.getMaxStudents() != null)
                        period.setMaxStudents(request.getMaxStudents());
                    if (request.getEnrollmentDeadline() != null)
                        period.setEnrollmentDeadline(request.getEnrollmentDeadline());
                    if (request.getScheduleDescription() != null)
                        period.setScheduleDescription(request.getScheduleDescription());
                    return trainingPeriodRepository.save(period);
                })
                .flatMap(this::toDto);
    }

    /**
     * Convert entity to DTO with enriched fields.
     */
    private Mono<TrainingPeriodDto> toDto(TrainingPeriod period) {
        return enrollmentRepository.countByTrainingPeriodId(period.getId())
                .defaultIfEmpty(0L)
                .flatMap(enrolledCount -> offerRepository.findById(period.getOfferId())
                        .defaultIfEmpty(com.drissman.domain.entity.Offer.builder()
                                .name("Offre inconnue")
                                .price(0)
                                .build())
                        .flatMap(offer -> schoolRepository.findById(period.getSchoolId())
                                .defaultIfEmpty(com.drissman.domain.entity.School.builder()
                                        .name("Auto-école inconnue")
                                        .build())
                                .map(school -> TrainingPeriodDto.builder()
                                        .id(period.getId())
                                        .schoolId(period.getSchoolId())
                                        .offerId(period.getOfferId())
                                        .name(period.getName())
                                        .description(period.getDescription())
                                        .startDate(period.getStartDate())
                                        .endDate(period.getEndDate())
                                        .maxStudents(period.getMaxStudents())
                                        .status(period.getStatus().name())
                                        .enrollmentDeadline(period.getEnrollmentDeadline())
                                        .scheduleDescription(period.getScheduleDescription())
                                        .createdAt(period.getCreatedAt() != null
                                                ? period.getCreatedAt().toString()
                                                : null)
                                        .offerName(offer.getName())
                                        .schoolName(school.getName())
                                        .enrolledCount(enrolledCount.intValue())
                                        .remainingSpots(period.getMaxStudents() - enrolledCount.intValue())
                                        .offerPrice(offer.getPrice())
                                        .permitType(offer.getPermitType())
                                        .build())));
    }
}
