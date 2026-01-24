package com.drissman.api.controller;

import com.drissman.api.dto.BookingDto;
import com.drissman.api.dto.CreateBookingRequest;
import com.drissman.domain.entity.Booking;
import com.drissman.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
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
        UUID userId = UUID.fromString(principal.getName());
        return bookingService.create(userId, request);
    }

    /**
     * Get all bookings for the authenticated user.
     */
    @GetMapping
    public Flux<BookingDto> getMyBookings(java.security.Principal principal) {
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
