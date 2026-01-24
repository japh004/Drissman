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
public class AvailabilityDto {
    private UUID id;
    private UUID schoolId;
    private Integer dayOfWeek;
    private String dayName; // "Lundi", "Mardi", etc.
    private String startTime;
    private String endTime;
    private Integer maxBookings;

    private static final String[] DAYS = {
            "", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"
    };

    public static String getDayName(int dayOfWeek) {
        return dayOfWeek >= 1 && dayOfWeek <= 7 ? DAYS[dayOfWeek] : "Inconnu";
    }
}
