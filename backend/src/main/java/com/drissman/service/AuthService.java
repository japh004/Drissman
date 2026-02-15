package com.drissman.service;

import com.drissman.api.dto.AuthResponse;
import com.drissman.api.dto.LoginRequest;
import com.drissman.api.dto.RegisterRequest;
import com.drissman.domain.entity.School;
import com.drissman.domain.entity.User;
import com.drissman.domain.repository.SchoolRepository;
import com.drissman.domain.repository.UserRepository;
import com.drissman.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public Mono<AuthResponse> register(RegisterRequest request) {
        return userRepository.existsByEmail(request.getEmail())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists"));
                    }

                    User.Role roleTemp;
                    try {
                        roleTemp = User.Role.valueOf(request.getRole().toUpperCase());
                    } catch (IllegalArgumentException | NullPointerException e) {
                        roleTemp = User.Role.STUDENT; // Fallback to STUDENT if role is invalid or not yet in enum
                    }
                    final User.Role userRole = roleTemp;

                    if (userRole == User.Role.SCHOOL_ADMIN) {
                        School school = School.builder()
                                .name(request.getSchoolName() != null ? request.getSchoolName()
                                        : "Ma Nouvelle Auto-École")
                                .address("Adresse à compléter")
                                .city("Yaoundé") // Default city
                                .build();

                        return schoolRepository.save(school)
                                .flatMap(savedSchool -> {
                                    User user = User.builder()
                                            .email(request.getEmail())
                                            .password(passwordEncoder.encode(request.getPassword()))
                                            .firstName(request.getFirstName())
                                            .lastName(request.getLastName())
                                            .role(userRole)
                                            .schoolId(savedSchool.getId())
                                            .build();
                                    return userRepository.save(user);
                                })
                                .map(this::createAuthResponse);
                    } else {
                        // STUDENT and VISITOR: simple user creation without school
                        User user = User.builder()
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .role(userRole)
                                .build();

                        return userRepository.save(user)
                                .map(this::createAuthResponse);
                    }
                });
    }

    public Mono<AuthResponse> login(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .switchIfEmpty(Mono.error(new RuntimeException("Invalid credentials")))
                .flatMap(user -> {
                    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        return Mono.error(new RuntimeException("Invalid credentials"));
                    }
                    return Mono.just(createAuthResponse(user));
                });
    }

    private AuthResponse createAuthResponse(User user) {
        String token = jwtTokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name());

        return AuthResponse.builder()
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole().name())
                        .schoolId(user.getSchoolId())
                        .build())
                .token(token)
                .build();
    }
}
