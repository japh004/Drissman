package com.drissman.service;

import com.drissman.api.dto.LessonDto;
import com.drissman.api.dto.StudentPortalResponse;
import com.drissman.domain.entity.Enrollment;
import com.drissman.domain.entity.Lesson;
import com.drissman.domain.entity.TrainingPeriod;
import com.drissman.domain.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentPortalService {

    private final EnrollmentRepository enrollmentRepository;
    private final TrainingPeriodRepository trainingPeriodRepository;
    private final LessonRepository lessonRepository;
    private final LessonRegistrationRepository lessonRegistrationRepository;
    private final OfferModuleRepository offerModuleRepository;
    private final ModuleRepository moduleRepository;
    private final OfferRepository offerRepository;
    private final LessonService lessonService;

    public Mono<StudentPortalResponse> getPortalData(UUID userId) {
        return enrollmentRepository.findByUserIdAndStatus(userId, Enrollment.EnrollmentStatus.ACTIVE)
                .next()
                .flatMap(this::buildPortalResponse)
                .switchIfEmpty(Mono.just(StudentPortalResponse.builder()
                        .curriculum(Collections.emptyList())
                        .upcomingSchedule(Collections.emptyList())
                        .summary(StudentPortalResponse.StudentSummary.builder()
                                .overallProgress(0)
                                .totalHoursConsumed(0)
                                .totalHoursPurchased(0)
                                .build())
                        .build()));
    }

    private Mono<StudentPortalResponse> buildPortalResponse(Enrollment enrollment) {
        Mono<StudentPortalResponse.SessionSummary> sessionMono = fetchSessionSummary(enrollment);
        Mono<List<StudentPortalResponse.CurriculumModuleDto>> curriculumMono = fetchCurriculum(enrollment);
        Mono<List<LessonDto>> scheduleMono = fetchSchedule(enrollment);
        Mono<StudentPortalResponse.StudentSummary> summaryMono = fetchSummary(enrollment);

        return Mono.zip(sessionMono.defaultIfEmpty(null),
                curriculumMono.defaultIfEmpty(Collections.emptyList()),
                scheduleMono.defaultIfEmpty(Collections.emptyList()),
                summaryMono)
                .map(tuple -> StudentPortalResponse.builder()
                        .session(tuple.getT1())
                        .curriculum(tuple.getT2())
                        .upcomingSchedule(tuple.getT3())
                        .summary(tuple.getT4())
                        .build());
    }

    private Mono<StudentPortalResponse.SessionSummary> fetchSessionSummary(Enrollment enrollment) {
        if (enrollment.getTrainingPeriodId() == null)
            return Mono.empty();
        return trainingPeriodRepository.findById(enrollment.getTrainingPeriodId())
                .flatMap(period -> offerRepository.findById(period.getOfferId())
                        .map(offer -> StudentPortalResponse.SessionSummary.builder()
                                .id(period.getId())
                                .name(period.getName())
                                .startDate(period.getStartDate().toString())
                                .endDate(period.getEndDate().toString())
                                .status(period.getStatus().name())
                                .offerName(offer.getName())
                                .build()));
    }

    private Mono<List<StudentPortalResponse.CurriculumModuleDto>> fetchCurriculum(Enrollment enrollment) {
        return offerModuleRepository.findByOfferIdOrderByOrderIndexAsc(enrollment.getOfferId())
                .flatMap(om -> moduleRepository.findById(om.getModuleId())
                        .map(module -> StudentPortalResponse.CurriculumModuleDto.builder()
                                .id(module.getId())
                                .name(module.getName())
                                .category(module.getCategory())
                                .orderIndex(om.getOrderIndex())
                                .totalHours(om.getRequiredHours())
                                .consumedHours(0) // Logic for consumed hours per module can be added here
                                .build()))
                .collectList();
    }

    private Mono<List<LessonDto>> fetchSchedule(Enrollment enrollment) {
        if (enrollment.getTrainingPeriodId() == null)
            return Mono.just(Collections.emptyList());
        return lessonService.getLessonsByTrainingPeriod(enrollment.getTrainingPeriodId())
                .filter(lesson -> lesson.getDate().isAfter(LocalDate.now().minusDays(1)))
                .collectList();
    }

    private Mono<StudentPortalResponse.StudentSummary> fetchSummary(Enrollment enrollment, UUID userId) {
        // High-level progress calculation placeholder
        return Mono.just(StudentPortalResponse.StudentSummary.builder()
                .overallProgress(0)
                .totalHoursConsumed(enrollment.getHoursConsumed())
                .totalHoursPurchased(enrollment.getHoursPurchased())
                .nextExamDate(null)
                .build());
    }

    // Default summary version without userId if not specifically needed for now
    private Mono<StudentPortalResponse.StudentSummary> fetchSummary(Enrollment enrollment) {
        return Mono.just(StudentPortalResponse.StudentSummary.builder()
                .overallProgress(0)
                .totalHoursConsumed(enrollment.getHoursConsumed())
                .totalHoursPurchased(enrollment.getHoursPurchased())
                .nextExamDate(null)
                .build());
    }
}
