package com.drissman.api.controller;

import com.drissman.api.dto.CreateOfferRequest;
import com.drissman.api.dto.SchoolDto;
import com.drissman.api.dto.UpdateOfferRequest;
import com.drissman.service.OfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    /**
     * Create a new offer (for school admin)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<SchoolDto.OfferDto> create(
            Principal principal,
            @Valid @RequestBody CreateOfferRequest request) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise pour créer une offre"));
        }
        return offerService.create(request);
    }

    /**
     * Get all offers for a school
     */
    @GetMapping("/school/{schoolId}")
    public Flux<SchoolDto.OfferDto> getBySchool(@PathVariable UUID schoolId) {
        return offerService.findBySchoolId(schoolId);
    }

    /**
     * Get offer by ID
     */
    @GetMapping("/{id}")
    public Mono<SchoolDto.OfferDto> getById(@PathVariable UUID id) {
        return offerService.findById(id);
    }

    /**
     * Update an offer
     */
    @PatchMapping("/{id}")
    public Mono<SchoolDto.OfferDto> update(
            Principal principal,
            @PathVariable UUID id,
            @RequestBody UpdateOfferRequest request) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise pour modifier une offre"));
        }
        return offerService.update(id, request);
    }

    /**
     * Delete an offer
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(
            Principal principal,
            @PathVariable UUID id) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise pour supprimer une offre"));
        }
        return offerService.delete(id);
    }
}
