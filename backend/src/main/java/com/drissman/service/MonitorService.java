package com.drissman.service;

import com.drissman.api.dto.CreateMonitorRequest;
import com.drissman.api.dto.MonitorDto;
import com.drissman.domain.entity.Monitor;
import com.drissman.domain.repository.MonitorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    public Flux<MonitorDto> findBySchoolId(UUID schoolId) {
        return monitorRepository.findBySchoolId(schoolId)
                .map(this::toDto);
    }

    public Mono<MonitorDto> create(CreateMonitorRequest request) {
        return monitorRepository.existsByLicenseNumber(request.getLicenseNumber())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new RuntimeException("Un moniteur avec ce numéro de licence existe déjà"));
                    }
                    Monitor monitor = Monitor.builder()
                            .schoolId(request.getSchoolId())
                            .firstName(request.getFirstName())
                            .lastName(request.getLastName())
                            .licenseNumber(request.getLicenseNumber())
                            .phoneNumber(request.getPhoneNumber())
                            .status(request.getStatus() != null ? Monitor.MonitorStatus.valueOf(request.getStatus())
                                    : Monitor.MonitorStatus.ACTIVE)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return monitorRepository.save(monitor);
                })
                .map(this::toDto);
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
        return MonitorDto.builder()
                .id(monitor.getId())
                .schoolId(monitor.getSchoolId())
                .firstName(monitor.getFirstName())
                .lastName(monitor.getLastName())
                .licenseNumber(monitor.getLicenseNumber())
                .phoneNumber(monitor.getPhoneNumber())
                .status(monitor.getStatus().name())
                .createdAt(monitor.getCreatedAt())
                .build();
    }
}
