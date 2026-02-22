package com.drissman.api.controller;

import com.drissman.api.dto.CreateOfferRequest;
import com.drissman.api.dto.OfferModuleDto;
import com.drissman.api.dto.SchoolDto;
import com.drissman.api.dto.SetOfferModulesRequest;
import com.drissman.api.dto.UpdateOfferRequest;
import com.drissman.service.OfferModuleService;
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
@RequestMapping("/api/schools/admin/offers")
@RequiredArgsConstructor
public class AdminOfferController {

    private final OfferService offerService;
    private final OfferModuleService offerModuleService;

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

    // ─── Module association endpoints ───────────────────────────────────

    /**
     * Replace the entire module list for an offer.
     */
    @PutMapping("/{offerId}/modules")
    public Flux<OfferModuleDto> setModules(
            Principal principal,
            @PathVariable UUID offerId,
            @RequestBody SetOfferModulesRequest request) {
        if (principal == null) {
            return Flux.error(new RuntimeException("Authentification requise"));
        }
        return offerModuleService.setModulesForOffer(offerId, request);
    }

    /**
     * Remove a specific module from an offer.
     */
    @DeleteMapping("/{offerId}/modules/{moduleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> removeModule(
            Principal principal,
            @PathVariable UUID offerId,
            @PathVariable UUID moduleId) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return offerModuleService.removeModuleFromOffer(offerId, moduleId);
    }
}
