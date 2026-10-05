package com.example.backend.security;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

class KeycloakRoleConverterUnitTest {

  private final KeycloakRoleConverter converter = new KeycloakRoleConverter();

  private Jwt jwt(
      Map<String, Object> claims) {

    return Jwt
        .withTokenValue("token")
        .header("alg", "none")
        .claim("realm_access", claims)
        .build();
  }

  @Test
  void convertsRealmRoles() {

    var result = converter.convert(
        jwt(
            Map.of(
                "roles",
                List.of(
                    "USER",
                    "TENANT"))));

    assertEquals(
        List.of(
            "ROLE_USER",
            "ROLE_TENANT"),
        result.stream()
            .map(
                GrantedAuthority::getAuthority)
            .toList());
  }

  @Test
  void missingRealmAccess_returnsEmpty() {

    Jwt jwt = Jwt
        .withTokenValue("token")
        .header("alg", "none")
        .claim(
            "sub",
            "test-user")
        .build();

    assertTrue(
        converter
            .convert(jwt)
            .isEmpty());
  }

  @Test
  void missingRoles_returnsEmpty() {

    assertTrue(
        converter
            .convert(
                jwt(Map.of()))
            .isEmpty());
  }
}
