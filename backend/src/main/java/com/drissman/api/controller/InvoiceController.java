package com.drissman.api.controller;

import com.drissman.api.dto.InvoiceDto;
import com.drissman.domain.entity.Invoice;
import com.drissman.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    /**
     * Get all invoices for authenticated user
     */
    @GetMapping
    public Flux<InvoiceDto> getMyInvoices(@RequestHeader("X-User-Id") UUID userId) {
        return invoiceService.findByUserId(userId);
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
