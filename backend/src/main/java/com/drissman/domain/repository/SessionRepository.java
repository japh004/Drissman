package com.drissman.domain.repository;

import com.drissman.domain.entity.Session;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.time.LocalDate;
import java.util.UUID;

public interface SessionRepository extends ReactiveCrudRepository<Session, UUID> {
    Flux<Session> findByEnrollmentId(UUID enrollmentId);

    Flux<Session> findByMonitorId(UUID monitorId);

    Flux<Session> findByDateBetween(LocalDate startDate, LocalDate endDate);

    @org.springframework.data.r2dbc.repository.Query("SELECT s.* FROM sessions s JOIN enrollments e ON s.enrollment_id = e.id WHERE e.school_id = :schoolId")
    Flux<Session> findBySchoolId(UUID schoolId);
}
