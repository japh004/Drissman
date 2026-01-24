package com.drissman.api.controller;

import com.drissman.api.dto.SchoolDto;
import com.drissman.service.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;

    @GetMapping
    public Flux<SchoolDto> getAll(@RequestParam(required = false) String city) {
        return schoolService.findAll(city);
    }

    @GetMapping("/{id}")
    public Mono<SchoolDto> getById(@PathVariable UUID id) {
        return schoolService.findById(id);
    }
}
