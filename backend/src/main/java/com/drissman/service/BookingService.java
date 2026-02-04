package com.drissman.service;

import com.drissman.api.dto.BookingDto;
import com.drissman.api.dto.CreateBookingRequest;
import com.drissman.domain.entity.Booking;
import com.drissman.domain.entity.Invoice;
import com.drissman.domain.repository.BookingRepository;
import com.drissman.domain.repository.InvoiceRepository;
import com.drissman.domain.repository.OfferRepository;
import com.drissman.domain.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

        private final BookingRepository bookingRepository;
        private final SchoolRepository schoolRepository;
        private final OfferRepository offerRepository;
        private final InvoiceService invoiceService;
        private final InvoiceRepository invoiceRepository;

        public Mono<BookingDto> create(UUID userId, CreateBookingRequest request) {
                Booking booking = Booking.builder()
                                .userId(userId)
                                .schoolId(request.getSchoolId())
                                .offerId(request.getOfferId())
                                .bookingDate(LocalDate.parse(request.getDate()))
                                .bookingTime(request.getTime())
                                .status(Booking.BookingStatus.PENDING)
                                .build();

                // Just save the booking - NO invoice created yet
                // Invoice will be created when school confirms
                return bookingRepository.save(booking)
                                .flatMap(this::enrichWithDetails);
        }

        public Flux<BookingDto> findByUserId(UUID userId) {
                return bookingRepository.findByUserId(userId)
                                .flatMap(this::enrichWithDetails);
        }

        public Flux<BookingDto> findBySchoolId(UUID schoolId) {
                return bookingRepository.findBySchoolId(schoolId)
                                .flatMap(this::enrichWithDetails);
        }

        public Mono<BookingDto> updateStatus(UUID bookingId, Booking.BookingStatus status) {
                return bookingRepository.findById(bookingId)
                                .flatMap(booking -> {
                                        booking.setStatus(status);
                                        return bookingRepository.save(booking);
                                })
                                .flatMap(savedBooking -> {
                                        // If booking is confirmed, create invoice and mark as PAID
                                        if (status == Booking.BookingStatus.CONFIRMED) {
                                                return offerRepository.findById(savedBooking.getOfferId())
                                                                .flatMap(offer -> invoiceService.createForBooking(
                                                                                savedBooking, offer.getPrice()))
                                                                .flatMap(invoice -> {
                                                                        invoice.setStatus(Invoice.InvoiceStatus.PAID);
                                                                        invoice.setPaidAt(LocalDateTime.now());
                                                                        return invoiceRepository.save(invoice);
                                                                })
                                                                .thenReturn(savedBooking);
                                        }
                                        return Mono.just(savedBooking);
                                })
                                .flatMap(this::enrichWithDetails);
        }

        private Mono<BookingDto> enrichWithDetails(Booking booking) {
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

                return Mono.zip(schoolInfo, offerInfo)
                                .map(tuple -> BookingDto.builder()
                                                .id(booking.getId())
                                                .school(tuple.getT1())
                                                .offer(tuple.getT2())
                                                .date(booking.getBookingDate())
                                                .time(booking.getBookingTime())
                                                .status(booking.getStatus().name())
                                                .build());
        }
}
