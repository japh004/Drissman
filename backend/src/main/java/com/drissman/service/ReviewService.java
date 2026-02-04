package com.drissman.service;

import com.drissman.api.dto.CreateReviewRequest;
import com.drissman.api.dto.ReviewDto;
import com.drissman.domain.entity.Review;
import com.drissman.domain.entity.School;
import com.drissman.domain.entity.Booking;
import com.drissman.domain.repository.BookingRepository;
import com.drissman.domain.repository.ReviewRepository;
import com.drissman.domain.repository.SchoolRepository;
import com.drissman.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

        private final ReviewRepository reviewRepository;
        private final UserRepository userRepository;
        private final SchoolRepository schoolRepository;
        private final BookingRepository bookingRepository;

        public Mono<ReviewDto> create(UUID userId, CreateReviewRequest request) {
                // 1. Verify user has a confirmed or completed booking
                return bookingRepository
                                .existsByUserIdAndSchoolIdAndStatus(userId, request.getSchoolId(),
                                                Booking.BookingStatus.CONFIRMED)
                                .flatMap(confirmed -> {
                                        if (confirmed)
                                                return Mono.just(true);
                                        return bookingRepository.existsByUserIdAndSchoolIdAndStatus(userId,
                                                        request.getSchoolId(), Booking.BookingStatus.COMPLETED);
                                })
                                .flatMap(hasBooking -> {
                                        if (!hasBooking) {
                                                return Mono.error(new RuntimeException(
                                                                "You must have a confirmed booking with this school to leave a review."));
                                        }

                                        // 2. Check if user already reviewed this school
                                        return reviewRepository.findByUserIdAndSchoolId(userId, request.getSchoolId())
                                                        .flatMap(existing -> Mono
                                                                        .<ReviewDto>error(new RuntimeException(
                                                                                        "You have already reviewed this school")))
                                                        .switchIfEmpty(Mono.defer(() -> {
                                                                Review review = Review.builder()
                                                                                .userId(userId)
                                                                                .schoolId(request.getSchoolId())
                                                                                .rating(request.getRating())
                                                                                .comment(request.getComment())
                                                                                .verified(false)
                                                                                .build();

                                                                return reviewRepository.save(review)
                                                                                .flatMap(saved -> enrichWithUserName(
                                                                                                saved)
                                                                                                .flatMap(dto -> updateSchoolRating(
                                                                                                                request.getSchoolId())
                                                                                                                .thenReturn(dto)));
                                                        }));
                                });
        }

        public Flux<ReviewDto> findBySchoolId(UUID schoolId) {
                return reviewRepository.findBySchoolId(schoolId)
                                .flatMap(this::enrichWithUserName);
        }

        public Mono<ReviewDto> verifyReview(UUID reviewId) {
                return reviewRepository.findById(reviewId)
                                .flatMap(review -> {
                                        review.setVerified(true);
                                        return reviewRepository.save(review);
                                })
                                .flatMap(this::enrichWithUserName);
        }

        public Mono<Void> delete(UUID reviewId) {
                return reviewRepository.findById(reviewId)
                                .flatMap(review -> reviewRepository.deleteById(reviewId)
                                                .then(updateSchoolRating(review.getSchoolId())));
        }

        private Mono<ReviewDto> enrichWithUserName(Review review) {
                return userRepository.findById(review.getUserId())
                                .map(user -> ReviewDto.builder()
                                                .id(review.getId())
                                                .userId(review.getUserId())
                                                .userName(user.getFirstName() + " " + user.getLastName().charAt(0)
                                                                + ".")
                                                .schoolId(review.getSchoolId())
                                                .rating(review.getRating())
                                                .comment(review.getComment())
                                                .verified(review.getVerified())
                                                .createdAt(review.getCreatedAt())
                                                .build())
                                .switchIfEmpty(Mono.just(ReviewDto.builder()
                                                .id(review.getId())
                                                .userId(review.getUserId())
                                                .userName("Anonyme")
                                                .schoolId(review.getSchoolId())
                                                .rating(review.getRating())
                                                .comment(review.getComment())
                                                .verified(review.getVerified())
                                                .createdAt(review.getCreatedAt())
                                                .build()));
        }

        private Mono<Void> updateSchoolRating(UUID schoolId) {
                return reviewRepository.getAverageRatingBySchoolId(schoolId)
                                .flatMap(avgRating -> schoolRepository.findById(schoolId)
                                                .flatMap(school -> {
                                                        school.setRating(BigDecimal.valueOf(avgRating));
                                                        return schoolRepository.save(school);
                                                }))
                                .then();
        }
}
