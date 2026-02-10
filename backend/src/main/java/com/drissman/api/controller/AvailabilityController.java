package com.drissman.api.controller;

import com.drissman.api.dto.AvailabilityDto;
import com.drissman.api.dto.CreateAvailabilityRequest;
import com.drissman.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/availabilities")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    /**
     * Create availability slot (school admin)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<AvailabilityDto> create(
            Principal principal,
            @Valid @RequestBody CreateAvailabilityRequest request) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise pour créer une disponibilité"));
        }
        return availabilityService.create(request);
    }

    /**
     * Get all availabilities for a school
     */
    @GetMapping("/school/{schoolId}")
    public Flux<AvailabilityDto> getBySchool(@PathVariable UUID schoolId) {
        return availabilityService.findBySchoolId(schoolId);
    }

    /**
     * Update availability slot
     */
    @PutMapping("/{id}")
    public Mono<AvailabilityDto> update(
            Principal principal,
            @PathVariable UUID id,
            @Valid @RequestBody CreateAvailabilityRequest request) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise pour modifier une disponibilité"));
        }
        return availabilityService.update(id, request);
    }

    /**
     * Delete availability slot
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(
            Principal principal,
            @PathVariable UUID id) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise pour supprimer une disponibilité"));
        }
        return availabilityService.delete(id);
    }
}
