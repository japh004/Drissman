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
                    int duration = (int) java.time.Duration.between(request.getStartTime(), request.getEndTime())
                            .toHours();

                    if (remainingHours < duration) {
                        return Mono.error(new RuntimeException("Heures insuffisantes pour planifier ce cours ("
                                + duration + "h requises, " + remainingHours + "h restantes)"));
                    }

                    // Debit hours immediately upon reservation
                    enrollment.setHoursConsumed(enrollment.getHoursConsumed() + duration);

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

                    return enrollmentRepository.save(enrollment)
                            .then(sessionRepository.save(session));
                })
                .flatMap(this::enrichSession);
    }

    @Transactional
    public Mono<SessionDto> updateStatus(UUID id, Session.SessionStatus status) {
        return sessionRepository.findById(id)
                .flatMap(session -> {
                    Session.SessionStatus oldStatus = session.getStatus();

                    // If we move TO CANCELLED or NO_SHOW from an active state, credit back the
                    // hours
                    boolean wasActive = (oldStatus != Session.SessionStatus.CANCELLED
                            && oldStatus != Session.SessionStatus.NO_SHOW);
                    boolean isDeactivating = (status == Session.SessionStatus.CANCELLED
                            || status == Session.SessionStatus.NO_SHOW);

                    // If we move FROM CANCELLED or NO_SHOW to an active state, debit the hours
                    // again
                    boolean wasDeactivated = (oldStatus == Session.SessionStatus.CANCELLED
                            || oldStatus == Session.SessionStatus.NO_SHOW);
                    boolean isActivating = (status != Session.SessionStatus.CANCELLED
                            && status != Session.SessionStatus.NO_SHOW);

                    session.setStatus(status);
                    Mono<Session> saveSession = sessionRepository.save(session);

                    if (wasActive && isDeactivating) {
                        return enrollmentRepository.findById(session.getEnrollmentId())
                                .flatMap(enrollment -> {
                                    enrollment.setHoursConsumed(
                                            Math.max(0, enrollment.getHoursConsumed() - session.getDurationHours()));
                                    return enrollmentRepository.save(enrollment);
                                })
                                .then(saveSession);
                    }

                    if (wasDeactivated && isActivating) {
                        return enrollmentRepository.findById(session.getEnrollmentId())
                                .flatMap(enrollment -> {
                                    int duration = session.getDurationHours();
                                    int remaining = enrollment.getHoursPurchased() - enrollment.getHoursConsumed();
                                    if (remaining < duration) {
                                        return Mono.error(new RuntimeException(
                                                "Heures insuffisantes pour réactiver cette séance"));
                                    }
                                    enrollment.setHoursConsumed(enrollment.getHoursConsumed() + duration);
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
                    // If the session was active (not cancelled), refund hours upon deletion
                    if (session.getStatus() != Session.SessionStatus.CANCELLED
                            && session.getStatus() != Session.SessionStatus.NO_SHOW) {
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
                    int oldDuration = session.getDurationHours();

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

                    int newDuration = session.getDurationHours();
                    int diff = newDuration - oldDuration;

                    // If duration changed and session is active, we must adjust enrollment hours
                    if (diff != 0 && session.getStatus() != Session.SessionStatus.CANCELLED
                            && session.getStatus() != Session.SessionStatus.NO_SHOW) {
                        return enrollmentRepository.findById(session.getEnrollmentId())
                                .flatMap(enrollment -> {
                                    if (diff > 0) {
                                        int remaining = enrollment.getHoursPurchased() - enrollment.getHoursConsumed();
                                        if (remaining < diff) {
                                            return Mono.error(new RuntimeException(
                                                    "Heures insuffisantes pour augmenter la durée de ce cours (" + diff
                                                            + "h supplémentaires requises)"));
                                        }
                                    }
                                    enrollment.setHoursConsumed(enrollment.getHoursConsumed() + diff);
                                    return enrollmentRepository.save(enrollment);
                                })
                                .then(sessionRepository.save(session));
                    }

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
