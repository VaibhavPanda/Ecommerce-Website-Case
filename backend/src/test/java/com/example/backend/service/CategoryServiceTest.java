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

import com.example.backend.entity.Category;
import com.example.backend.entity.Tenant;
import com.example.backend.exception.ResourceAlreadyExistsException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.security.TenantAccessService;

@ExtendWith(MockitoExtension.class)
class CategoryServiceUnitTest {

  @Mock
  private CategoryRepository categoryRepository;

  @Mock
  private TenantService tenantService;

  @Mock
  private TenantAccessService tenantAccessService;

  @Mock
  private ProductRepository productRepository;

  @InjectMocks
  private CategoryService service;

  private Tenant tenant() {
    return new Tenant(
        1L,
        "Nike",
        "nike",
        true);
  }

  @Test
  void createCategory_success() {

    Tenant tenant = tenant();

    when(tenantService.getTenantByDomain("nike"))
        .thenReturn(tenant);

    when(categoryRepository
        .existsByNameAndTenant("Shoes", tenant))
        .thenReturn(false);

    Category saved = new Category(
        1L,
        "Shoes",
        tenant);

    when(categoryRepository.save(any(Category.class)))
        .thenReturn(saved);

    Category result = service.createCategory(
        "nike",
        "Shoes");

    assertEquals(
        "Shoes",
        result.getName());

    verify(tenantAccessService)
        .validateTenantAccess("nike");
  }

  @Test
  void createCategory_duplicate_rejected() {

    Tenant tenant = tenant();

    when(tenantService.getTenantByDomain("nike"))
        .thenReturn(tenant);

    when(categoryRepository
        .existsByNameAndTenant("Shoes", tenant))
        .thenReturn(true);

    assertThrows(
        ResourceAlreadyExistsException.class,
        () -> service.createCategory(
            "nike",
            "Shoes"));
  }

  @Test
  void getCategories_success() {

    Tenant tenant = tenant();

    when(tenantService.getTenantByDomain("nike"))
        .thenReturn(tenant);

    when(categoryRepository.findByTenant(tenant))
        .thenReturn(List.of(
            new Category(
                1L,
                "Shoes",
                tenant)));

    assertEquals(
        1,
        service.getCategories("nike").size());
  }

  @Test
  void getCategory_notFound() {

    Tenant tenant = tenant();

    when(tenantService.getTenantByDomain("nike"))
        .thenReturn(tenant);

    when(categoryRepository
        .findByIdAndTenant(99L, tenant))
        .thenReturn(Optional.empty());

    assertThrows(
        ResourceNotFoundException.class,
        () -> service.getCategory(
            "nike",
            99L));
  }

  @Test
  void updateCategory_success() {

    Tenant tenant = tenant();

    Category category = new Category(
        1L,
        "Shoes",
        tenant);

    when(tenantService.getTenantByDomain("nike"))
        .thenReturn(tenant);

    when(categoryRepository
        .findByIdAndTenant(1L, tenant))
        .thenReturn(Optional.of(category));

    when(categoryRepository
        .existsByNameAndTenant("Running", tenant))
        .thenReturn(false);

    when(categoryRepository.save(category))
        .thenReturn(category);

    Category result = service.updateCategory(
        "nike",
        1L,
        "Running");

    assertEquals(
        "Running",
        result.getName());
  }

  @Test
  void updateCategory_duplicate_rejected() {

    Tenant tenant = tenant();

    Category category = new Category(
        1L,
        "Shoes",
        tenant);

    when(tenantService.getTenantByDomain("nike"))
        .thenReturn(tenant);

    when(categoryRepository
        .findByIdAndTenant(1L, tenant))
        .thenReturn(Optional.of(category));

    when(categoryRepository
        .existsByNameAndTenant(
            "Running",
            tenant))
        .thenReturn(true);

    assertThrows(
        ResourceAlreadyExistsException.class,
        () -> service.updateCategory(
            "nike",
            1L,
            "Running"));
  }

  @Test
  void deleteCategory_withProducts_rejected() {

    Tenant tenant = tenant();

    Category category = new Category(
        1L,
        "Shoes",
        tenant);

    when(tenantService.getTenantByDomain("nike"))
        .thenReturn(tenant);

    when(categoryRepository
        .findByIdAndTenant(1L, tenant))
        .thenReturn(Optional.of(category));

    when(productRepository
        .existsByCategory(category))
        .thenReturn(true);

    assertThrows(
        ResourceAlreadyExistsException.class,
        () -> service.deleteCategory(
            "nike",
            1L));

    verify(categoryRepository, never())
        .delete(category);
  }

  @Test
  void deleteCategory_withoutProducts_success() {

    Tenant tenant = tenant();

    Category category = new Category(
        1L,
        "Shoes",
        tenant);

    when(tenantService.getTenantByDomain("nike"))
        .thenReturn(tenant);

    when(categoryRepository
        .findByIdAndTenant(1L, tenant))
        .thenReturn(Optional.of(category));

    when(productRepository
        .existsByCategory(category))
        .thenReturn(false);

    service.deleteCategory(
        "nike",
        1L);

    verify(categoryRepository)
        .delete(category);
  }

  @Test
  void publicCategories_returnsRepositoryResult() {

    when(categoryRepository
        .findDistinctActiveCategoryNames())
        .thenReturn(
            List.of(
                "Football",
                "Shoes"));

    assertEquals(
        List.of(
            "Football",
            "Shoes"),
        service.getPublicCategories());
  }
}
