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
public class CreateTrainingPeriodRequest {

    private UUID offerId;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer maxStudents;
    private LocalDate enrollmentDeadline;
    private String scheduleDescription;
}
