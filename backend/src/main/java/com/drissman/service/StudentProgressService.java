package com.drissman.service;

import com.drissman.api.dto.StudentProgressDto;
import com.drissman.domain.entity.Enrollment;
import com.drissman.domain.entity.Session;
import com.drissman.domain.repository.EnrollmentRepository;
import com.drissman.domain.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentProgressService {

        private final EnrollmentRepository enrollmentRepository;
        private final SessionRepository sessionRepository;

        public Mono<StudentProgressDto> getProgress(UUID userId) {
                return enrollmentRepository.findByUserId(userId)
                                .collectList()
                                .flatMap(enrollments -> {
                                        if (enrollments.isEmpty()) {
                                                return Mono.just(StudentProgressDto.builder()
                                                                .codeProgress(0)
                                                                .codeExamsCompleted(0)
                                                                .codeTotalExams(20)
                                                                .conduiteProgress(0)
                                                                .conduiteHoursCompleted(0)
                                                                .conduiteTotalHours(20)
                                                                .nextExamDate("Non planifié")
                                                                .build());
                                        }

                                        // Aggregate hours across all active enrollments
                                        int totalHoursConsumed = enrollments.stream()
                                                        .filter(e -> e.getStatus() == Enrollment.EnrollmentStatus.ACTIVE
                                                                        || e.getStatus() == Enrollment.EnrollmentStatus.COMPLETED)
                                                        .mapToInt(Enrollment::getHoursConsumed)
                                                        .sum();

                                        int totalHoursPurchased = enrollments.stream()
                                                        .filter(e -> e.getStatus() == Enrollment.EnrollmentStatus.ACTIVE
                                                                        || e.getStatus() == Enrollment.EnrollmentStatus.COMPLETED)
                                                        .mapToInt(Enrollment::getHoursPurchased)
                                                        .sum();

                                        int conduiteTotalHours = Math.max(totalHoursPurchased, 20);
                                        int conduiteProgress = Math.min(
                                                        (totalHoursConsumed * 100) / Math.max(conduiteTotalHours, 1),
                                                        100);

                                        // Code de la route progress (estimated, based on completed sessions)
                                        int codeExams = Math.min(totalHoursConsumed / 2, 20);
                                        int codeProgress = Math.min((codeExams * 100) / 20, 100);

                                        // Find next scheduled session across all enrollments
                                        return sessionRepository.findByEnrollmentIdAndStatus(
                                                        enrollments.get(0).getId(), Session.SessionStatus.SCHEDULED)
                                                        .filter(s -> s.getDate() != null
                                                                        && !s.getDate().isBefore(LocalDate.now()))
                                                        .next()
                                                        .map(nextSession -> StudentProgressDto.builder()
                                                                        .codeProgress(codeProgress)
                                                                        .codeExamsCompleted(codeExams)
                                                                        .codeTotalExams(20)
                                                                        .conduiteProgress(conduiteProgress)
                                                                        .conduiteHoursCompleted(totalHoursConsumed)
                                                                        .conduiteTotalHours(conduiteTotalHours)
                                                                        .nextExamDate(nextSession.getDate().toString())
                                                                        .nextExamType("CONDUITE")
                                                                        .build())
                                                        .defaultIfEmpty(StudentProgressDto.builder()
                                                                        .codeProgress(codeProgress)
                                                                        .codeExamsCompleted(codeExams)
                                                                        .codeTotalExams(20)
                                                                        .conduiteProgress(conduiteProgress)
                                                                        .conduiteHoursCompleted(totalHoursConsumed)
                                                                        .conduiteTotalHours(conduiteTotalHours)
                                                                        .nextExamDate("Non planifié")
                                                                        .build());
                                });
        }
}
