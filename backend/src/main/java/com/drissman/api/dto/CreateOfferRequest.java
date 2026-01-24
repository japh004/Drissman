package com.drissman.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateOfferRequest {
    @NotNull
    private UUID schoolId;

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Min(0)
    private Integer price;

    @NotNull
    @Min(1)
    private Integer hours;
}
