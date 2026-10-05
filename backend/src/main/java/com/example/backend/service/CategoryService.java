package com.example.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.entity.Category;
import com.example.backend.entity.Tenant;
import com.example.backend.exception.ResourceAlreadyExistsException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.security.TenantAccessService;

@Service
public class CategoryService {

  private final CategoryRepository categoryRepository;
  private final TenantService tenantService;
  private final TenantAccessService tenantAccessService;
  private final ProductRepository productRepository;

  public CategoryService(
      CategoryRepository categoryRepository,
      TenantService tenantService,
      TenantAccessService tenantAccessService,
      ProductRepository productRepository) {

    this.categoryRepository = categoryRepository;
    this.tenantService = tenantService;
    this.tenantAccessService = tenantAccessService;
    this.productRepository = productRepository;
  }

  //validate tenant -> check duplicate -> create
  public Category createCategory(
      String tenantDomain,
      String categoryName) {

    tenantAccessService.validateTenantAccess(tenantDomain);

    Tenant tenant = tenantService.getTenantByDomain(tenantDomain);

    if (categoryRepository.existsByNameAndTenant(
        categoryName,
        tenant)) {

      throw new ResourceAlreadyExistsException(
          "Category already exists for this tenant");
    }

    Category category = new Category();

    category.setName(categoryName);
    category.setTenant(tenant);

    return categoryRepository.save(category);
  }

  //these two only fetch categories for specific tenant
  public List<Category> getCategories(
      String tenantDomain) {

    tenantAccessService.validateTenantAccess(tenantDomain);

    Tenant tenant = tenantService.getTenantByDomain(tenantDomain);

    return categoryRepository.findByTenant(tenant);
  }
  public Category getCategory(
      String tenantDomain,
      Long categoryId) {

    tenantAccessService.validateTenantAccess(tenantDomain);

    Tenant tenant = tenantService.getTenantByDomain(tenantDomain);

    return categoryRepository
        .findByIdAndTenant(categoryId, tenant)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Category not found"));
  }

  // delete also validates tenant
  public void deleteCategory(
      String tenantDomain,
      Long categoryId) {

    tenantAccessService.validateTenantAccess(tenantDomain);

    Category category = getCategory(
        tenantDomain,
        categoryId);

    if (productRepository.existsByCategory(category)) {
      throw new ResourceAlreadyExistsException(
          "Cannot delete category because products are assigned to it");
    }

    categoryRepository.delete(category);
  }

  //validate tenant -> update request DTO used -> also checks for duplicates
  public Category updateCategory(
      String tenantDomain,
      Long categoryId,
      String categoryName) {

    tenantAccessService.validateTenantAccess(tenantDomain);

    Tenant tenant = tenantService.getTenantByDomain(tenantDomain);

    Category category = categoryRepository
        .findByIdAndTenant(
            categoryId,
            tenant)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Category not found"));

    if (!category.getName().equalsIgnoreCase(categoryName)
        && categoryRepository.existsByNameAndTenant(
            categoryName,
            tenant)) {

      throw new ResourceAlreadyExistsException(
          "Category already exists for this tenant");
    }

    category.setName(categoryName);

    return categoryRepository.save(category);
  }

  // PUBLIC

  //list of all categories for products page
  public List<String> getPublicCategories() {

    return categoryRepository
        .findDistinctActiveCategoryNames();
  }
}
