package com.drissman.service;

import com.drissman.api.dto.InitiatePaymentRequest;
import com.drissman.api.dto.PaymentDto;
import com.drissman.domain.entity.Enrollment;
import com.drissman.domain.entity.Invoice;
import com.drissman.domain.repository.EnrollmentRepository;
import com.drissman.domain.repository.InvoiceRepository;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

/**
 * Circuit de paiement des inscriptions.
 *
 * V1 : le règlement Mobile Money est effectué hors plateforme (le candidat
 * paie l'auto-école) ; l'admin de l'école confirme la réception, ce qui
 * passe la facture en PAID et active l'inscription.
 *
 * TODO(P3/P5) : dès que les écoles seront provisionnées comme organisations
 * kernel (et la vérification email levée), refléter chaque facture vers
 * accounting-core / cashier-core (bill lié + encaissement /api/bills/pay).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final InvoiceRepository invoiceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final OfferRepository offerRepository;
    private final UserRepository userRepository;

    public Mono<PaymentDto> initiate(UUID userId, InitiatePaymentRequest request) {
        Invoice.PaymentMethod method;
        try {
            method = Invoice.PaymentMethod.valueOf(request.getMethod().trim().toUpperCase(Locale.ROOT));
        } catch (Exception e) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Moyen de paiement invalide"));
        }

        boolean mobileMoney = method == Invoice.PaymentMethod.MTN_MOMO || method == Invoice.PaymentMethod.ORANGE_MONEY;
        if (mobileMoney && (request.getPhone() == null || request.getPhone().isBlank())) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Numéro de téléphone requis pour le paiement Mobile Money"));
        }

        return enrollmentRepository.findById(request.getEnrollmentId())
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Inscription introuvable")))
                .filter(enrollment -> userId.equals(enrollment.getUserId()))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Cette inscription ne vous appartient pas")))
                .flatMap(enrollment -> invoiceRepository.findByEnrollmentId(enrollment.getId())
                        .filter(inv -> inv.getStatus() == Invoice.InvoiceStatus.PENDING
                                || inv.getStatus() == Invoice.InvoiceStatus.PAID)
                        .hasElements()
                        .flatMap(exists -> {
                            if (exists) {
                                return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT,
                                        "Un paiement est déjà en cours ou effectué pour cette inscription"));
                            }
                            return createInvoice(enrollment, method, request.getPhone());
                        }))
                .map(this::toDto);
    }

    private Mono<Invoice> createInvoice(Enrollment enrollment, Invoice.PaymentMethod method, String phone) {
        return offerRepository.findById(enrollment.getOfferId())
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Offre introuvable")))
                .flatMap(offer -> {
                    Invoice invoice = Invoice.builder()
                            .enrollmentId(enrollment.getId())
                            .userId(enrollment.getUserId())
                            .schoolId(enrollment.getSchoolId())
                            .amount(offer.getPrice() != null ? offer.getPrice() : 0)
                            .status(Invoice.InvoiceStatus.PENDING)
                            .paymentMethod(method)
                            .paymentPhone(phone)
                            .paymentReference(generateReference())
                            .createdAt(LocalDateTime.now())
                            .build();
                    return invoiceRepository.save(invoice);
                });
    }

    public Flux<PaymentDto> getPaymentsForUser(UUID userId) {
        return invoiceRepository.findByUserId(userId)
                .map(this::toDto)
                .sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
    }

    /** Paiements reçus par une école, enrichis (élève + offre) pour la vue admin. */
    public Flux<PaymentDto> getPaymentsForSchool(UUID schoolId) {
        return invoiceRepository.findBySchoolId(schoolId)
                .flatMap(invoice -> {
                    Mono<String> studentName = userRepository.findById(invoice.getUserId())
                            .map(u -> (u.getFirstName() != null ? u.getFirstName() : "") + " "
                                    + (u.getLastName() != null ? u.getLastName() : ""))
                            .map(String::trim)
                            .defaultIfEmpty("Élève inconnu");

                    Mono<String> offerName = invoice.getEnrollmentId() == null
                            ? Mono.just("—")
                            : enrollmentRepository.findById(invoice.getEnrollmentId())
                                    .flatMap(e -> offerRepository.findById(e.getOfferId()))
                                    .map(o -> o.getName() != null ? o.getName() : "Offre")
                                    .defaultIfEmpty("—");

                    return Mono.zip(studentName, offerName)
                            .map(t -> {
                                PaymentDto dto = toDto(invoice);
                                dto.setStudentName(t.getT1());
                                dto.setOfferName(t.getT2());
                                return dto;
                            });
                })
                .sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
    }

    /** Confirmation par l'école : facture PAID + inscription ACTIVE. */
    public Mono<PaymentDto> confirm(UUID schoolId, UUID invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture introuvable")))
                .filter(invoice -> schoolId.equals(invoice.getSchoolId()))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Cette facture n'appartient pas à votre auto-école")))
                .flatMap(invoice -> {
                    if (invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
                        return Mono.just(invoice);
                    }
                    invoice.setStatus(Invoice.InvoiceStatus.PAID);
                    invoice.setPaidAt(LocalDateTime.now());
                    return invoiceRepository.save(invoice)
                            .flatMap(saved -> activateEnrollment(saved).thenReturn(saved));
                })
                .map(this::toDto);
    }

    private Mono<Void> activateEnrollment(Invoice invoice) {
        if (invoice.getEnrollmentId() == null) {
            return Mono.empty();
        }
        return enrollmentRepository.findById(invoice.getEnrollmentId())
                .filter(enrollment -> enrollment.getStatus() == Enrollment.EnrollmentStatus.PENDING)
                .flatMap(enrollment -> {
                    enrollment.setStatus(Enrollment.EnrollmentStatus.ACTIVE);
                    return enrollmentRepository.save(enrollment);
                })
                .then();
    }

    /** Marque les factures d'une inscription selon son nouveau statut (pont admin). */
    public Mono<Void> onEnrollmentStatusChanged(UUID enrollmentId, Enrollment.EnrollmentStatus status) {
        if (status != Enrollment.EnrollmentStatus.ACTIVE && status != Enrollment.EnrollmentStatus.CANCELLED) {
            return Mono.empty();
        }
        Invoice.InvoiceStatus target = status == Enrollment.EnrollmentStatus.ACTIVE
                ? Invoice.InvoiceStatus.PAID
                : Invoice.InvoiceStatus.FAILED;
        return invoiceRepository.findByEnrollmentId(enrollmentId)
                .filter(invoice -> invoice.getStatus() == Invoice.InvoiceStatus.PENDING)
                .flatMap(invoice -> {
                    invoice.setStatus(target);
                    if (target == Invoice.InvoiceStatus.PAID) {
                        invoice.setPaidAt(LocalDateTime.now());
                    }
                    return invoiceRepository.save(invoice);
                })
                .then();
    }

    private String generateReference() {
        return "DRIS-" + LocalDateTime.now().getYear() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private PaymentDto toDto(Invoice invoice) {
        return PaymentDto.builder()
                .id(invoice.getId())
                .enrollmentId(invoice.getEnrollmentId())
                .amount(invoice.getAmount())
                .status(invoice.getStatus() != null ? invoice.getStatus().name() : null)
                .method(invoice.getPaymentMethod() != null ? invoice.getPaymentMethod().name() : null)
                .phone(invoice.getPaymentPhone())
                .reference(invoice.getPaymentReference())
                .createdAt(invoice.getCreatedAt())
                .paidAt(invoice.getPaidAt())
                .build();
    }
}
