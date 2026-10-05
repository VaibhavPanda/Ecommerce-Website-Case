package com.example.backend.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.example.backend.entity.Role;
import com.example.backend.entity.Tenant;
import com.example.backend.entity.User;

@ExtendWith(MockitoExtension.class)
class TenantAccessServiceUnitTest {

  @Mock
  private CurrentUserService currentUserService;

  @InjectMocks
  private TenantAccessService service;

  private User user(
      String role,
      Tenant tenant) {

    return new User(
        1L,
        "user",
        "user@test.com",
        "kc",
        tenant,
        new Role(1L, role));
  }

  @Test
  void adminCanAccessAnyTenant() {

    when(currentUserService
        .getCurrentUser())
        .thenReturn(
            user(
                "ADMIN",
                null));

    assertDoesNotThrow(
        () -> service
            .validateTenantAccess("nike"));
  }

  @Test
  void matchingTenantAllowed() {

    Tenant tenant = new Tenant(
        1L,
        "Nike",
        "nike",
        true);

    when(currentUserService
        .getCurrentUser())
        .thenReturn(
            user(
                "TENANT",
                tenant));

    assertDoesNotThrow(
        () -> service
            .validateTenantAccess("NIKE"));
  }

  @Test
  void noTenantDenied() {

    when(currentUserService
        .getCurrentUser())
        .thenReturn(
            user(
                "USER",
                null));

    assertThrows(
        AccessDeniedException.class,
        () -> service
            .validateTenantAccess("nike"));
  }

  @Test
  void inactiveTenantDenied() {

    Tenant tenant = new Tenant(
        1L,
        "Nike",
        "nike",
        false);

    when(currentUserService
        .getCurrentUser())
        .thenReturn(
            user(
                "TENANT",
                tenant));

    assertThrows(
        AccessDeniedException.class,
        () -> service
            .validateTenantAccess("nike"));
  }

  @Test
  void differentTenantDenied() {

    Tenant tenant = new Tenant(
        1L,
        "Nike",
        "nike",
        true);

    when(currentUserService
        .getCurrentUser())
        .thenReturn(
            user(
                "TENANT",
                tenant));

    assertThrows(
        AccessDeniedException.class,
        () -> service
            .validateTenantAccess("adidas"));
  }
}
