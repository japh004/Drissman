package com.drissman.service;

import com.drissman.api.dto.CreateMonitorRequest;
import com.drissman.api.dto.MonitorDto;
import com.drissman.domain.entity.Monitor;
import com.drissman.domain.entity.User;
import com.drissman.domain.repository.UserRepository;
import com.drissman.domain.repository.MonitorRepository;
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
                .map(this::toDto);
    }

    public Mono<MonitorDto> getMyProfile(String email) {
        return userRepository.findByEmail(email)
                .switchIfEmpty(Mono.error(new RuntimeException("Utilisateur non trouvé avec l'email: " + email)))
                .flatMap(user -> monitorRepository.findByUserId(user.getId())
                        .switchIfEmpty(Mono.error(new RuntimeException(
                                "Profil moniteur non trouvé pour l'utilisateur: " + user.getId()))))
                .map(this::toDto);
    }

    public Mono<MonitorDto> create(CreateMonitorRequest request) {
        return monitorRepository.existsByLicenseNumber(request.getLicenseNumber())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new RuntimeException("Un moniteur avec ce numéro de licence existe déjà"));
                    }
                    return userRepository.findByEmail(request.getEmail());
                })
                .flatMap(existingUser -> Mono.error(new RuntimeException("Un utilisateur avec cet email existe déjà")))
                .switchIfEmpty(Mono.defer(() -> {
                    // Create User first
                    User user = User.builder()
                            .email(request.getEmail())
                            .password(passwordEncoder.encode("password123")) // Default password
                            .firstName(request.getFirstName())
                            .lastName(request.getLastName())
                            .schoolId(request.getSchoolId())
                            .role(User.Role.MONITOR)
                            .createdAt(LocalDateTime.now())
                            .build();

                    return userRepository.save(user).flatMap(savedUser -> {
                        Monitor monitor = Monitor.builder()
                                .schoolId(request.getSchoolId())
                                .userId(savedUser.getId())
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .licenseNumber(request.getLicenseNumber())
                                .phoneNumber(request.getPhoneNumber())
                                .status(request.getStatus() != null ? Monitor.MonitorStatus.valueOf(request.getStatus())
                                        : Monitor.MonitorStatus.ACTIVE)
                                .createdAt(LocalDateTime.now())
                                .build();
                        return monitorRepository.save(monitor)
                                .map(savedMonitor -> toDto(savedMonitor, savedUser));
                    });
                }))
                .cast(MonitorDto.class);
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
                .map(this::toDto);
    }

    public Mono<Void> delete(UUID id) {
        return monitorRepository.deleteById(id);
    }

    private MonitorDto toDto(Monitor monitor) {
        // Overload for when user is not available or not needed immediately
        // Ideally we should fetch user to get email, but for simplicity in lists we
        // might skip or fetch
        // For now let's return partial DTO or update findBySchoolId to fetch users
        return MonitorDto.builder()
                .id(monitor.getId())
                .schoolId(monitor.getSchoolId())
                .userId(monitor.getUserId())
                .firstName(monitor.getFirstName())
                .lastName(monitor.getLastName())
                .licenseNumber(monitor.getLicenseNumber())
                .phoneNumber(monitor.getPhoneNumber())
                .status(monitor.getStatus().name())
                .createdAt(monitor.getCreatedAt())
                .build();
    }

    private MonitorDto toDto(Monitor monitor, User user) {
        return MonitorDto.builder()
                .id(monitor.getId())
                .schoolId(monitor.getSchoolId())
                .userId(monitor.getUserId())
                .email(user.getEmail())
                .firstName(monitor.getFirstName())
                .lastName(monitor.getLastName())
                .licenseNumber(monitor.getLicenseNumber())
                .phoneNumber(monitor.getPhoneNumber())
                .status(monitor.getStatus().name())
                .createdAt(monitor.getCreatedAt())
                .build();
    }
}
