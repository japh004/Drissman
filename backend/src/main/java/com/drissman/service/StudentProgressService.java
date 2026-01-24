package com.drissman.service;

import com.drissman.api.dto.StudentProgressDto;
import com.drissman.domain.entity.Booking;
import com.drissman.domain.repository.BookingRepository;
import com.drissman.domain.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentProgressService {

    private final BookingRepository bookingRepository;

    public Mono<StudentProgressDto> getProgress(UUID userId) {
        return bookingRepository.findByUserId(userId)
                .collectList()
                .flatMap(bookings -> {
                    // Calculate Code de la Route progress
                    // Assume code-related bookings contain "Code" in the offer name
                    int codeExams = (int) bookings.stream()
                            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED ||
                                    b.getStatus() == Booking.BookingStatus.CONFIRMED)
                            .count();
                    int codeTotalExams = 20; // Target: 20 mock exams
                    int codeProgress = Math.min((codeExams * 100) / Math.max(codeTotalExams, 1), 100);

                    // Calculate Conduite progress based on completed driving hours
                    // For now, we'll estimate based on confirmed bookings
                    int conduiteHours = (int) bookings.stream()
                            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                            .count() * 2; // Estimate 2h per booking
                    int conduiteTotalHours = 20; // Standard 20h package
                    int conduiteProgress = Math.min((conduiteHours * 100) / Math.max(conduiteTotalHours, 1), 100);

                    // Find next scheduled lesson/exam
                    String nextExamDate = "Non planifié";
                    String nextExamType = null;

                    var upcomingBooking = bookings.stream()
                            .filter(b -> b.getBookingDate() != null &&
                                    b.getBookingDate().isAfter(LocalDate.now().minusDays(1)) &&
                                    (b.getStatus() == Booking.BookingStatus.PENDING ||
                                            b.getStatus() == Booking.BookingStatus.CONFIRMED))
                            .findFirst();

                    if (upcomingBooking.isPresent()) {
                        nextExamDate = upcomingBooking.get().getBookingDate().toString();
                        nextExamType = "CONDUITE";
                    }

                    return Mono.just(StudentProgressDto.builder()
                            .codeProgress(codeProgress)
                            .codeExamsCompleted(codeExams)
                            .codeTotalExams(codeTotalExams)
                            .conduiteProgress(conduiteProgress)
                            .conduiteHoursCompleted(conduiteHours)
                            .conduiteTotalHours(conduiteTotalHours)
                            .nextExamDate(nextExamDate)
                            .nextExamType(nextExamType)
                            .build());
                });
    }
}
