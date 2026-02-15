package com.drissman.service;

import com.drissman.api.dto.CreateEnrollmentRequest;
import com.drissman.api.dto.EnrollmentDto;
import com.drissman.domain.entity.Enrollment;
import com.drissman.domain.repository.EnrollmentRepository;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
                            .schoolId(request.getSchoolId() != null ? request.getSchoolId() : offer.getSchoolId())
                            .offerId(offer.getId())
                            .hoursPurchased(offer.getHours())
                            .hoursConsumed(0)
                            .status(Enrollment.EnrollmentStatus.ACTIVE)
                            .enrolledAt(LocalDateTime.now())
                            .createdAt(LocalDateTime.now())
                            .build();
                    return enrollmentRepository.save(enrollment);
                })
                .flatMap(this::toDto);
    }

    public Mono<EnrollmentDto> updateStatus(UUID id, String status) {
        return enrollmentRepository.findById(id)
                .flatMap(enrollment -> {
                    enrollment.setStatus(Enrollment.EnrollmentStatus.valueOf(status));
                    return enrollmentRepository.save(enrollment);
                })
                .flatMap(this::toDto);
    }

    public Mono<EnrollmentDto> toDto(Enrollment enrollment) {
        return Mono.zip(
                userRepository.findById(enrollment.getUserId()),
                offerRepository.findById(enrollment.getOfferId())).map(
                        tuple -> EnrollmentDto.builder()
                                .id(enrollment.getId())
                                .userId(enrollment.getUserId())
                                .schoolId(enrollment.getSchoolId())
                                .offerId(enrollment.getOfferId())
                                .userName(tuple.getT1().getFirstName() + " " + tuple.getT1().getLastName())
                                .offerName(tuple.getT2().getName())
                                .hoursPurchased(enrollment.getHoursPurchased())
                                .hoursConsumed(enrollment.getHoursConsumed())
                                .status(enrollment.getStatus().name())
                                .createdAt(
                                        enrollment.getCreatedAt() != null ? enrollment.getCreatedAt().toString() : null)
                                .offerPrice(
                                        tuple.getT2().getPrice() != null ? tuple.getT2().getPrice().longValue() : 0L)
                                .userEmail(tuple.getT1().getEmail())
                                .build());
    }
}
