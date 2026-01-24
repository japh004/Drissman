package com.drissman.api.controller;

import com.drissman.api.dto.StudentProgressDto;
import com.drissman.service.StudentProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentProgressService studentProgressService;

    @GetMapping("/progress")
    public Mono<StudentProgressDto> getProgress(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return studentProgressService.getProgress(userId);
    }
}
