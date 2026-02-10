package com.drissman.domain.repository;

import com.drissman.domain.entity.Session;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.time.LocalDate;
import java.util.UUID;

public interface SessionRepository extends ReactiveCrudRepository<Session, UUID> {

    Flux<Session> findByEnrollmentId(UUID enrollmentId);

    Flux<Session> findByMonitorId(UUID monitorId);

    Flux<Session> findByMonitorIdAndDate(UUID monitorId, LocalDate date);

    Flux<Session> findByEnrollmentIdAndStatus(UUID enrollmentId, Session.SessionStatus status);

    Flux<Session> findByDateBetween(LocalDate startDate, LocalDate endDate);
}
