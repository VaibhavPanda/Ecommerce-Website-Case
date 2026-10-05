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

import com.example.backend.entity.Tenant;
import com.example.backend.exception.ResourceAlreadyExistsException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.TenantRepository;

@ExtendWith(MockitoExtension.class)
class TenantServiceUnitTest {

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private TenantService service;

    @Test
    void createTenant_success() {

        Tenant tenant =
                new Tenant(null, "Nike", "nike", false);

        when(tenantRepository.existsByName("Nike"))
                .thenReturn(false);

        when(tenantRepository.existsByDomain("nike"))
                .thenReturn(false);

        when(tenantRepository.save(tenant))
                .thenReturn(tenant);

        Tenant result = service.createTenant(tenant);

        assertTrue(result.isActive());

        verify(tenantRepository).save(tenant);
    }

    @Test
    void createTenant_duplicateName_rejected() {

        Tenant tenant =
                new Tenant(null, "Nike", "nike", false);

        when(tenantRepository.existsByName("Nike"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> service.createTenant(tenant)
        );

        verify(tenantRepository, never())
                .save(any());
    }

    @Test
    void createTenant_duplicateDomain_rejected() {

        Tenant tenant =
                new Tenant(null, "Nike", "nike", false);

        when(tenantRepository.existsByName("Nike"))
                .thenReturn(false);

        when(tenantRepository.existsByDomain("nike"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> service.createTenant(tenant)
        );
    }

    @Test
    void getAllTenants_returnsAll() {

        when(tenantRepository.findAll())
                .thenReturn(List.of(
                        new Tenant(),
                        new Tenant()
                ));

        assertEquals(
                2,
                service.getAllTenants().size()
        );
    }

    @Test
    void getTenantById_notFound() {

        when(tenantRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> service.getTenantById(1L)
        );
    }

    @Test
    void getTenantByDomain_success() {

        Tenant tenant =
                new Tenant(
                        1L,
                        "Nike",
                        "nike",
                        true
                );

        when(tenantRepository.findByDomain("nike"))
                .thenReturn(Optional.of(tenant));

        assertSame(
                tenant,
                service.getTenantByDomain("nike")
        );
    }

    @Test
    void deleteTenant_softDeletes() {

        Tenant tenant =
                new Tenant(
                        1L,
                        "Nike",
                        "nike",
                        true
                );

        when(tenantRepository.findById(1L))
                .thenReturn(Optional.of(tenant));

        service.deleteTenant(1L);

        assertFalse(tenant.isActive());

        verify(tenantRepository)
                .save(tenant);
    }

    @Test
    void deleteTenant_alreadyInactive_rejected() {

        Tenant tenant =
                new Tenant(
                        1L,
                        "Nike",
                        "nike",
                        false
                );

        when(tenantRepository.findById(1L))
                .thenReturn(Optional.of(tenant));

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> service.deleteTenant(1L)
        );
    }

    @Test
    void activateTenant_success() {

        Tenant tenant =
                new Tenant(
                        1L,
                        "Nike",
                        "nike",
                        false
                );

        when(tenantRepository.findById(1L))
                .thenReturn(Optional.of(tenant));

        service.activateTenant(1L);

        assertTrue(tenant.isActive());

        verify(tenantRepository)
                .save(tenant);
    }

    @Test
    void createOrReactivateTenant_reactivatesSameTenant() {

        Tenant tenant =
                new Tenant(
                        1L,
                        "Nike",
                        "nike",
                        false
                );

        when(tenantRepository.findByName("Nike"))
                .thenReturn(Optional.of(tenant));

        when(tenantRepository.findByDomain("nike"))
                .thenReturn(Optional.of(tenant));

        when(tenantRepository.save(tenant))
                .thenReturn(tenant);

        Tenant result =
                service.createOrReactivateTenant(
                        "Nike",
                        "nike"
                );

        assertSame(tenant, result);
        assertTrue(tenant.isActive());
    }

    @Test
    void createOrReactivateTenant_createsNew() {

        when(tenantRepository.findByName("Nike"))
                .thenReturn(Optional.empty());

        when(tenantRepository.findByDomain("nike"))
                .thenReturn(Optional.empty());

        when(tenantRepository.save(any(Tenant.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Tenant result =
                service.createOrReactivateTenant(
                        "Nike",
                        "nike"
                );

        assertEquals("Nike", result.getName());
        assertEquals("nike", result.getDomain());
        assertTrue(result.isActive());
    }
}
