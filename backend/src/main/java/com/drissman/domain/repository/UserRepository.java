package com.drissman.domain.repository;

import com.drissman.domain.entity.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface UserRepository extends ReactiveCrudRepository<User, UUID> {
    Mono<User> findByEmail(String email);

    @org.springframework.data.r2dbc.repository.Query("SELECT * FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1")
    Mono<User> findFirstByEmailIgnoreCase(String email);

    Mono<Boolean> existsByEmail(String email);
}
