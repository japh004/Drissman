package com.drissman.api.controller;

import com.drissman.api.dto.CreateSessionRequest;
import com.drissman.api.dto.SessionDto;
import com.drissman.domain.entity.Session;
import com.drissman.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping("/school/{schoolId}")
    public Flux<SessionDto> getBySchool(@PathVariable UUID schoolId) {
        return sessionService.findBySchoolId(schoolId);
    }

    @GetMapping("/monitor/{monitorId}")
    public Flux<SessionDto> getByMonitor(@PathVariable UUID monitorId) {
        return sessionService.findByMonitorId(monitorId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<SessionDto> create(
            Principal principal,
            @Valid @RequestBody CreateSessionRequest request) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return sessionService.create(request);
    }

    @PutMapping("/{id}")
    public Mono<SessionDto> update(
            Principal principal,
            @PathVariable UUID id,
            @Valid @RequestBody CreateSessionRequest request) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return sessionService.updateSession(id, request);
    }

    @PatchMapping("/{id}/status")
    public Mono<SessionDto> updateStatus(
            Principal principal,
            @PathVariable UUID id,
            @RequestParam Session.SessionStatus status) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return sessionService.updateStatus(id, status);
    }

    @PatchMapping("/{id}/notes")
    public Mono<SessionDto> addNotes(
            Principal principal,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        String notes = body.getOrDefault("notes", "");
        return sessionService.addPedagogicalNotes(id, notes);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(
            Principal principal,
            @PathVariable UUID id) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return sessionService.delete(id);
    }
}
