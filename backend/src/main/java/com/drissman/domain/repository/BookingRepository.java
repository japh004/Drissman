package com.drissman.domain.repository;

import com.drissman.domain.entity.Booking;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface BookingRepository extends ReactiveCrudRepository<Booking, UUID> {
    Flux<Booking> findByUserId(UUID userId);

    Flux<Booking> findBySchoolId(UUID schoolId);
}
