package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.user.CreateUserRequest;
import com.example.backend.dto.user.UserResponse;
import com.example.backend.security.KeycloakAdminService;

@ExtendWith(MockitoExtension.class)
class UserProvisioningServiceUnitTest {

  @Mock
  private KeycloakAdminService keycloakAdminService;

  @Mock
  private UserService userService;

  @InjectMocks
  private UserProvisioningService service;

  @Test
  void registerUser_success() {

    RegisterRequest request = new RegisterRequest(
        "john",
        "john@x.com",
        "password");

    when(keycloakAdminService.createUser(
        "john",
        "john@x.com",
        "password")).thenReturn("kc-1");

    when(userService.createApplicationUser(
        "john",
        "john@x.com",
        "kc-1",
        null,
        "USER")).thenReturn(
            new UserResponse(
                1L,
                "john",
                "john@x.com",
                "USER"));

    var result = service.registerUser(request);

    assertEquals(
        "USER",
        result.getRole());

    verify(keycloakAdminService)
        .assignRealmRole(
            "kc-1",
            "USER");

    verify(userService)
        .createApplicationUser(
            "john",
            "john@x.com",
            "kc-1",
            null,
            "USER");
  }

  @Test
  void registerUser_applicationFailure_deletesKeycloakUser() {

    RegisterRequest request = new RegisterRequest(
        "john",
        "john@x.com",
        "password");

    when(keycloakAdminService.createUser(
        anyString(),
        anyString(),
        anyString())).thenReturn("kc-1");

    when(userService.createApplicationUser(
        anyString(),
        anyString(),
        anyString(),
        isNull(),
        eq("USER"))).thenThrow(
            new RuntimeException("DB failure"));

    assertThrows(
        RuntimeException.class,
        () -> service.registerUser(request));

    verify(keycloakAdminService)
        .deleteUser("kc-1");
  }

  @Test
  void createUser_assignsRequestedRole() {

    CreateUserRequest request = new CreateUserRequest(
        "john",
        "john@x.com",
        "password",
        null,
        "TENANT");

    when(keycloakAdminService.createUser(
        "john",
        "john@x.com",
        "password")).thenReturn("kc-1");

    when(userService.createApplicationUser(
        "john",
        "john@x.com",
        "kc-1",
        null,
        "TENANT")).thenReturn(
            new UserResponse(
                1L,
                "john",
                "john@x.com",
                "TENANT"));

    var result = service.createUser(request);

    assertEquals(
        "TENANT",
        result.getRole());

    verify(keycloakAdminService)
        .assignRealmRole(
            "kc-1",
            "TENANT");
  }
}
