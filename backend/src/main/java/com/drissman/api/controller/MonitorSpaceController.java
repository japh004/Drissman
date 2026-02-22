package com.drissman.api.controller;

import com.drissman.api.dto.MonitorDto;
import com.drissman.service.MonitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/monitors")
@RequiredArgsConstructor
public class MonitorSpaceController {

    private final MonitorService monitorService;

    /**
     * Resolves the current authenticated Principal into their specific physical
     * Monitor Profile,
     * allowing the monitor portal to know its own Monitor ID for session lookups.
     */
    @GetMapping("/me")
    public Mono<MonitorDto> getCurrentMonitorProfile(Principal principal) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentification requise"));
        }

        UUID userId = UUID.fromString(principal.getName());
        return monitorService.getMonitorByUserId(userId)
                .switchIfEmpty(Mono.error(new RuntimeException("Profil Moniteur non trouvé pour cet utilisateur.")));
    }
}
