package com.drissman.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateBookingRequest {
    @NotNull
    private UUID schoolId;

    @NotNull
    private UUID offerId;

    @NotBlank
    private String date; // Format: "2026-02-01"

    private String time; // Format: "10:00"
}
