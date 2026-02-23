package com.drissman.service;

import com.drissman.api.dto.CreateSessionRequest;
import com.drissman.api.dto.SessionDto;
import com.drissman.domain.entity.Enrollment;
import com.drissman.domain.entity.Monitor;
import com.drissman.domain.entity.Session;
import com.drissman.domain.repository.EnrollmentRepository;
import com.drissman.domain.repository.MonitorRepository;
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
    private final MonitorRepository monitorRepository;

    @Transactional
    public Mono<SessionDto> scheduleSession(UUID schoolId, CreateSessionRequest request) {
        return enrollmentRepository.findById(request.getEnrollmentId())
                .filter(enrollment -> schoolId.equals(enrollment.getSchoolId()))
                .switchIfEmpty(Mono.error(new RuntimeException("Inscription introuvable pour cette auto-ecole")))
                .flatMap(enrollment -> validateMonitorSchool(schoolId, request.getMonitorId())
                        .then(Mono.defer(() -> createSession(enrollment, request))));
    }

    public Flux<SessionDto> getSessionsForEnrollment(UUID schoolId, UUID enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .filter(enrollment -> schoolId.equals(enrollment.getSchoolId()))
                .switchIfEmpty(Mono.error(new RuntimeException("Inscription introuvable pour cette auto-ecole")))
                .thenMany(sessionRepository.findByEnrollmentId(enrollmentId))
                .map(this::mapToDto);
    }

    public Flux<SessionDto> getSessionsForMonitor(UUID schoolId, UUID monitorId) {
        return monitorRepository.findById(monitorId)
                .filter(monitor -> schoolId.equals(monitor.getSchoolId()))
                .switchIfEmpty(Mono.error(new RuntimeException("Moniteur introuvable pour cette auto-ecole")))
                .thenMany(sessionRepository.findByMonitorId(monitorId))
                .map(this::mapToDto);
    }

    public Mono<SessionDto> getSessionById(UUID id) {
        return sessionRepository.findById(id).map(this::mapToDto);
    }

    public Mono<Void> cancelSession(UUID schoolId, UUID sessionId) {
        return sessionRepository.findById(sessionId)
                .switchIfEmpty(Mono.error(new RuntimeException("Session introuvable")))
                .flatMap(session -> ensureSessionBelongsToSchool(session, schoolId)
                        .then(Mono.defer(() -> {
                            session.setStatus(Session.SessionStatus.CANCELLED);
                            return sessionRepository.save(session).then();
                        })));
    }

    @Transactional
    public Mono<SessionDto> completeSession(UUID schoolId, UUID sessionId, String pedagogicalNotes) {
        return sessionRepository.findById(sessionId)
                .switchIfEmpty(Mono.error(new RuntimeException("Session introuvable")))
                .flatMap(session -> ensureSessionBelongsToSchool(session, schoolId)
                        .then(enrollmentRepository.findById(session.getEnrollmentId())
                                .flatMap(enrollment -> {
                                    session.setStatus(Session.SessionStatus.COMPLETED);
                                    if (pedagogicalNotes != null) {
                                        session.setPedagogicalNotes(pedagogicalNotes);
                                    }

                                    enrollment.setHoursConsumed(enrollment.getHoursConsumed() + session.getDurationHours());

                                    return enrollmentRepository.save(enrollment)
                                            .then(sessionRepository.save(session))
                                            .map(this::mapToDto);
                                })));
    }

    private Mono<Void> validateMonitorSchool(UUID schoolId, UUID monitorId) {
        if (monitorId == null) {
            return Mono.empty();
        }
        return monitorRepository.findById(monitorId)
                .filter(monitor -> schoolId.equals(monitor.getSchoolId()))
                .switchIfEmpty(Mono.error(new RuntimeException("Moniteur invalide pour cette auto-ecole")))
                .then();
    }

    private Mono<Void> ensureSessionBelongsToSchool(Session session, UUID schoolId) {
        return enrollmentRepository.findById(session.getEnrollmentId())
                .filter(enrollment -> schoolId.equals(enrollment.getSchoolId()))
                .switchIfEmpty(Mono.error(new RuntimeException("Session hors perimetre auto-ecole")))
                .then();
    }

    private Mono<SessionDto> createSession(Enrollment enrollment, CreateSessionRequest request) {
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

        int duration = session.getDurationHours();
        if (enrollment.getRemainingHours() < duration) {
            return Mono.error(new RuntimeException("Pas assez d'heures restantes sur l'inscription"));
        }

        return sessionRepository.save(session).map(this::mapToDto);
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
