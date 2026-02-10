package com.drissman.service.mapper;

import com.drissman.api.dto.BookingDto;
import com.drissman.domain.entity.Booking;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.SchoolRepository;
import com.drissman.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class BookingMapper {

    private final SchoolRepository schoolRepository;
    private final OfferRepository offerRepository;
    private final UserRepository userRepository;

    public Mono<BookingDto> enrichWithDetails(Booking booking) {
        Mono<BookingDto.SchoolInfo> schoolInfo = schoolRepository.findById(booking.getSchoolId())
                .map(school -> BookingDto.SchoolInfo.builder()
                        .id(school.getId())
                        .name(school.getName())
                        .build());

        Mono<BookingDto.OfferInfo> offerInfo = offerRepository.findById(booking.getOfferId())
                .map(offer -> BookingDto.OfferInfo.builder()
                        .id(offer.getId())
                        .name(offer.getName())
                        .price(offer.getPrice())
                        .build());

        Mono<BookingDto.UserInfo> userInfo = userRepository.findById(booking.getUserId())
                .map(user -> BookingDto.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getFirstName() + " " + user.getLastName())
                        .email(user.getEmail())
                        .build())
                .defaultIfEmpty(BookingDto.UserInfo.builder().build());

        return Mono.zip(schoolInfo, offerInfo, userInfo)
                .map(tuple -> BookingDto.builder()
                        .id(booking.getId())
                        .school(tuple.getT1())
                        .offer(tuple.getT2())
                        .user(tuple.getT3())
                        .date(booking.getBookingDate())
                        .time(booking.getBookingTime())
                        .status(booking.getStatus().name())
                        .createdAt(booking.getCreatedAt())
                        .build());
    }
}
