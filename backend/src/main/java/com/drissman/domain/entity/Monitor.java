package com.drissman.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Monitor entity - Represents a driving instructor employed by an auto-école.
 * Maps to UML class: Moniteur
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("monitors")
public class Monitor {

    @Id
    private UUID id;

    @Column("school_id")
    private UUID schoolId;

    @Column("user_id")
    private UUID userId;

    @Column("first_name")
    private String firstName;

    @Column("last_name")
    private String lastName;

    @Column("license_number")
    private String licenseNumber;

    @Column("phone_number")
    private String phoneNumber;

    private MonitorStatus status;

    @Column("created_at")
    private LocalDateTime createdAt;

    public enum MonitorStatus {
        ACTIVE,
        INACTIVE,
        ON_LEAVE
    }
}
