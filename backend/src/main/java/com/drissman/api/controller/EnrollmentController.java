package com.drissman.api.controller;

import com.drissman.api.dto.CreateEnrollmentRequest;
import com.drissman.api.dto.EnrollmentDto;
import com.drissman.service.EnrollmentService;
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

    private final EnrollmentService enrollmentService;

    @GetMapping
    public Flux<EnrollmentDto> getMyEnrollments(Principal principal) {
        if (principal == null)
            return Flux.empty();
        UUID userId = UUID.fromString(principal.getName());
        return enrollmentService.getMyEnrollments(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<EnrollmentDto> create(Principal principal, @RequestBody CreateEnrollmentRequest request) {
        if (principal == null)
            return Mono.error(new RuntimeException("Authentification requise"));
        UUID userId = UUID.fromString(principal.getName());
        return enrollmentService.createEnrollment(userId, request);
    }
}
