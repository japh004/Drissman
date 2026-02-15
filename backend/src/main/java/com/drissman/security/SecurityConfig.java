package com.drissman.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CorsWebFilter runs BEFORE Spring Security (highest precedence).
     * This ensures preflight OPTIONS requests always get proper CORS headers,
     * regardless of authentication rules.
     */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
                "https://drissman0.vercel.app",
                "http://localhost:3000"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setExposedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                // Disable Spring Security's built-in CORS — we handle it via CorsWebFilter
                // above
                .cors(ServerHttpSecurity.CorsSpec::disable)
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .addFilterAt(jwtAuthenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .authorizeExchange(auth -> auth
                        // Allow all preflight requests
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()

                        // Public endpoints — no auth required
                        .pathMatchers("/api/auth/**").permitAll()
                        .pathMatchers("/api/health").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/schools/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/offers/**").permitAll()

                        // Demo-mode endpoints
                        .pathMatchers(HttpMethod.GET, "/api/partner/stats").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/partner/enrollments").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/student/progress").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/availabilities/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/monitors/me").permitAll()

                        // All other endpoints require authentication
                        .anyExchange().authenticated())
                .build();
    }
}
