package com.drissman.service;

import com.drissman.api.dto.CreateSessionRequest;
import com.drissman.api.dto.SessionDto;
import com.drissman.domain.entity.Enrollment;
import com.drissman.domain.entity.Monitor;
import com.drissman.domain.entity.Session;
import com.drissman.domain.repository.*;
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
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;

    public Flux<SessionDto> findBySchoolId(UUID schoolId) {
        // First get all enrollments for this school to find relevant sessions
        return enrollmentRepository.findBySchoolId(schoolId)
                .flatMap(enrollment -> sessionRepository.findByEnrollmentId(enrollment.getId()))
                .flatMap(this::enrichSession);
    }

    public Flux<SessionDto> findByMonitorId(UUID monitorId) {
        return sessionRepository.findByMonitorId(monitorId)
                .flatMap(this::enrichSession);
    }

    @Transactional
    public Mono<SessionDto> create(CreateSessionRequest request) {
        return enrollmentRepository.findById(request.getEnrollmentId())
                .flatMap(enrollment -> {
                    // Check if student has enough hours remaining
                    int remainingHours = enrollment.getHoursPurchased() - enrollment.getHoursConsumed();
                    // Duration calculation (simple for now: end - start)
                    int duration = (int) java.time.Duration.between(request.getStartTime(), request.getEndTime())
                            .toHours();

                    if (remainingHours < duration) {
                        return Mono.error(new RuntimeException("Heures insuffisantes pour planifier ce cours ("
                                + duration + "h requises, " + remainingHours + "h restantes)"));
                    }

                    Session session = Session.builder()
                            .enrollmentId(request.getEnrollmentId())
                            .monitorId(request.getMonitorId())
                            .date(request.getDate())
                            .startTime(request.getStartTime())
                            .endTime(request.getEndTime())
                            .meetingPoint(request.getMeetingPoint())
                            .status(request.getStatus() != null ? Session.SessionStatus.valueOf(request.getStatus())
                                    : Session.SessionStatus.SCHEDULED)
                            .createdAt(LocalDateTime.now())
                            .build();

                    return sessionRepository.save(session);
                })
                .flatMap(this::enrichSession);
    }

    @Transactional
    public Mono<SessionDto> updateStatus(UUID id, Session.SessionStatus status) {
        return sessionRepository.findById(id)
                .flatMap(session -> {
                    Session.SessionStatus oldStatus = session.getStatus();
                    session.setStatus(status);

                    Mono<Session> saveSession = sessionRepository.save(session);

                    // If session is being marked as COMPLETED for the first time
                    if (status == Session.SessionStatus.COMPLETED && oldStatus != Session.SessionStatus.COMPLETED) {
                        return enrollmentRepository.findById(session.getEnrollmentId())
                                .flatMap(enrollment -> {
                                    int duration = session.getDurationHours();
                                    enrollment.setHoursConsumed(enrollment.getHoursConsumed() + duration);
                                    return enrollmentRepository.save(enrollment);
                                })
                                .then(saveSession);
                    }

                    // If session was COMPLETED and is now something else (correction)
                    if (oldStatus == Session.SessionStatus.COMPLETED && status != Session.SessionStatus.COMPLETED) {
                        return enrollmentRepository.findById(session.getEnrollmentId())
                                .flatMap(enrollment -> {
                                    int duration = session.getDurationHours();
                                    enrollment.setHoursConsumed(Math.max(0, enrollment.getHoursConsumed() - duration));
                                    return enrollmentRepository.save(enrollment);
                                })
                                .then(saveSession);
                    }

                    return saveSession;
                })
                .flatMap(this::enrichSession);
    }

    public Mono<Void> delete(UUID id) {
        return sessionRepository.findById(id)
                .flatMap(session -> {
                    // If we delete a completed session, we should probably credit back the hours
                    if (session.getStatus() == Session.SessionStatus.COMPLETED) {
                        return enrollmentRepository.findById(session.getEnrollmentId())
                                .flatMap(enrollment -> {
                                    enrollment.setHoursConsumed(
                                            Math.max(0, enrollment.getHoursConsumed() - session.getDurationHours()));
                                    return enrollmentRepository.save(enrollment);
                                })
                                .then(sessionRepository.deleteById(id));
                    }
                    return sessionRepository.deleteById(id);
                });
    }

    @Transactional
    public Mono<SessionDto> updateSession(UUID id, CreateSessionRequest request) {
        return sessionRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Session not found")))
                .flatMap(session -> {
                    if (request.getMonitorId() != null)
                        session.setMonitorId(request.getMonitorId());
                    if (request.getDate() != null)
                        session.setDate(request.getDate());
                    if (request.getStartTime() != null)
                        session.setStartTime(request.getStartTime());
                    if (request.getEndTime() != null)
                        session.setEndTime(request.getEndTime());
                    if (request.getMeetingPoint() != null)
                        session.setMeetingPoint(request.getMeetingPoint());
                    return sessionRepository.save(session);
                })
                .flatMap(this::enrichSession);
    }

    @Transactional
    public Mono<SessionDto> addPedagogicalNotes(UUID id, String notes) {
        return sessionRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Session not found")))
                .flatMap(session -> {
                    session.setPedagogicalNotes(notes);
                    return sessionRepository.save(session);
                })
                .flatMap(this::enrichSession);
    }

    private Mono<SessionDto> enrichSession(Session session) {
        return Mono.zip(
                enrollmentRepository.findById(session.getEnrollmentId()),
                session.getMonitorId() != null ? monitorRepository.findById(session.getMonitorId()) : Mono.empty(),
                Mono.just(session)).flatMap(tuple -> {
                    Enrollment enrollment = tuple.getT1();
                    Monitor monitor = tuple.getT2() instanceof Monitor ? (Monitor) tuple.getT2() : null;

                    return Mono.zip(
                            userRepository.findById(enrollment.getUserId()),
                            offerRepository.findById(enrollment.getOfferId())).map(
                                    names -> SessionDto.builder()
                                            .id(session.getId())
                                            .enrollmentId(session.getEnrollmentId())
                                            .monitorId(session.getMonitorId())
                                            .studentName(
                                                    names.getT1().getFirstName() + " " + names.getT1().getLastName())
                                            .monitorName(monitor != null
                                                    ? monitor.getFirstName() + " " + monitor.getLastName()
                                                    : "Non assigné")
                                            .offerName(names.getT2().getName())
                                            .date(session.getDate())
                                            .startTime(session.getStartTime())
                                            .endTime(session.getEndTime())
                                            .status(session.getStatus().name())
                                            .meetingPoint(session.getMeetingPoint())
                                            .pedagogicalNotes(session.getPedagogicalNotes())
                                            .build());
                }).switchIfEmpty(Mono.defer(() -> {
                    // Fallback if some lookups fail
                    return Mono.just(SessionDto.builder()
                            .id(session.getId())
                            .enrollmentId(session.getEnrollmentId())
                            .date(session.getDate())
                            .startTime(session.getStartTime())
                            .endTime(session.getEndTime())
                            .status(session.getStatus().name())
                            .build());
                }));
    }
}
