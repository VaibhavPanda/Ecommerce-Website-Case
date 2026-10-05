package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Category;
import com.example.backend.entity.Product;
import com.example.backend.entity.Tenant;

import jakarta.persistence.LockModeType;

public interface ProductRepository extends JpaRepository<Product, Long> {

  // TENANT-SCOPED QUERIES
  Page<Product> findByTenant(
      Tenant tenant,
      Pageable pageable);

  Page<Product> findByTenantAndNameContainingIgnoreCase(
      Tenant tenant,
      String name,
      Pageable pageable);

  Page<Product> findByTenantAndCategoryId(
      Tenant tenant,
      Long categoryId,
      Pageable pageable);

  @Query("""
      SELECT p
      FROM Product p
      WHERE p.tenant = :tenant
        AND p.category.id = :categoryId
        AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))
      """)
  Page<Product> searchByTenantAndCategory(
      @Param("tenant") Tenant tenant,
      @Param("categoryId") Long categoryId,
      @Param("name") String name,
      Pageable pageable);

  Optional<Product> findByIdAndTenant(
      Long id,
      Tenant tenant);

  boolean existsByCategory(Category category);

  // PUBLIC PRODUCT QUERIES
  // query
  @Query("""
      SELECT p
      FROM Product p
      WHERE p.isActive = true
        AND p.tenant.isActive = true
      """)
  Page<Product> findActiveProducts(
      Pageable pageable);

  @Query("""
      SELECT p
      FROM Product p
      WHERE p.isActive = true
        AND p.tenant.isActive = true
        AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))
      """)
  Page<Product> findActiveProductsByName(
      @Param("name") String name,
      Pageable pageable);

  @Query("""
      SELECT p
      FROM Product p
      WHERE p.isActive = true
        AND p.tenant.isActive = true
        AND LOWER(p.category.name) = LOWER(:categoryName)
      """)
  Page<Product> findActiveProductsByCategory(
      @Param("categoryName") String categoryName,
      Pageable pageable);

  @Query("""
      SELECT p
      FROM Product p
      WHERE p.isActive = true
        AND p.tenant.isActive = true
        AND LOWER(p.category.name) = LOWER(:categoryName)
        AND LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
      """)
  Page<Product> searchActiveProductsByCategory(
      @Param("categoryName") String categoryName,
      @Param("search") String search,
      Pageable pageable);

  @Query("""
      SELECT p
      FROM Product p
      WHERE p.id = :productId
        AND p.isActive = true
        AND p.tenant.isActive = true
      """)
  Optional<Product> findActiveById(
      @Param("productId") Long productId);

  // Locks product row while checking and reducing stock.
  // Also prevents ordering inactive products.
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("""
      SELECT p
      FROM Product p
      WHERE p.id = :id
        AND p.isActive = true
        AND p.tenant.isActive = true
      """)
  Optional<Product> findActiveByIdForUpdate(
      @Param("id") Long id);
}
