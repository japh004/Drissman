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
    public Mono<AvailabilityDto> create(@Valid @RequestBody CreateAvailabilityRequest request) {
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
            @PathVariable UUID id,
            @Valid @RequestBody CreateAvailabilityRequest request) {
        return availabilityService.update(id, request);
    }

    /**
     * Delete availability slot
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable UUID id) {
        return availabilityService.delete(id);
    }
}
