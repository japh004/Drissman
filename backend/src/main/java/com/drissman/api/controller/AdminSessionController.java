package com.drissman.api.controller;

import com.drissman.api.dto.CreateSessionRequest;
import com.drissman.api.dto.SessionDto;
import com.drissman.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/schools/admin/sessions")
@RequiredArgsConstructor
public class AdminSessionController {

    private final SessionService sessionService;

    /**
     * Create/plan a new session.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<SessionDto> createSession(
            Principal principal,
            @Valid @RequestBody CreateSessionRequest request) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return sessionService.scheduleSession(request);
    }

    /**
     * Get all sessions for a specific enrollment (client).
     */
    @GetMapping("/enrollment/{enrollmentId}")
    public Flux<SessionDto> getSessionsByEnrollment(
            Principal principal,
            @PathVariable UUID enrollmentId) {
        return sessionService.getSessionsForEnrollment(enrollmentId);
    }

    /**
     * Get all sessions assigned to a specific monitor.
     */
    @GetMapping("/monitor/{monitorId}")
    public Flux<SessionDto> getSessionsByMonitor(
            Principal principal,
            @PathVariable UUID monitorId) {
        return sessionService.getSessionsForMonitor(monitorId);
    }

    /**
     * Cancel a session.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> cancelSession(
            Principal principal,
            @PathVariable UUID id) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return sessionService.cancelSession(id);
    }

    /**
     * Complete a session to deduct hours from the client.
     */
    @PatchMapping("/{id}/complete")
    public Mono<SessionDto> completeSession(
            Principal principal,
            @PathVariable UUID id,
            @RequestParam(required = false) String notes) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return sessionService.completeSession(id, notes);
    }
}
