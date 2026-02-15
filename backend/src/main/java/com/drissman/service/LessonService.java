package com.drissman.service;

import com.drissman.api.dto.CreateLessonRequest;
import com.drissman.api.dto.LessonDto;
import com.drissman.domain.entity.Lesson;
import com.drissman.domain.entity.LessonRegistration;
import com.drissman.domain.repository.LessonRegistrationRepository;
import com.drissman.domain.repository.LessonRepository;
import com.drissman.domain.repository.ModuleRepository;
import com.drissman.domain.repository.MonitorRepository;
import com.drissman.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonService {

        private final LessonRepository lessonRepository;
        private final LessonRegistrationRepository registrationRepository;
        private final MonitorRepository monitorRepository;
        private final ModuleRepository moduleRepository;
        private final UserRepository userRepository;

        @Transactional
        public Mono<LessonDto> createLesson(UUID schoolId, CreateLessonRequest request) {
                // Detect conflicts: same monitor or room at same time
                return checkConflicts(schoolId, request, null)
                                .then(Mono.defer(() -> {
                                        Lesson.LessonType lessonType;
                                        try {
                                                lessonType = Lesson.LessonType
                                                                .valueOf(request.getLessonType().toUpperCase());
                                        } catch (IllegalArgumentException | NullPointerException e) {
                                                lessonType = Lesson.LessonType.CODE;
                                        }

                                        Lesson lesson = Lesson.builder()
                                                        .schoolId(schoolId)
                                                        .monitorId(request.getMonitorId())
                                                        .date(request.getDate())
                                                        .startTime(request.getStartTime())
                                                        .endTime(request.getEndTime())
                                                        .topic(request.getTopic())
                                                        .lessonType(lessonType)
                                                        .moduleId(request.getModuleId())
                                                        .description(request.getDescription())
                                                        .roomId(request.getRoomId())
                                                        .capacity(request.getCapacity() != null ? request.getCapacity()
                                                                        : 20)
                                                        .status(Lesson.LessonStatus.SCHEDULED)
                                                        .build();

                                        return lessonRepository.save(lesson);
                                }))
                                .flatMap(this::enrichLesson);
        }

        public Flux<LessonDto> getLessons(UUID schoolId) {
                return lessonRepository.findBySchoolId(schoolId)
                                .flatMap(this::enrichLesson);
        }

        @Transactional
        public Mono<LessonDto> updateLesson(UUID lessonId, CreateLessonRequest request) {
                return lessonRepository.findById(lessonId)
                                .switchIfEmpty(Mono.error(
                                                new ResponseStatusException(HttpStatus.NOT_FOUND, "Cours non trouvé")))
                                .flatMap(lesson -> checkConflicts(lesson.getSchoolId(), request, lessonId)
                                                .then(Mono.defer(() -> {
                                                        if (request.getMonitorId() != null)
                                                                lesson.setMonitorId(request.getMonitorId());
                                                        if (request.getDate() != null)
                                                                lesson.setDate(request.getDate());
                                                        if (request.getStartTime() != null)
                                                                lesson.setStartTime(request.getStartTime());
                                                        if (request.getEndTime() != null)
                                                                lesson.setEndTime(request.getEndTime());
                                                        if (request.getTopic() != null)
                                                                lesson.setTopic(request.getTopic());
                                                        if (request.getRoomId() != null)
                                                                lesson.setRoomId(request.getRoomId());
                                                        if (request.getCapacity() != null)
                                                                lesson.setCapacity(request.getCapacity());
                                                        if (request.getDescription() != null)
                                                                lesson.setDescription(request.getDescription());
                                                        if (request.getModuleId() != null)
                                                                lesson.setModuleId(request.getModuleId());

                                                        if (request.getLessonType() != null) {
                                                                try {
                                                                        lesson.setLessonType(Lesson.LessonType
                                                                                        .valueOf(request.getLessonType()
                                                                                                        .toUpperCase()));
                                                                } catch (IllegalArgumentException ignored) {
                                                                }
                                                        }

                                                        return lessonRepository.save(lesson);
                                                })))
                                .flatMap(this::enrichLesson);
        }

        @Transactional
        public Mono<LessonDto> cancelLesson(UUID lessonId) {
                return lessonRepository.findById(lessonId)
                                .switchIfEmpty(Mono.error(
                                                new ResponseStatusException(HttpStatus.NOT_FOUND, "Cours non trouvé")))
                                .flatMap(lesson -> {
                                        lesson.setStatus(Lesson.LessonStatus.CANCELLED);
                                        return lessonRepository.save(lesson);
                                })
                                .flatMap(this::enrichLesson);
        }

        @Transactional
        public Mono<LessonDto> completeLesson(UUID lessonId) {
                return lessonRepository.findById(lessonId)
                                .switchIfEmpty(Mono.error(
                                                new ResponseStatusException(HttpStatus.NOT_FOUND, "Cours non trouvé")))
                                .flatMap(lesson -> {
                                        if (lesson.getStatus() == Lesson.LessonStatus.CANCELLED) {
                                                return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                                "Impossible de terminer un cours annulé"));
                                        }
                                        lesson.setStatus(Lesson.LessonStatus.COMPLETED);
                                        return lessonRepository.save(lesson);
                                })
                                .flatMap(this::enrichLesson);
        }

        @Transactional
        public Mono<Void> deleteLesson(UUID lessonId) {
                return lessonRepository.findById(lessonId)
                                .switchIfEmpty(Mono.error(
                                                new ResponseStatusException(HttpStatus.NOT_FOUND, "Cours non trouvé")))
                                .flatMap(lesson -> registrationRepository.countByLessonId(lessonId)
                                                .flatMap(count -> {
                                                        if (count > 0) {
                                                                return Mono.error(new ResponseStatusException(
                                                                                HttpStatus.BAD_REQUEST,
                                                                                "Impossible de supprimer un cours avec des inscrits. Annulez-le plutôt."));
                                                        }
                                                        return lessonRepository.delete(lesson);
                                                }));
        }

        @Transactional
        public Mono<Void> registerStudent(UUID lessonId, UUID studentId) {
                return lessonRepository.findById(lessonId)
                                .switchIfEmpty(Mono.error(
                                                new ResponseStatusException(HttpStatus.NOT_FOUND, "Cours non trouvé")))
                                .flatMap(lesson -> {
                                        if (lesson.getStatus() != Lesson.LessonStatus.SCHEDULED) {
                                                return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                                "Inscription impossible : ce cours n'est pas planifié"));
                                        }
                                        return registrationRepository.countByLessonId(lessonId)
                                                        .flatMap(count -> {
                                                                if (count >= lesson.getCapacity()) {
                                                                        return Mono.error(new ResponseStatusException(
                                                                                        HttpStatus.BAD_REQUEST,
                                                                                        "Ce cours est complet"));
                                                                }
                                                                return registrationRepository
                                                                                .existsByLessonIdAndStudentId(lessonId,
                                                                                                studentId)
                                                                                .flatMap(exists -> {
                                                                                        if (exists) {
                                                                                                return Mono.error(
                                                                                                                new ResponseStatusException(
                                                                                                                                HttpStatus.BAD_REQUEST,
                                                                                                                                "Élève déjà inscrit à ce cours"));
                                                                                        }
                                                                                        LessonRegistration registration = LessonRegistration
                                                                                                        .builder()
                                                                                                        .lessonId(lessonId)
                                                                                                        .studentId(studentId)
                                                                                                        .status(LessonRegistration.RegistrationStatus.REGISTERED)
                                                                                                        .build();
                                                                                        return registrationRepository
                                                                                                        .save(registration);
                                                                                });
                                                        });
                                })
                                .then();
        }

        @Transactional
        public Mono<Void> unregisterStudent(UUID lessonId, UUID studentId) {
                return registrationRepository.existsByLessonIdAndStudentId(lessonId, studentId)
                                .flatMap(exists -> {
                                        if (!exists) {
                                                return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                                "L'élève n'est pas inscrit à ce cours"));
                                        }
                                        return registrationRepository.deleteByLessonIdAndStudentId(lessonId, studentId);
                                });
        }

        @Transactional
        public Mono<Void> markAttendance(UUID lessonId, UUID studentId, String status, String notes) {
                return registrationRepository.findByLessonId(lessonId)
                                .filter(r -> r.getStudentId().equals(studentId))
                                .next()
                                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Inscription non trouvée")))
                                .flatMap(registration -> {
                                        try {
                                                registration.setStatus(LessonRegistration.RegistrationStatus
                                                                .valueOf(status.toUpperCase()));
                                        } catch (IllegalArgumentException e) {
                                                return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                                "Statut invalide: " + status));
                                        }
                                        if (registration.getStatus() == LessonRegistration.RegistrationStatus.ATTENDED) {
                                                registration.setAttendedAt(LocalDateTime.now());
                                        }
                                        if (notes != null) {
                                                registration.setNotes(notes);
                                        }
                                        return registrationRepository.save(registration);
                                })
                                .then();
        }

        public Flux<LessonDto.StudentRegistrationDto> getRegisteredStudents(UUID lessonId) {
                return registrationRepository.findByLessonId(lessonId)
                                .flatMap(reg -> userRepository.findById(reg.getStudentId())
                                                .map(user -> LessonDto.StudentRegistrationDto.builder()
                                                                .studentId(user.getId())
                                                                .studentName(user.getFirstName() + " "
                                                                                + user.getLastName())
                                                                .status(reg.getStatus().name())
                                                                .notes(reg.getNotes())
                                                                .build())
                                                .defaultIfEmpty(LessonDto.StudentRegistrationDto.builder()
                                                                .studentId(reg.getStudentId())
                                                                .studentName("Inconnu")
                                                                .status(reg.getStatus().name())
                                                                .notes(reg.getNotes())
                                                                .build()));
        }

        // ---- Private helpers ----

        private Mono<Void> checkConflicts(UUID schoolId, CreateLessonRequest request, UUID excludeLessonId) {
                if (request.getDate() == null || request.getStartTime() == null || request.getEndTime() == null) {
                        return Mono.empty();
                }

                return lessonRepository.findBySchoolId(schoolId)
                                .filter(existing -> {
                                        if (excludeLessonId != null && existing.getId().equals(excludeLessonId))
                                                return false;
                                        if (existing.getStatus() == Lesson.LessonStatus.CANCELLED)
                                                return false;
                                        if (!existing.getDate().equals(request.getDate()))
                                                return false;

                                        // Check time overlap
                                        return existing.getStartTime().isBefore(request.getEndTime())
                                                        && existing.getEndTime().isAfter(request.getStartTime());
                                })
                                .collectList()
                                .flatMap(conflicts -> {
                                        if (conflicts.isEmpty())
                                                return Mono.empty();

                                        // Check monitor conflict
                                        if (request.getMonitorId() != null) {
                                                boolean monitorConflict = conflicts.stream()
                                                                .anyMatch(c -> request.getMonitorId()
                                                                                .equals(c.getMonitorId()));
                                                if (monitorConflict) {
                                                        return Mono.error(new ResponseStatusException(
                                                                        HttpStatus.CONFLICT,
                                                                        "Ce moniteur a déjà un cours sur ce créneau"));
                                                }
                                        }

                                        // Check room conflict
                                        if (request.getRoomId() != null && !request.getRoomId().isBlank()) {
                                                boolean roomConflict = conflicts.stream()
                                                                .anyMatch(c -> request.getRoomId()
                                                                                .equals(c.getRoomId()));
                                                if (roomConflict) {
                                                        return Mono.error(new ResponseStatusException(
                                                                        HttpStatus.CONFLICT,
                                                                        "Cette salle est déjà occupée sur ce créneau"));
                                                }
                                        }

                                        return Mono.empty();
                                });
        }

        private Mono<LessonDto> enrichLesson(Lesson lesson) {
                Mono<String> monitorNameMono = lesson.getMonitorId() != null
                                ? monitorRepository.findById(lesson.getMonitorId())
                                                .map(m -> m.getFirstName() + " " + m.getLastName())
                                                .defaultIfEmpty("Moniteur inconnu")
                                : Mono.just("Non assigné");

                Mono<String> moduleNameMono = lesson.getModuleId() != null
                                ? moduleRepository.findById(lesson.getModuleId())
                                                .map(m -> m.getName())
                                                .defaultIfEmpty("")
                                : Mono.just("");

                Mono<Integer> countMono = registrationRepository.countByLessonId(lesson.getId())
                                .map(Long::intValue);

                return Mono.zip(monitorNameMono, countMono, moduleNameMono)
                                .map(tuple -> LessonDto.builder()
                                                .id(lesson.getId())
                                                .monitorId(lesson.getMonitorId())
                                                .monitorName(tuple.getT1())
                                                .date(lesson.getDate())
                                                .startTime(lesson.getStartTime())
                                                .endTime(lesson.getEndTime())
                                                .topic(lesson.getTopic())
                                                .lessonType(lesson.getLessonType() != null
                                                                ? lesson.getLessonType().name()
                                                                : "CODE")
                                                .moduleId(lesson.getModuleId())
                                                .moduleName(tuple.getT3())
                                                .description(lesson.getDescription())
                                                .roomId(lesson.getRoomId())
                                                .capacity(lesson.getCapacity())
                                                .enrolledCount(tuple.getT2())
                                                .status(lesson.getStatus().name())
                                                .registeredStudents(Collections.emptyList())
                                                .build());
        }
}
