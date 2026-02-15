package com.drissman.api.controller;

import com.drissman.api.dto.CreateLessonRequest;
import com.drissman.api.dto.LessonDto;
import com.drissman.domain.entity.User;
import com.drissman.domain.repository.UserRepository;
import com.drissman.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;
    private final UserRepository userRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<LessonDto> createLesson(@Valid @RequestBody CreateLessonRequest request, Principal principal) {
        return getSchoolId(principal)
                .flatMap(schoolId -> lessonService.createLesson(schoolId, request));
    }

    @GetMapping
    public Flux<LessonDto> getLessons(Principal principal) {
        return getSchoolId(principal)
                .flatMapMany(lessonService::getLessons);
    }

    @PutMapping("/{lessonId}")
    public Mono<LessonDto> updateLesson(@PathVariable UUID lessonId,
            @Valid @RequestBody CreateLessonRequest request,
            Principal principal) {
        return getSchoolId(principal)
                .flatMap(schoolId -> lessonService.updateLesson(lessonId, request));
    }

    @PatchMapping("/{lessonId}/cancel")
    public Mono<LessonDto> cancelLesson(@PathVariable UUID lessonId, Principal principal) {
        return getSchoolId(principal)
                .flatMap(schoolId -> lessonService.cancelLesson(lessonId));
    }

    @PatchMapping("/{lessonId}/complete")
    public Mono<LessonDto> completeLesson(@PathVariable UUID lessonId, Principal principal) {
        return getSchoolId(principal)
                .flatMap(schoolId -> lessonService.completeLesson(lessonId));
    }

    @DeleteMapping("/{lessonId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteLesson(@PathVariable UUID lessonId, Principal principal) {
        return getSchoolId(principal)
                .flatMap(schoolId -> lessonService.deleteLesson(lessonId));
    }

    @GetMapping("/{lessonId}/students")
    public Flux<LessonDto.StudentRegistrationDto> getStudents(@PathVariable UUID lessonId, Principal principal) {
        return getSchoolId(principal)
                .flatMapMany(schoolId -> lessonService.getRegisteredStudents(lessonId));
    }

    @PatchMapping("/{lessonId}/attendance/{studentId}")
    public Mono<Void> markAttendance(@PathVariable UUID lessonId,
            @PathVariable UUID studentId,
            @RequestBody Map<String, String> body,
            Principal principal) {
        String status = body.getOrDefault("status", "ATTENDED");
        String notes = body.get("notes");
        return getSchoolId(principal)
                .flatMap(schoolId -> lessonService.markAttendance(lessonId, studentId, status, notes));
    }

    @PostMapping("/{lessonId}/register")
    @ResponseStatus(HttpStatus.OK)
    public Mono<Void> register(@PathVariable UUID lessonId, Principal principal) {
        return getUserId(principal)
                .flatMap(studentId -> lessonService.registerStudent(lessonId, studentId));
    }

    @DeleteMapping("/{lessonId}/registrations/{studentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> unregisterStudent(@PathVariable UUID lessonId,
            @PathVariable UUID studentId,
            Principal principal) {
        return getSchoolId(principal)
                .flatMap(schoolId -> lessonService.unregisterStudent(lessonId, studentId));
    }

    private Mono<UUID> getSchoolId(Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return userRepository.findById(UUID.fromString(principal.getName()))
                .map(User::getSchoolId)
                .switchIfEmpty(Mono.error(
                        new ResponseStatusException(HttpStatus.BAD_REQUEST, "Utilisateur non associé à une école")));
    }

    private Mono<UUID> getUserId(Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return Mono.just(UUID.fromString(principal.getName()));
    }
}
