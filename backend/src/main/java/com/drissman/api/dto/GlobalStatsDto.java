package com.drissman.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GlobalStatsDto {
    private long totalUsers;
    private long totalSchools;
    private long pendingSchools;
}
