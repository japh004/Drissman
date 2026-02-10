package com.drissman.api.controller;

import com.drissman.api.dto.InvoiceDto;
import com.drissman.domain.entity.Invoice;
import com.drissman.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Slf4j
public class InvoiceController {

    private final InvoiceService invoiceService;

    /**
     * Get all invoices for authenticated user.
     * Uses JWT Principal instead of X-User-Id header.
     */
    @GetMapping
    public Flux<InvoiceDto> getMyInvoices(Principal principal) {
        if (principal == null) {
            log.info("Demo mode: returning empty invoices list");
            return Flux.empty();
        }
        UUID userId = UUID.fromString(principal.getName());
        return invoiceService.findByUserId(userId);
    }

    /**
     * Get all invoices for a school
     */
    @GetMapping("/school/{schoolId}")
    public Flux<InvoiceDto> getBySchoolId(@PathVariable UUID schoolId) {
        return invoiceService.findBySchoolId(schoolId);
    }

    /**
     * Get invoice by ID
     */
    @GetMapping("/{id}")
    public Mono<InvoiceDto> getById(@PathVariable UUID id) {
        return invoiceService.findById(id);
    }

    /**
     * Mark invoice as paid (called after payment callback)
     */
    @PostMapping("/{id}/pay")
    public Mono<InvoiceDto> pay(
            @PathVariable UUID id,
            @RequestParam Invoice.PaymentMethod method,
            @RequestParam String reference) {
        return invoiceService.markAsPaid(id, method, reference);
    }
}
