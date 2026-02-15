package com.drissman.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitorDto {
    private UUID id;
    private UUID schoolId;
    private String firstName;
    private String lastName;
    private String licenseNumber;
    private String phoneNumber;
    private String email;
    private String status;
    private LocalDateTime createdAt;
}
