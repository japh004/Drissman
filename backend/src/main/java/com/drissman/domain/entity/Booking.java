package com.drissman.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("bookings")
public class Booking {

    @Id
    private UUID id;

    @Column("user_id")
    private UUID userId;

    @Column("school_id")
    private UUID schoolId;

    @Column("offer_id")
    private UUID offerId;

    @Column("booking_date")
    private LocalDate bookingDate;

    @Column("booking_time")
    private String bookingTime;

    private BookingStatus status;

    @Column("created_at")
    private LocalDateTime createdAt;

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        CANCELLED,
        COMPLETED
    }
}
