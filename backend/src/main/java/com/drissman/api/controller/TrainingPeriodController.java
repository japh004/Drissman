package com.drissman.api.controller;

import com.drissman.api.dto.CreateTrainingPeriodRequest;
import com.drissman.api.dto.TrainingPeriodDto;
import com.drissman.service.TrainingPeriodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/training-periods")
@RequiredArgsConstructor
public class TrainingPeriodController {

    private final TrainingPeriodService trainingPeriodService;
    private final com.drissman.service.UserService userService;

    /**
     * Create a new training period (admin).
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<TrainingPeriodDto> create(Principal principal, @RequestBody CreateTrainingPeriodRequest request) {
        if (principal == null)
            return Mono.error(new RuntimeException("Authentification requise"));
        UUID userId = UUID.fromString(principal.getName());
        return userService.findById(userId)
                .flatMap(user -> {
                    if (user.getSchoolId() == null)
                        return Mono.error(new RuntimeException("Vous devez être rattaché à une auto-école"));
                    return trainingPeriodService.create(user.getSchoolId(), request);
                });
    }

    /**
     * Get training periods for current admin's school.
     */
    @GetMapping("/school")
    public Flux<TrainingPeriodDto> getMySchoolPeriods(Principal principal) {
        if (principal == null)
            return Flux.empty();
        UUID userId = UUID.fromString(principal.getName());
        return userService.findById(userId)
                .flatMapMany(user -> {
                    if (user.getSchoolId() == null)
                        return Flux.empty();
                    return trainingPeriodService.getBySchool(user.getSchoolId());
                });
    }

    /**
     * Get training periods for a specific school (admin route).
     */
    @GetMapping("/school/{schoolId}")
    public Flux<TrainingPeriodDto> getBySchool(@PathVariable UUID schoolId) {
        return trainingPeriodService.getBySchool(schoolId);
    }

    /**
     * Get all published training periods (public — for students to browse).
     */
    @GetMapping("/published")
    public Flux<TrainingPeriodDto> getPublished() {
        return trainingPeriodService.getPublished();
    }

    /**
     * Get published periods for a specific school (public).
     */
    @GetMapping("/published/{schoolId}")
    public Flux<TrainingPeriodDto> getPublishedBySchool(@PathVariable UUID schoolId) {
        return trainingPeriodService.getPublishedBySchool(schoolId);
    }

    /**
     * Get a single training period by ID.
     */
    @GetMapping("/{id}")
    public Mono<TrainingPeriodDto> getById(@PathVariable UUID id) {
        return trainingPeriodService.getById(id);
    }

    /**
     * Update a DRAFT period.
     */
    @PutMapping("/{id}")
    public Mono<TrainingPeriodDto> update(@PathVariable UUID id, @RequestBody CreateTrainingPeriodRequest request) {
        return trainingPeriodService.update(id, request);
    }

    /**
     * Publish a DRAFT period.
     */
    @PatchMapping("/{id}/publish")
    public Mono<TrainingPeriodDto> publish(@PathVariable UUID id) {
        return trainingPeriodService.publish(id);
    }

    /**
     * Start a PUBLISHED period.
     */
    @PatchMapping("/{id}/start")
    public Mono<TrainingPeriodDto> start(@PathVariable UUID id) {
        return trainingPeriodService.start(id);
    }

    /**
     * Complete an IN_PROGRESS period.
     */
    @PatchMapping("/{id}/complete")
    public Mono<TrainingPeriodDto> complete(@PathVariable UUID id) {
        return trainingPeriodService.complete(id);
    }

    /**
     * Cancel any non-completed period.
     */
    @PatchMapping("/{id}/cancel")
    public Mono<TrainingPeriodDto> cancel(@PathVariable UUID id) {
        return trainingPeriodService.cancel(id);
    }
}
