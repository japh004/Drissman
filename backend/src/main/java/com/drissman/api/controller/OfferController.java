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
    public Mono<SchoolDto.OfferDto> create(@Valid @RequestBody CreateOfferRequest request) {
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
            @PathVariable UUID id,
            @RequestBody UpdateOfferRequest request) {
        return offerService.update(id, request);
    }

    /**
     * Delete an offer
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable UUID id) {
        return offerService.delete(id);
    }
}
