package com.drissman.domain.repository;

import com.drissman.domain.entity.School;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface SchoolRepository extends ReactiveCrudRepository<School, UUID> {
    Flux<School> findByCity(String city);

    @Query("SELECT * FROM schools WHERE city ILIKE :city ORDER BY rating DESC")
    Flux<School> findByCityOrderByRatingDesc(String city);
}
