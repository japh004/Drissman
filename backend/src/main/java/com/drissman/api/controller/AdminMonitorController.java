package com.drissman.api.controller;

import com.drissman.api.dto.CreateMonitorRequest;
import com.drissman.api.dto.MonitorDto;
import com.drissman.api.dto.UpdateMonitorRequest;
import com.drissman.domain.entity.User;
import com.drissman.domain.repository.UserRepository;
import com.drissman.service.MonitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/schools/admin/monitors")
@RequiredArgsConstructor
public class AdminMonitorController {

    private final MonitorService monitorService;
    private final UserRepository userRepository;

    /**
     * Get all monitors for the school of the currently logged-in admin.
     */
    @GetMapping
    public Flux<MonitorDto> getMonitors(Principal principal) {
        return getSchoolId(principal)
                .flatMapMany(monitorService::getMonitorsBySchool);
    }

    /**
     * Create a new monitor.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<MonitorDto> createMonitor(
            Principal principal,
            @Valid @RequestBody CreateMonitorRequest request) {
        return getSchoolId(principal)
                .flatMap(schoolId -> monitorService.createMonitor(schoolId, request));
    }

    /**
     * Update an existing monitor.
     */
    @PatchMapping("/{id}")
    public Mono<MonitorDto> updateMonitor(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMonitorRequest request) {
        return monitorService.updateMonitor(id, request);
    }

    /**
     * Delete a monitor. Note: this will also delete their login account
     * if one was provisioned for them.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteMonitor(@PathVariable UUID id) {
        return monitorService.deleteMonitor(id);
    }

    /**
     * Helper to extract the School ID from the current Admin's principal.
     */
    private Mono<UUID> getSchoolId(Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentification requise"));
        }
        return userRepository.findById(UUID.fromString(principal.getName()))
                .map(User::getSchoolId)
                .switchIfEmpty(Mono.error(
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Utilisateur non associé à une école")));
    }
}
