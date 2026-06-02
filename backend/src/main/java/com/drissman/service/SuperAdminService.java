package com.drissman.service;

import com.drissman.api.dto.GlobalStatsDto;
import com.drissman.domain.entity.School;
import com.drissman.domain.repository.SchoolRepository;
import com.drissman.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;

    public Flux<School> getPendingSchools() {
        return schoolRepository.findAll()
                .filter(school -> Boolean.FALSE.equals(school.getIsVerified()));
    }

    public Mono<School> validateSchool(UUID schoolId) {
        return schoolRepository.findById(schoolId)
                .switchIfEmpty(Mono.error(new RuntimeException("Auto-école non trouvée")))
                .flatMap(school -> {
                    school.setIsVerified(true);
                    return schoolRepository.save(school);
                });
    }

    public Mono<GlobalStatsDto> getGlobalStats() {
        Mono<Long> totalUsersMono = userRepository.count();
        Mono<Long> totalSchoolsMono = schoolRepository.count();
        Mono<Long> pendingSchoolsMono = schoolRepository.findAll()
                .filter(school -> Boolean.FALSE.equals(school.getIsVerified()))
                .count();

        return Mono.zip(totalUsersMono, totalSchoolsMono, pendingSchoolsMono)
                .map(tuple -> GlobalStatsDto.builder()
                        .totalUsers(tuple.getT1())
                        .totalSchools(tuple.getT2())
                        .pendingSchools(tuple.getT3())
                        .build());
    }
}
