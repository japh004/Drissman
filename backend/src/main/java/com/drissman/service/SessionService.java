package com.drissman.service;

import com.drissman.api.dto.CreateSessionRequest;
import com.drissman.api.dto.SessionDto;
import com.drissman.domain.entity.Enrollment;
import com.drissman.domain.entity.Session;
import com.drissman.domain.repository.EnrollmentRepository;
import com.drissman.domain.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final SessionRepository sessionRepository;
    private final EnrollmentRepository enrollmentRepository;

    /**
     * Create a new driving session. Validates that the enrollment exists and has
     * enough hours.
     */
    @Transactional
    public Mono<SessionDto> scheduleSession(CreateSessionRequest request) {
        return enrollmentRepository.findById(request.getEnrollmentId())
                .switchIfEmpty(Mono.error(new RuntimeException("Inscription introuvable")))
                .flatMap(enrollment -> {
                    Session session = Session.builder()
                            .id(UUID.randomUUID())
                            .enrollmentId(enrollment.getId())
                            .monitorId(request.getMonitorId())
                            .date(request.getDate())
                            .startTime(request.getStartTime())
                            .endTime(request.getEndTime())
                            .meetingPoint(request.getMeetingPoint())
                            .status(Session.SessionStatus.SCHEDULED)
                            .createdAt(LocalDateTime.now())
                            .build();

                    // Check if enough hours
                    int duration = session.getDurationHours();
                    if (enrollment.getRemainingHours() < duration) {
                        return Mono
                                .error(new RuntimeException("Pas assez d'heures restantes sur l'inscription. (Restant: "
                                        + enrollment.getRemainingHours() + "h, Demandé: " + duration + "h)"));
                    }

                    return sessionRepository.save(session).map(this::mapToDto);
                });
    }

    public Flux<SessionDto> getSessionsForEnrollment(UUID enrollmentId) {
        return sessionRepository.findByEnrollmentId(enrollmentId).map(this::mapToDto);
    }

    public Flux<SessionDto> getSessionsForMonitor(UUID monitorId) {
        return sessionRepository.findByMonitorId(monitorId).map(this::mapToDto);
    }

    public Mono<SessionDto> getSessionById(UUID id) {
        return sessionRepository.findById(id).map(this::mapToDto);
    }

    /**
     * Cancel a session.
     * Handles hours refund logic implicitly by not changing consumed status until
     * completion.
     */
    public Mono<Void> cancelSession(UUID sessionId) {
        return sessionRepository.findById(sessionId)
                .flatMap(session -> {
                    session.setStatus(Session.SessionStatus.CANCELLED);
                    return sessionRepository.save(session).then();
                });
    }

    /**
     * Completes a session and deducts hours from the enrollment.
     */
    @Transactional
    public Mono<SessionDto> completeSession(UUID sessionId, String pedagogicalNotes) {
        return sessionRepository.findById(sessionId)
                .flatMap(session -> enrollmentRepository.findById(session.getEnrollmentId())
                        .flatMap(enrollment -> {
                            // Update session
                            session.setStatus(Session.SessionStatus.COMPLETED);
                            if (pedagogicalNotes != null) {
                                session.setPedagogicalNotes(pedagogicalNotes);
                            }

                            // Deduct consumed hours from enrollment
                            enrollment.setHoursConsumed(enrollment.getHoursConsumed() + session.getDurationHours());

                            return enrollmentRepository.save(enrollment)
                                    .then(sessionRepository.save(session))
                                    .map(this::mapToDto);
                        }));
    }

    private SessionDto mapToDto(Session session) {
        return SessionDto.builder()
                .id(session.getId())
                .enrollmentId(session.getEnrollmentId())
                .monitorId(session.getMonitorId())
                .date(session.getDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .status(session.getStatus())
                .meetingPoint(session.getMeetingPoint())
                .pedagogicalNotes(session.getPedagogicalNotes())
                .durationHours(session.getDurationHours())
                .build();
    }
}
