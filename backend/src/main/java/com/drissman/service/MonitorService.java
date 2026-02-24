package com.drissman.service;

import com.drissman.api.dto.CreateMonitorRequest;
import com.drissman.api.dto.MonitorDto;
import com.drissman.api.dto.UpdateMonitorRequest;
import com.drissman.domain.entity.Monitor;
import com.drissman.domain.entity.User;
import com.drissman.domain.repository.MonitorRepository;
import com.drissman.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional
    public Mono<MonitorDto> createMonitor(UUID schoolId, CreateMonitorRequest request) {
        if (request.getEmail() != null && !request.getEmail().isBlank() &&
                request.getPassword() != null && !request.getPassword().isBlank()) {

            User newUser = User.builder()
                    .schoolId(schoolId)
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .role(User.Role.MONITOR)
                    .createdAt(LocalDateTime.now())
                    .build();

            return userRepository.save(newUser)
                    .flatMap(savedUser -> saveMonitorEntity(schoolId, request, savedUser.getId()));
        } else {
            return saveMonitorEntity(schoolId, request, null);
        }
    }

    private Mono<MonitorDto> saveMonitorEntity(UUID schoolId, CreateMonitorRequest request, UUID userId) {
        Monitor monitor = Monitor.builder()
                .schoolId(schoolId)
                .userId(userId)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .licenseNumber(request.getLicenseNumber())
                .phoneNumber(request.getPhoneNumber())
                .status(Monitor.MonitorStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        return monitorRepository.save(monitor).map(this::mapToDto);
    }

    public Flux<MonitorDto> getMonitorsBySchool(UUID schoolId) {
        return monitorRepository.findBySchoolId(schoolId).map(this::mapToDto);
    }

    public Mono<MonitorDto> getMonitorById(UUID monitorId) {
        return monitorRepository.findById(monitorId).map(this::mapToDto);
    }

    public Mono<MonitorDto> getMonitorByUserId(UUID userId) {
        return monitorRepository.findByUserId(userId).map(this::mapToDto);
    }

    @Transactional
    public Mono<MonitorDto> updateMonitor(UUID schoolId, UUID monitorId, UpdateMonitorRequest request) {
        return monitorRepository.findById(monitorId)
                .filter(monitor -> schoolId.equals(monitor.getSchoolId()))
                .switchIfEmpty(Mono.error(new RuntimeException("Moniteur introuvable pour cette auto-ecole")))
                .flatMap(monitor -> {
                    if (request.getFirstName() != null)
                        monitor.setFirstName(request.getFirstName());
                    if (request.getLastName() != null)
                        monitor.setLastName(request.getLastName());
                    if (request.getLicenseNumber() != null)
                        monitor.setLicenseNumber(request.getLicenseNumber());
                    if (request.getPhoneNumber() != null)
                        monitor.setPhoneNumber(request.getPhoneNumber());
                    if (request.getStatus() != null)
                        monitor.setStatus(request.getStatus());

                    return monitorRepository.save(monitor).map(this::mapToDto);
                });
    }

    @Transactional
    public Mono<Void> deleteMonitor(UUID schoolId, UUID monitorId) {
        return monitorRepository.findById(monitorId)
                .filter(monitor -> schoolId.equals(monitor.getSchoolId()))
                .switchIfEmpty(Mono.error(new RuntimeException("Moniteur introuvable pour cette auto-ecole")))
                .flatMap(monitor -> {
                    if (monitor.getUserId() != null) {
                        return userRepository.deleteById(monitor.getUserId())
                                .then(monitorRepository.delete(monitor));
                    }
                    return monitorRepository.delete(monitor);
                });
    }

    private MonitorDto mapToDto(Monitor monitor) {
        return MonitorDto.builder()
                .id(monitor.getId())
                .schoolId(monitor.getSchoolId())
                .firstName(monitor.getFirstName())
                .lastName(monitor.getLastName())
                .licenseNumber(monitor.getLicenseNumber())
                .phoneNumber(monitor.getPhoneNumber())
                .userId(monitor.getUserId())
                .status(monitor.getStatus())
                .build();
    }
}
