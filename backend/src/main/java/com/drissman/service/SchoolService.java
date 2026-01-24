package com.drissman.service;

import com.drissman.api.dto.SchoolDto;
import com.drissman.domain.entity.School;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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
                    .map(com.drissman.domain.entity.Offer::getPrice)
                    .collectList()
                    .map(prices -> {
                        Integer minPrice = prices.stream()
                                .min(Integer::compare)
                                .orElse(150000); // Fallback price
                        dto.setMinPrice(minPrice);
                        return dto;
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
