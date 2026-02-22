package com.drissman.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("schools")
public class School {

    @Id
    private UUID id;

    private String name;

    private String description;

    private String address;

    private String city;

    private String phone;

    private String email;

    private BigDecimal rating;

    @Column("image_url")
    private String imageUrl;

    private Double latitude;

    private Double longitude;

    @Column("is_demo")
    @Builder.Default
    private Boolean isDemo = false;

    @Column("created_at")
    private LocalDateTime createdAt;
}
