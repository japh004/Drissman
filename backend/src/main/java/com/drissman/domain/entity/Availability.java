package com.drissman.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("availabilities")
public class Availability {

    @Id
    private UUID id;

    @Column("school_id")
    private UUID schoolId;

    @Column("day_of_week")
    private Integer dayOfWeek; // 1=Monday, 7=Sunday

    @Column("start_time")
    private String startTime; // "08:00"

    @Column("end_time")
    private String endTime; // "18:00"

    @Column("max_bookings")
    private Integer maxBookings;
}
