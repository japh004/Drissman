package com.drissman.api.controller;

import com.drissman.api.dto.CreateMonitorRequest;
import com.drissman.api.dto.MonitorDto;
import com.drissman.service.MonitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/monitors")
@RequiredArgsConstructor
public class MonitorController {

    private final MonitorService monitorService;

    @GetMapping("/school/{schoolId}")
    public Flux<MonitorDto> getBySchool(@PathVariable UUID schoolId) {
        return monitorService.findBySchoolId(schoolId);
    }

    @GetMapping("/me")
    public Mono<MonitorDto> getMe(Principal principal) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return monitorService.getMyProfile(principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<MonitorDto> create(
            Principal principal,
            @Valid @RequestBody CreateMonitorRequest request) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return monitorService.create(request);
    }

    @PutMapping("/{id}")
    public Mono<MonitorDto> update(
            Principal principal,
            @PathVariable UUID id,
            @Valid @RequestBody CreateMonitorRequest request) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return monitorService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(
            Principal principal,
            @PathVariable UUID id) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }
        return monitorService.delete(id);
    }
}
