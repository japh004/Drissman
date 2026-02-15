package com.drissman.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDto {
    private UUID id;
    private UUID userId;
    private UUID schoolId;
    private UUID offerId;
    private String userName;
    private String offerName;
    private int hoursPurchased;
    private int hoursConsumed;
    private String status;
    private String createdAt;
    private Long offerPrice;
    private String userEmail;
}
