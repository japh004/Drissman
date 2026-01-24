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
public class InvoiceDto {
    private UUID id;
    private UUID bookingId;
    private BookingInfo booking;
    private Integer amount;
    private String status;
    private String paymentMethod;
    private String paymentReference;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingInfo {
        private String schoolName;
        private String offerName;
    }
}
