package com.drissman.api.controller;

import com.drissman.api.dto.CreateReviewRequest;
import com.drissman.api.dto.ReviewDto;
import com.drissman.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Create a review (one per user per school)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ReviewDto> create(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateReviewRequest request) {
        return reviewService.create(userId, request);
    }

    /**
     * Get all reviews for a school
     */
    @GetMapping("/school/{schoolId}")
    public Flux<ReviewDto> getBySchool(@PathVariable UUID schoolId) {
        return reviewService.findBySchoolId(schoolId);
    }

    /**
     * Verify a review (admin only)
     */
    @PatchMapping("/{id}/verify")
    public Mono<ReviewDto> verify(@PathVariable UUID id) {
        return reviewService.verifyReview(id);
    }

    /**
     * Delete a review
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable UUID id) {
        return reviewService.delete(id);
    }
}
