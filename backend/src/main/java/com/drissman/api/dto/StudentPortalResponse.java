package com.drissman.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentPortalResponse {
    private SessionSummary session;
    private List<CurriculumModuleDto> curriculum;
    private List<LessonDto> upcomingSchedule;
    private StudentSummary summary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionSummary {
        private UUID id;
        private String name;
        private String startDate;
        private String endDate;
        private String status;
        private String offerName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurriculumModuleDto {
        private UUID id;
        private String name;
        private Integer totalHours;
        private Integer consumedHours;
        private String category;
        private Integer orderIndex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSummary {
        private Integer overallProgress;
        private Integer totalHoursConsumed;
        private Integer totalHoursPurchased;
        private String nextExamDate;
    }
}
