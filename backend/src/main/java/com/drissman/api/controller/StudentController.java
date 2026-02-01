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
                    .codeProgress(75)
                    .codeExamsCompleted(3)
                    .codeTotalExams(4)
                    .conduiteProgress(60)
                    .conduiteHoursCompleted(12)
                    .conduiteTotalHours(20)
                    .nextExamDate("2026-02-15")
                    .nextExamType("CODE")
                    .build());
        }
        UUID userId = UUID.fromString(principal.getName());
        return studentProgressService.getProgress(userId);
    }
}
