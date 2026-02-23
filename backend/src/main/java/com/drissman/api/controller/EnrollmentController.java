package com.drissman.api.controller;

import com.drissman.api.dto.CreateEnrollmentRequest;
import com.drissman.api.dto.EnrollmentViewDto;
import com.drissman.service.EnrollmentAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentAppService enrollmentAppService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<EnrollmentViewDto> createEnrollment(
            Principal principal,
            @Valid @RequestBody CreateEnrollmentRequest request) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return enrollmentAppService.createEnrollment(UUID.fromString(principal.getName()), request.getOfferId());
    }

    @GetMapping("/me")
    public Flux<EnrollmentViewDto> getMyEnrollments(Principal principal) {
        if (principal == null) {
            return Flux.error(new RuntimeException("Authentification requise"));
        }
        return enrollmentAppService.getEnrollmentsForStudent(UUID.fromString(principal.getName()));
    }
}
