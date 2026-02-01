package com.drissman.api.controller;

import com.drissman.api.dto.BookingDto;
import com.drissman.api.dto.CreateBookingRequest;
import com.drissman.domain.entity.Booking;
import com.drissman.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create a new booking.
     * User ID is extracted safely from the authenticated SecurityContext (JWT).
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<BookingDto> create(
            java.security.Principal principal,
            @Valid @RequestBody CreateBookingRequest request) {
        // Demo mode: use a default user ID if not authenticated
        if (principal == null) {
            log.info("Demo mode: using default user for booking creation");
            return Mono.error(new RuntimeException("Authentification requise pour créer une réservation"));
        }
        UUID userId = UUID.fromString(principal.getName());
        return bookingService.create(userId, request);
    }

    /**
     * Get all bookings for the authenticated user.
     */
    @GetMapping
    public Flux<BookingDto> getMyBookings(java.security.Principal principal) {
        // Demo mode: return empty list if no authenticated user
        if (principal == null) {
            log.info("Demo mode: returning empty bookings list");
            return Flux.empty();
        }
        UUID userId = UUID.fromString(principal.getName());
        return bookingService.findByUserId(userId);
    }

    /**
     * Update booking status (for admin or school owner).
     */
    @PatchMapping("/{id}/status")
    public Mono<BookingDto> updateStatus(
            @PathVariable UUID id,
            @RequestParam Booking.BookingStatus status) {
        return bookingService.updateStatus(id, status);
    }
}
