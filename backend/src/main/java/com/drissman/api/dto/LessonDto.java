package com.drissman.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDto {
    private UUID id;
    private UUID monitorId;
    private String monitorName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String topic;
    private String lessonType;
    private UUID moduleId;
    private String moduleName;
    private String description;
    private String roomId;
    private Integer capacity;
    private Integer enrolledCount;
    private String status;
    private List<StudentRegistrationDto> registeredStudents;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentRegistrationDto {
        private UUID studentId;
        private String studentName;
        private String status;
        private String notes;
    }
}
