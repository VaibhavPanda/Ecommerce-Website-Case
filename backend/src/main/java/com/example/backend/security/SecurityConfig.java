package com.example.backend.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  //enables security method
  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http)
      throws Exception {

    http
        .csrf(csrf -> csrf.disable())

        //used for cors cross origin reference
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))

        .authorizeHttpRequests(auth -> auth

            .requestMatchers(HttpMethod.OPTIONS, "/**")
            .permitAll()

            .requestMatchers(
                "/api/test",
                "/api/products/**",
                "/api/products",
                "/api/categories")
            .permitAll()

            .requestMatchers(
                HttpMethod.POST,
                "/api/auth/register")
            .permitAll()

            .anyRequest()
            .authenticated())

            //use JWT
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {
          JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

          //convert the roles
          converter.setJwtGrantedAuthoritiesConverter(
              new KeycloakRoleConverter());

          jwt.jwtAuthenticationConverter(converter);
        }));

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(
        List.of("http://localhost:5173"));

        //allow these methods for FE
    configuration.setAllowedMethods(
        List.of(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS"));

            //allow these headers
    configuration.setAllowedHeaders(
        List.of("*"));

    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration(
        "/**",
        configuration);

    return source;
  }
}
