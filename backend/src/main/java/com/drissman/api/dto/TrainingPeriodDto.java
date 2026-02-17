package com.drissman.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingPeriodDto {

    private UUID id;
    private UUID schoolId;
    private UUID offerId;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer maxStudents;
    private String status;
    private LocalDate enrollmentDeadline;
    private String scheduleDescription;
    private String createdAt;

    // Enriched fields
    private String offerName;
    private String schoolName;
    private Integer enrolledCount;
    private Integer remainingSpots;
    private Integer offerPrice;
    private String permitType;
}
