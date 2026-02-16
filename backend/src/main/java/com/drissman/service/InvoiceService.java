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
                                .bookingId(enrollment.getId()) // Populate booking_id as well
                                .userId(enrollment.getUserId())
                                .amount(amount)
                                .createdAt(LocalDateTime.now())
                                .status(Invoice.InvoiceStatus.PENDING)
                                .build();

                return invoiceRepository.save(invoice);
        }

        /**
         * Sync missing invoices for all ACTIVE enrollments
         */
        public Flux<InvoiceDto> syncMissingInvoices() {
                return enrollmentRepository.findAll()
                                .filter(e -> e.getStatus() == Enrollment.EnrollmentStatus.ACTIVE)
                                .flatMap(enrollment -> invoiceRepository.findByEnrollmentId(enrollment.getId())
                                                .next()
                                                .switchIfEmpty(offerRepository.findById(enrollment.getOfferId())
                                                                .flatMap(offer -> createForEnrollment(enrollment,
                                                                                offer.getPrice() != null
                                                                                                ? offer.getPrice()
                                                                                                : 0))))
                                .flatMap(this::enrichWithEnrollmentInfo);
        }

        public Flux<InvoiceDto> findAll() {
                return invoiceRepository.findAll()
                                .flatMap(this::enrichWithEnrollmentInfo);
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
                                .flatMap(this::enrichWithEnrollmentInfo);
        }

        private Mono<InvoiceDto> enrichWithEnrollmentInfo(Invoice invoice) {
                if (invoice.getEnrollmentId() == null) {
                        return Mono.just(InvoiceDto.builder()
                                        .id(invoice.getId())
                                        .bookingId(null)
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
                                .flatMap(enrollment -> userRepository.findById(enrollment.getUserId())
                                                .defaultIfEmpty(com.drissman.domain.entity.User.builder()
                                                                .firstName("Étudiant")
                                                                .lastName("Inconnu")
                                                                .build())
                                                .flatMap(user -> offerRepository.findById(enrollment.getOfferId())
                                                                .defaultIfEmpty(com.drissman.domain.entity.Offer
                                                                                .builder()
                                                                                .name("Offre inconnue")
                                                                                .build())
                                                                .flatMap(offer -> schoolRepository
                                                                                .findById(enrollment.getSchoolId())
                                                                                .defaultIfEmpty(com.drissman.domain.entity.School
                                                                                                .builder()
                                                                                                .name("Auto-école inconnue")
                                                                                                .build())
                                                                                .map(school -> InvoiceDto.builder()
                                                                                                .id(invoice.getId())
                                                                                                .bookingId(invoice
                                                                                                                .getEnrollmentId())
                                                                                                .booking(InvoiceDto.BookingInfo
                                                                                                                .builder()
                                                                                                                .schoolName(school
                                                                                                                                .getName())
                                                                                                                .offerName(offer.getName())
                                                                                                                .studentName(user
                                                                                                                                .getFirstName()
                                                                                                                                + " "
                                                                                                                                + user.getLastName())
                                                                                                                .hoursPurchased(enrollment
                                                                                                                                .getHoursPurchased())
                                                                                                                .build())
                                                                                                .amount(invoice.getAmount())
                                                                                                .status(invoice.getStatus()
                                                                                                                .name())
                                                                                                .paymentMethod(invoice
                                                                                                                .getPaymentMethod() != null
                                                                                                                                ? invoice.getPaymentMethod()
                                                                                                                                                .name()
                                                                                                                                : null)
                                                                                                .paymentReference(
                                                                                                                invoice.getPaymentReference())
                                                                                                .createdAt(invoice
                                                                                                                .getCreatedAt())
                                                                                                .paidAt(invoice.getPaidAt())
                                                                                                .build()))));
        }
}
