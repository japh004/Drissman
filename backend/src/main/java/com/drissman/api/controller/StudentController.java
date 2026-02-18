package com.drissman.api.controller;

import com.drissman.service.StudentPortalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@Slf4j
public class StudentController {

    private final StudentPortalService studentPortalService;

    @GetMapping("/portal")
    public Mono<com.drissman.api.dto.StudentPortalResponse> getPortalData(Principal principal) {
        if (principal == null) {
            return Mono.error(new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED));
        }
        UUID userId = UUID.fromString(principal.getName());
        return studentPortalService.getPortalData(userId);
    }
}
