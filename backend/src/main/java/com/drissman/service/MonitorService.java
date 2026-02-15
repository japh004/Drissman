package com.drissman.service;

import com.drissman.api.dto.CreateMonitorRequest;
import com.drissman.api.dto.MonitorDto;
import com.drissman.domain.entity.Monitor;
import com.drissman.domain.entity.User;
import com.drissman.domain.repository.MonitorRepository;
import com.drissman.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MonitorService {

    private final MonitorRepository monitorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Flux<MonitorDto> findBySchoolId(UUID schoolId) {
        return monitorRepository.findBySchoolId(schoolId)
                .flatMap(this::toDtoWithEmail);
    }

    public Mono<MonitorDto> findByUserId(UUID userId) {
        return monitorRepository.findByUserId(userId)
                .flatMap(this::toDtoWithEmail);
    }

    public Mono<MonitorDto> create(CreateMonitorRequest request) {
        return monitorRepository.existsByLicenseNumber(request.getLicenseNumber())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new RuntimeException("Un moniteur avec ce numéro de licence existe déjà"));
                    }
                    return userRepository.existsByEmail(request.getEmail())
                            .flatMap(emailExists -> {
                                if (emailExists) {
                                    return Mono
                                            .error(new RuntimeException("Un utilisateur avec cet email existe déjà"));
                                }
                                // 1. Create User account with MONITOR role
                                User user = User.builder()
                                        .email(request.getEmail())
                                        .password(passwordEncoder.encode(request.getLicenseNumber())) // Default
                                                                                                      // password =
                                                                                                      // license number
                                        .firstName(request.getFirstName())
                                        .lastName(request.getLastName())
                                        .role(User.Role.MONITOR)
                                        .schoolId(request.getSchoolId())
                                        .createdAt(LocalDateTime.now())
                                        .build();

                                return userRepository.save(user)
                                        .flatMap(savedUser -> {
                                            // 2. Create Monitor record linked to user
                                            Monitor monitor = Monitor.builder()
                                                    .schoolId(request.getSchoolId())
                                                    .firstName(request.getFirstName())
                                                    .lastName(request.getLastName())
                                                    .licenseNumber(request.getLicenseNumber())
                                                    .phoneNumber(request.getPhoneNumber())
                                                    .userId(savedUser.getId())
                                                    .status(request.getStatus() != null
                                                            ? Monitor.MonitorStatus.valueOf(request.getStatus())
                                                            : Monitor.MonitorStatus.ACTIVE)
                                                    .createdAt(LocalDateTime.now())
                                                    .build();
                                            return monitorRepository.save(monitor)
                                                    .map(saved -> toDto(saved, savedUser.getEmail()));
                                        });
                            });
                });
    }

    public Mono<MonitorDto> update(UUID id, CreateMonitorRequest request) {
        return monitorRepository.findById(id)
                .flatMap(monitor -> {
                    monitor.setFirstName(request.getFirstName());
                    monitor.setLastName(request.getLastName());
                    monitor.setLicenseNumber(request.getLicenseNumber());
                    monitor.setPhoneNumber(request.getPhoneNumber());
                    if (request.getStatus() != null) {
                        monitor.setStatus(Monitor.MonitorStatus.valueOf(request.getStatus()));
                    }
                    return monitorRepository.save(monitor);
                })
                .flatMap(this::toDtoWithEmail);
    }

    public Mono<Void> delete(UUID id) {
        return monitorRepository.findById(id)
                .flatMap(monitor -> {
                    // Also delete associated user account if exists
                    if (monitor.getUserId() != null) {
                        return userRepository.deleteById(monitor.getUserId())
                                .then(monitorRepository.deleteById(id));
                    }
                    return monitorRepository.deleteById(id);
                });
    }

    private Mono<MonitorDto> toDtoWithEmail(Monitor monitor) {
        if (monitor.getUserId() != null) {
            return userRepository.findById(monitor.getUserId())
                    .map(user -> toDto(monitor, user.getEmail()))
                    .defaultIfEmpty(toDto(monitor, null));
        }
        return Mono.just(toDto(monitor, null));
    }

    private MonitorDto toDto(Monitor monitor, String email) {
        return MonitorDto.builder()
                .id(monitor.getId())
                .schoolId(monitor.getSchoolId())
                .firstName(monitor.getFirstName())
                .lastName(monitor.getLastName())
                .licenseNumber(monitor.getLicenseNumber())
                .phoneNumber(monitor.getPhoneNumber())
                .email(email)
                .status(monitor.getStatus().name())
                .createdAt(monitor.getCreatedAt())
                .build();
    }
}
