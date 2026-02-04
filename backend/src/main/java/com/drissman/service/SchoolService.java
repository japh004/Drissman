package com.drissman.service;

import com.drissman.api.dto.SchoolDto;
import com.drissman.domain.entity.School;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SchoolService {

        private final SchoolRepository schoolRepository;
        private final OfferRepository offerRepository;

        public Flux<SchoolDto> findAll(String city) {
                Flux<School> schools = (city != null && !city.isBlank())
                                ? schoolRepository.findByCityOrderByRatingDesc(city)
                                : schoolRepository.findAll();

                return schools.flatMap(school -> {
                        SchoolDto dto = toDto(school);
                        return offerRepository.findBySchoolId(school.getId())
                                        .collectList()
                                        .flatMap(offers -> {
                                                // Filter out schools without offers, unless they are demo schools
                                                if (offers.isEmpty() && !Boolean.TRUE.equals(school.getIsDemo())) {
                                                        return Mono.empty(); // Skip this school
                                                }

                                                // Calculate min price
                                                Integer minPrice = offers.stream()
                                                                .map(com.drissman.domain.entity.Offer::getPrice)
                                                                .min(java.util.Comparator.naturalOrder())
                                                                .orElse(150000); // Fallback price for demo schools
                                                dto.setMinPrice(minPrice);

                                                // Map offers to DTOs
                                                List<SchoolDto.OfferDto> offerDtos = offers.stream()
                                                                .map(offer -> SchoolDto.OfferDto.builder()
                                                                                .id(offer.getId())
                                                                                .name(offer.getName())
                                                                                .description(offer.getDescription())
                                                                                .price(offer.getPrice())
                                                                                .hours(offer.getHours())
                                                                                .permitType(offer.getPermitType())
                                                                                .build())
                                                                .toList();
                                                dto.setOffers(offerDtos);

                                                return Mono.just(dto);
                                        });
                });
        }

        public Mono<SchoolDto> findById(UUID id) {
                return schoolRepository.findById(id)
                                .flatMap(school -> offerRepository.findBySchoolId(id)
                                                .map(offer -> SchoolDto.OfferDto.builder()
                                                                .id(offer.getId())
                                                                .name(offer.getName())
                                                                .description(offer.getDescription())
                                                                .price(offer.getPrice())
                                                                .hours(offer.getHours())
                                                                .permitType(offer.getPermitType())
                                                                .build())
                                                .collectList()
                                                .map(offers -> {
                                                        SchoolDto dto = toDto(school);
                                                        dto.setOffers(offers);
                                                        return dto;
                                                }));
        }

        private SchoolDto toDto(School school) {
                return SchoolDto.builder()
                                .id(school.getId())
                                .name(school.getName())
                                .description(school.getDescription())
                                .address(school.getAddress())
                                .city(school.getCity())
                                .phone(school.getPhone())
                                .email(school.getEmail())
                                .rating(school.getRating())
                                .imageUrl(school.getImageUrl())
                                .build();
        }
}
