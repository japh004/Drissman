package com.drissman.service;

import com.drissman.api.dto.AvailabilityDto;
import com.drissman.api.dto.CreateAvailabilityRequest;
import com.drissman.domain.entity.Availability;
import com.drissman.domain.repository.AvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;

    public Mono<AvailabilityDto> create(CreateAvailabilityRequest request) {
        Availability availability = Availability.builder()
                .schoolId(request.getSchoolId())
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .maxBookings(request.getMaxBookings())
                .build();

        return availabilityRepository.save(availability)
                .map(this::toDto);
    }

    public Flux<AvailabilityDto> findBySchoolId(UUID schoolId) {
        return availabilityRepository.findBySchoolId(schoolId)
                .map(this::toDto);
    }

    public Mono<AvailabilityDto> update(UUID id, CreateAvailabilityRequest request) {
        return availabilityRepository.findById(id)
                .flatMap(availability -> {
                    availability.setDayOfWeek(request.getDayOfWeek());
                    availability.setStartTime(request.getStartTime());
                    availability.setEndTime(request.getEndTime());
                    availability.setMaxBookings(request.getMaxBookings());
                    return availabilityRepository.save(availability);
                })
                .map(this::toDto);
    }

    public Mono<Void> delete(UUID id) {
        return availabilityRepository.deleteById(id);
    }

    private AvailabilityDto toDto(Availability a) {
        return AvailabilityDto.builder()
                .id(a.getId())
                .schoolId(a.getSchoolId())
                .dayOfWeek(a.getDayOfWeek())
                .dayName(AvailabilityDto.getDayName(a.getDayOfWeek()))
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .maxBookings(a.getMaxBookings())
                .build();
    }
}
