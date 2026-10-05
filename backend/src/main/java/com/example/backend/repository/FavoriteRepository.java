package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Favorite;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;

public interface FavoriteRepository
    extends JpaRepository<Favorite, Long> {

  //check
  boolean existsByUserAndProduct(
      User user,
      Product product);

  //find
  Optional<Favorite> findByUserAndProduct(
      User user,
      Product product);

  //fetch active products
  @Query("""
      SELECT f
      FROM Favorite f
      JOIN FETCH f.product p
      WHERE f.user = :user
        AND p.isActive = true
        AND p.tenant.isActive = true
      ORDER BY f.id DESC
      """)
  List<Favorite> findActiveFavoritesByUser(
      @Param("user") User user);
}
