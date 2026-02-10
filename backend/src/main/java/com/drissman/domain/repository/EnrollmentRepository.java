package com.drissman.domain.repository;

import com.drissman.domain.entity.Enrollment;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface EnrollmentRepository extends ReactiveCrudRepository<Enrollment, UUID> {

    Flux<Enrollment> findByUserId(UUID userId);

    Flux<Enrollment> findBySchoolId(UUID schoolId);

    Flux<Enrollment> findByUserIdAndStatus(UUID userId, Enrollment.EnrollmentStatus status);

    Mono<Enrollment> findByUserIdAndOfferId(UUID userId, UUID offerId);

    Mono<Boolean> existsByUserIdAndOfferIdAndStatus(UUID userId, UUID offerId, Enrollment.EnrollmentStatus status);
}
