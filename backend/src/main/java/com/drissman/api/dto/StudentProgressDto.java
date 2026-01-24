package com.drissman.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgressDto {
    private int codeProgress; // Percentage (0-100)
    private int codeExamsCompleted;
    private int codeTotalExams;

    private int conduiteProgress; // Percentage (0-100)
    private int conduiteHoursCompleted;
    private int conduiteTotalHours;

    private String nextExamDate; // "Non planifié" or ISO date
    private String nextExamType; // "CODE" or "CONDUITE"
}
