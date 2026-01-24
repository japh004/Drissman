package com.drissman.api.controller;

import com.drissman.api.dto.BookingDto;
import com.drissman.api.dto.PartnerStatsDto;
import com.drissman.domain.repository.UserRepository;
import com.drissman.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/partner")
@RequiredArgsConstructor
public class PartnerController {

    private final PartnerService partnerService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public Mono<PartnerStatsDto> getStats(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());

        return userRepository.findById(userId)
                .flatMap(user -> {
                    if (user.getSchoolId() == null) {
                        return Mono.error(new RuntimeException("L'utilisateur n'est pas associé à une école."));
                    }
                    return partnerService.getStats(user.getSchoolId());
                });
    }

    @GetMapping("/bookings")
    public Flux<BookingDto> getBookings(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());

        return userRepository.findById(userId)
                .flatMapMany(user -> {
                    if (user.getSchoolId() == null) {
                        return Flux.error(new RuntimeException("L'utilisateur n'est pas associé à une école."));
                    }
                    return partnerService.getBookings(user.getSchoolId());
                });
    }
}
