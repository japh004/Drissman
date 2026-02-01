package com.drissman.api.controller;

import com.drissman.api.dto.StudentProgressDto;
import com.drissman.service.StudentProgressService;
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

    private final StudentProgressService studentProgressService;

    @GetMapping("/progress")
    public Mono<StudentProgressDto> getProgress(Principal principal) {
        // Demo mode: return mock progress if no authenticated user
        if (principal == null) {
            log.info("Demo mode: returning mock student progress");
            return Mono.just(StudentProgressDto.builder()
                    .totalHours(20)
                    .completedHours(12)
                    .theoreticalProgress(75)
                    .practicalProgress(60)
                    .nextLesson("Mardi 10h00 - Conduite en ville")
                    .build());
        }
        UUID userId = UUID.fromString(principal.getName());
        return studentProgressService.getProgress(userId);
    }
}
