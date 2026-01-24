package com.drissman.service;

import com.drissman.api.dto.InvoiceDto;
import com.drissman.domain.entity.Booking;
import com.drissman.domain.entity.Invoice;
import com.drissman.domain.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;
    private final SchoolRepository schoolRepository;
    private final OfferRepository offerRepository;

    /**
     * Create invoice when booking is created
     */
    public Mono<Invoice> createForBooking(Booking booking, Integer amount) {
        Invoice invoice = Invoice.builder()
                .bookingId(booking.getId())
                .userId(booking.getUserId())
                .amount(amount)
                .status(Invoice.InvoiceStatus.PENDING)
                .build();

        return invoiceRepository.save(invoice);
    }

    public Flux<InvoiceDto> findByUserId(UUID userId) {
        return invoiceRepository.findByUserId(userId)
                .flatMap(this::enrichWithBookingInfo);
    }

    public Mono<InvoiceDto> findById(UUID id) {
        return invoiceRepository.findById(id)
                .flatMap(this::enrichWithBookingInfo);
    }

    public Mono<InvoiceDto> markAsPaid(UUID invoiceId, Invoice.PaymentMethod paymentMethod, String reference) {
        return invoiceRepository.findById(invoiceId)
                .flatMap(invoice -> {
                    invoice.setStatus(Invoice.InvoiceStatus.PAID);
                    invoice.setPaymentMethod(paymentMethod);
                    invoice.setPaymentReference(reference);
                    invoice.setPaidAt(LocalDateTime.now());
                    return invoiceRepository.save(invoice);
                })
                .flatMap(invoice -> {
                    // Update booking status to CONFIRMED
                    return bookingRepository.findById(invoice.getBookingId())
                            .flatMap(booking -> {
                                booking.setStatus(Booking.BookingStatus.CONFIRMED);
                                return bookingRepository.save(booking);
                            })
                            .thenReturn(invoice);
                })
                .flatMap(this::enrichWithBookingInfo);
    }

    private Mono<InvoiceDto> enrichWithBookingInfo(Invoice invoice) {
        return bookingRepository.findById(invoice.getBookingId())
                .flatMap(booking -> Mono.zip(
                        schoolRepository.findById(booking.getSchoolId()),
                        offerRepository.findById(booking.getOfferId())).map(
                                tuple -> InvoiceDto.builder()
                                        .id(invoice.getId())
                                        .bookingId(invoice.getBookingId())
                                        .booking(InvoiceDto.BookingInfo.builder()
                                                .schoolName(tuple.getT1().getName())
                                                .offerName(tuple.getT2().getName())
                                                .build())
                                        .amount(invoice.getAmount())
                                        .status(invoice.getStatus().name())
                                        .paymentMethod(
                                                invoice.getPaymentMethod() != null ? invoice.getPaymentMethod().name()
                                                        : null)
                                        .paymentReference(invoice.getPaymentReference())
                                        .createdAt(invoice.getCreatedAt())
                                        .paidAt(invoice.getPaidAt())
                                        .build()));
    }
}
