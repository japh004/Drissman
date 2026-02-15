package com.drissman.service;

import com.drissman.api.dto.InvoiceDto;
import com.drissman.domain.entity.Enrollment;
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
        private final EnrollmentRepository enrollmentRepository;
        private final SchoolRepository schoolRepository;
        private final OfferRepository offerRepository;
        private final UserRepository userRepository;

        /**
         * Create invoice for an Enrollment (UML: Inscription → Facture)
         */
        public Mono<Invoice> createForEnrollment(Enrollment enrollment, Integer amount) {
                Invoice invoice = Invoice.builder()
                                .enrollmentId(enrollment.getId())
                                .userId(enrollment.getUserId())
                                .amount(amount)
                                .status(Invoice.InvoiceStatus.PENDING)
                                .build();

                return invoiceRepository.save(invoice);
        }

        public Flux<InvoiceDto> findByUserId(UUID userId) {
                return invoiceRepository.findByUserId(userId)
                                .flatMap(this::enrichWithEnrollmentInfo);
        }

        public Flux<InvoiceDto> findBySchoolId(UUID schoolId) {
                return enrollmentRepository.findBySchoolId(schoolId)
                                .flatMap(enrollment -> invoiceRepository.findByEnrollmentId(enrollment.getId()))
                                .flatMap(this::enrichWithEnrollmentInfo);
        }

        public Mono<InvoiceDto> findById(UUID id) {
                return invoiceRepository.findById(id)
                                .flatMap(this::enrichWithEnrollmentInfo);
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
                                        // Activate the enrollment when payment is confirmed
                                        if (invoice.getEnrollmentId() != null) {
                                                return enrollmentRepository.findById(invoice.getEnrollmentId())
                                                                .flatMap(enrollment -> {
                                                                        enrollment.setStatus(
                                                                                        Enrollment.EnrollmentStatus.ACTIVE);
                                                                        return enrollmentRepository.save(enrollment);
                                                                })
                                                                .thenReturn(invoice);
                                        }
                                        return Mono.just(invoice);
                                })
                                .flatMap(this::enrichWithEnrollmentInfo);
        }

        private Mono<InvoiceDto> enrichWithEnrollmentInfo(Invoice invoice) {
                if (invoice.getEnrollmentId() == null) {
                        return Mono.just(InvoiceDto.builder()
                                        .id(invoice.getId())
                                        .enrollmentId(null)
                                        .amount(invoice.getAmount())
                                        .status(invoice.getStatus().name())
                                        .paymentMethod(invoice.getPaymentMethod() != null
                                                        ? invoice.getPaymentMethod().name()
                                                        : null)
                                        .paymentReference(invoice.getPaymentReference())
                                        .createdAt(invoice.getCreatedAt())
                                        .paidAt(invoice.getPaidAt())
                                        .build());
                }

                return enrollmentRepository.findById(invoice.getEnrollmentId())
                                .flatMap(enrollment -> Mono.zip(
                                                schoolRepository.findById(enrollment.getSchoolId()),
                                                offerRepository.findById(enrollment.getOfferId()),
                                                userRepository.findById(enrollment.getUserId()))
                                                .map(tuple -> InvoiceDto.builder()
                                                                .id(invoice.getId())
                                                                .enrollmentId(invoice.getEnrollmentId())
                                                                .enrollment(InvoiceDto.EnrollmentInfo.builder()
                                                                                .schoolName(tuple.getT1().getName())
                                                                                .offerName(tuple.getT2().getName())
                                                                                .studentName(tuple.getT3()
                                                                                                .getFirstName() + " "
                                                                                                + tuple.getT3()
                                                                                                                .getLastName())
                                                                                .hoursPurchased(enrollment
                                                                                                .getHoursPurchased())
                                                                                .build())
                                                                .amount(invoice.getAmount())
                                                                .status(invoice.getStatus().name())
                                                                .paymentMethod(invoice.getPaymentMethod() != null
                                                                                ? invoice.getPaymentMethod().name()
                                                                                : null)
                                                                .paymentReference(invoice.getPaymentReference())
                                                                .createdAt(invoice.getCreatedAt())
                                                                .paidAt(invoice.getPaidAt())
                                                                .build()));
        }
}
