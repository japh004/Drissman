package com.drissman.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateAvailabilityRequest {
    @NotNull
    private UUID schoolId;

    @NotNull
    @Min(1)
    @Max(7)
    private Integer dayOfWeek; // 1=Monday, 7=Sunday

    @NotBlank
    private String startTime; // "08:00"

    @NotBlank
    private String endTime; // "18:00"

    @Min(1)
    private Integer maxBookings = 1;
}
