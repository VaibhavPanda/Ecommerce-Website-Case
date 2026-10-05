package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.entity.*;
import com.example.backend.exception.*;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.KeycloakAdminService;

@ExtendWith(MockitoExtension.class)
class UserServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TenantService tenantService;

    @Mock
    private RoleService roleService;

    @Mock
    private KeycloakAdminService keycloakAdminService;

    @InjectMocks
    private UserService service;

    private Role userRole() {
        return new Role(1L, "USER");
    }

    private Role tenantRole() {
        return new Role(2L, "TENANT");
    }

    private User user() {
        return new User(
                1L,
                "john",
                "john@x.com",
                "kc-1",
                null,
                userRole()
        );
    }

    private Tenant tenant() {
        return new Tenant(
                5L,
                "Nike",
                "nike",
                true
        );
    }

    @Test
    void createApplicationUser_userSuccess() {

      when(userRepository
          .existsByUsername("john"))
          .thenReturn(false);

      when(userRepository
          .existsByEmail("john@x.com"))
          .thenReturn(false);

      when(roleService
          .getRoleByName("USER"))
          .thenReturn(userRole());

      when(userRepository
          .save(any(User.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      var result = service.createApplicationUser(
          "john",
          "john@x.com",
          "kc",
          null,
          "USER");

      assertEquals(
          "john",
          result.getUsername());

      assertEquals(
          "USER",
          result.getRole());
    }

    @Test
    void createApplicationUser_duplicateUsername() {

        when(userRepository
                .existsByUsername("john"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> service.createApplicationUser(
                        "john",
                        "x",
                        "kc",
                        null,
                        "USER"
                )
        );
    }

    @Test
    void createApplicationUser_duplicateEmail() {

        when(userRepository
                .existsByUsername("john"))
                .thenReturn(false);

        when(userRepository
                .existsByEmail("x"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> service.createApplicationUser(
                        "john",
                        "x",
                        "kc",
                        null,
                        "USER"
                )
        );
    }

    @Test
    void createApplicationUser_invalidRole() {

        when(userRepository
                .existsByUsername("john"))
                .thenReturn(false);

        when(userRepository
                .existsByEmail("x"))
                .thenReturn(false);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.createApplicationUser(
                        "john",
                        "x",
                        "kc",
                        null,
                        "MANAGER"
                )
        );
    }

    @Test
    void createApplicationUser_tenantRequiresDomain() {

        when(userRepository
                .existsByUsername("john"))
                .thenReturn(false);

        when(userRepository
                .existsByEmail("x"))
                .thenReturn(false);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.createApplicationUser(
                        "john",
                        "x",
                        "kc",
                        null,
                        "TENANT"
                )
        );
    }

    @Test
    void createApplicationUser_tenantSuccess() {

        Tenant tenant = tenant();

        when(userRepository
                .existsByUsername("john"))
                .thenReturn(false);

        when(userRepository
                .existsByEmail("x"))
                .thenReturn(false);

        when(tenantService
                .getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(roleService
                .getRoleByName("TENANT"))
                .thenReturn(tenantRole());

        when(userRepository
                .save(any(User.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        var result =
                service.createApplicationUser(
                        "john",
                        "x",
                        "kc",
                        " nike ",
                        "tenant"
                );

        assertEquals(
                "TENANT",
                result.getRole()
        );

        verify(tenantService)
                .getTenantByDomain("nike");
    }

    @Test
    void getUserByUsername_notFound() {

        when(userRepository
                .findByUsername("x"))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> service.getUserByUsername("x")
        );
    }

    @Test
    void getUserByKeycloakUserId_success() {

        User user = user();

        when(userRepository
                .findByKeycloakUserId("kc-1"))
                .thenReturn(Optional.of(user));

        assertSame(
                user,
                service.getUserByKeycloakUserId("kc-1")
        );
    }

    @Test
    void getUsersByTenant_success() {

        Tenant tenant = tenant();

        when(tenantService
                .getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(userRepository
                .findByTenant(tenant))
                .thenReturn(
                        List.of(user())
                );

        assertEquals(
                1,
                service.getUsersByTenant("nike")
                        .size()
        );
    }

    @Test
    void makeUserTenant_success() {

        User user = user();
        Tenant tenant = tenant();

        when(userRepository
                .findById(1L))
                .thenReturn(Optional.of(user));

        when(tenantService
                .createOrReactivateTenant(
                        "Nike",
                        "nike"
                ))
                .thenReturn(tenant);

        when(roleService
                .getRoleByName("TENANT"))
                .thenReturn(tenantRole());

        when(userRepository
                .save(user))
                .thenReturn(user);

        var result =
                service.makeUserTenant(
                        1L,
                        " Nike ",
                        " nike "
                );

        assertEquals(
                "TENANT",
                result.getRole()
        );

        assertSame(
                tenant,
                user.getTenant()
        );

        verify(keycloakAdminService)
                .removeRealmRole(
                        "kc-1",
                        "USER"
                );

        verify(keycloakAdminService)
                .assignRealmRole(
                        "kc-1",
                        "TENANT"
                );
    }

    @Test
    void makeUserTenant_alreadyTenant_rejected() {

        User user = user();

        user.setRole(tenantRole());

        when(userRepository
                .findById(1L))
                .thenReturn(Optional.of(user));

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> service.makeUserTenant(
                        1L,
                        "Nike",
                        "nike"
                )
        );
    }

    @Test
    void removeUserTenant_success() {

        User user = user();
        Tenant tenant = tenant();

        user.setRole(tenantRole());
        user.setTenant(tenant);

        Role userRole = userRole();

        when(userRepository
                .findById(1L))
                .thenReturn(Optional.of(user));

        when(roleService
                .getRoleByName("USER"))
                .thenReturn(userRole);

        when(userRepository
                .save(user))
                .thenReturn(user);

        var result =
                service.removeUserTenant(1L);

        assertEquals(
                "USER",
                result.getRole()
        );

        assertNull(
                user.getTenant()
        );

        verify(tenantService)
                .deleteTenant(5L);

        verify(keycloakAdminService)
                .removeRealmRole(
                        "kc-1",
                        "TENANT"
                );

        verify(keycloakAdminService)
                .assignRealmRole(
                        "kc-1",
                        "USER"
                );
    }
}
