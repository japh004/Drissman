package com.drissman.domain.repository;

import com.drissman.domain.entity.Invoice;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface InvoiceRepository extends ReactiveCrudRepository<Invoice, UUID> {
    Flux<Invoice> findByUserId(UUID userId);

    Mono<Invoice> findByBookingId(UUID bookingId);
}
