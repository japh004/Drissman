package com.drissman.api.controller;

import com.drissman.api.dto.BookingDto;
import com.drissman.api.dto.PartnerStatsDto;
import com.drissman.api.dto.UpdateSchoolRequest;
import com.drissman.domain.repository.UserRepository;
import com.drissman.service.PartnerService;
import com.drissman.service.SchoolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/partner")
@RequiredArgsConstructor
@Slf4j
public class PartnerController {

    private final PartnerService partnerService;
    private final SchoolService schoolService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public Mono<PartnerStatsDto> getStats(Principal principal) {
        // Demo mode: return mock stats if no authenticated user
        if (principal == null) {
            log.info("Demo mode: returning mock stats");
            return Mono.just(PartnerStatsDto.builder()
                    .revenue("2,450,000 FCFA")
                    .enrollments(127)
                    .successRate("94%")
                    .upcomingLessons(23)
                    .revenueGrowth(12)
                    .enrollmentGrowth(8)
                    .build());
        }

        log.info("Fetching stats for user: {}", principal.getName());
        UUID userId = UUID.fromString(principal.getName());

        return userRepository.findById(userId)
                .flatMap(user -> {
                    if (user.getSchoolId() == null) {
                        return Mono.just(PartnerStatsDto.builder()
                                .revenue("0 FCFA")
                                .enrollments(0)
                                .successRate("0%")
                                .upcomingLessons(0)
                                .revenueGrowth(0)
                                .enrollmentGrowth(0)
                                .build());
                    }
                    return partnerService.getStats(user.getSchoolId());
                })
                .switchIfEmpty(Mono.error(new RuntimeException("Utilisateur non trouvé")));
    }

    @GetMapping("/bookings")
    public Flux<BookingDto> getBookings(Principal principal) {
        // Demo mode: return empty list if no authenticated user
        if (principal == null) {
            log.info("Demo mode: returning empty bookings");
            return Flux.empty();
        }

        UUID userId = UUID.fromString(principal.getName());

        return userRepository.findById(userId)
                .flatMapMany(user -> {
                    if (user.getSchoolId() == null) {
                        return Flux.empty();
                    }
                    return partnerService.getBookings(user.getSchoolId());
                });
    }

    @PatchMapping("/school")
    public Mono<Void> updateSchool(Principal principal, @RequestBody UpdateSchoolRequest request) {
        if (principal == null)
            return Mono.empty();

        UUID userId = UUID.fromString(principal.getName());
        return userRepository.findById(userId)
                .flatMap(user -> {
                    if (user.getSchoolId() == null)
                        return Mono.empty();
                    return schoolService.findById(user.getSchoolId())
                            .flatMap(schoolDto -> schoolService.save(com.drissman.domain.entity.School.builder()
                                    .id(user.getSchoolId())
                                    .name(request.getName() != null ? request.getName() : schoolDto.getName())
                                    .description(request.getDescription() != null ? request.getDescription()
                                            : schoolDto.getDescription())
                                    .imageUrl(request.getImageUrl() != null ? request.getImageUrl()
                                            : schoolDto.getImageUrl())
                                    .address(schoolDto.getAddress())
                                    .city(schoolDto.getCity())
                                    .phone(schoolDto.getPhone())
                                    .email(schoolDto.getEmail())
                                    .rating(schoolDto.getRating())
                                    .build()))
                            .then();
                });
    }
}
