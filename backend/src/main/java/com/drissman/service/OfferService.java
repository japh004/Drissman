package com.drissman.service;

import com.drissman.api.dto.CreateOfferRequest;
import com.drissman.api.dto.SchoolDto;
import com.drissman.api.dto.UpdateOfferRequest;
import com.drissman.domain.entity.Offer;
import com.drissman.domain.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;

    public Mono<SchoolDto.OfferDto> create(CreateOfferRequest request) {
        Offer offer = Offer.builder()
                .schoolId(request.getSchoolId())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .hours(request.getHours())
                .build();

        return offerRepository.save(offer)
                .map(this::toDto);
    }

    public Flux<SchoolDto.OfferDto> findBySchoolId(UUID schoolId) {
        return offerRepository.findBySchoolId(schoolId)
                .map(this::toDto);
    }

    public Mono<SchoolDto.OfferDto> findById(UUID id) {
        return offerRepository.findById(id)
                .map(this::toDto);
    }

    public Mono<SchoolDto.OfferDto> update(UUID id, UpdateOfferRequest request) {
        return offerRepository.findById(id)
                .flatMap(offer -> {
                    if (request.getName() != null)
                        offer.setName(request.getName());
                    if (request.getDescription() != null)
                        offer.setDescription(request.getDescription());
                    if (request.getPrice() != null)
                        offer.setPrice(request.getPrice());
                    if (request.getHours() != null)
                        offer.setHours(request.getHours());
                    return offerRepository.save(offer);
                })
                .map(this::toDto);
    }

    public Mono<Void> delete(UUID id) {
        return offerRepository.deleteById(id);
    }

    private SchoolDto.OfferDto toDto(Offer offer) {
        return SchoolDto.OfferDto.builder()
                .id(offer.getId())
                .name(offer.getName())
                .description(offer.getDescription())
                .price(offer.getPrice())
                .hours(offer.getHours())
                .build();
    }
}
