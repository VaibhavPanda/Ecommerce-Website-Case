
package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.entity.Category;
import com.example.backend.entity.Favorite;
import com.example.backend.entity.Product;
import com.example.backend.entity.Role;
import com.example.backend.entity.Tenant;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceAlreadyExistsException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.FavoriteRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.security.CurrentUserService;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceUnitTest {

  @Mock
  private FavoriteRepository favoriteRepository;

  @Mock
  private ProductRepository productRepository;

  @Mock
  private CurrentUserService currentUserService;

  @InjectMocks
  private FavoriteService service;

  private User user() {

    return new User(
        1L,
        "user",
        "user@test.com",
        "kc",
        null,
        new Role(1L, "USER"));
  }

  private Product product() {

    Tenant tenant = new Tenant(
        1L,
        "Nike",
        "nike",
        true);

    Category category = new Category(
        1L,
        "Shoes",
        tenant);

    return new Product(
        2L,
        "Pegasus",
        "Running",
        new BigDecimal("100"),
        10,
        true,
        tenant,
        category);
  }

  @Test
  void addFavorite_success() {

    User user = user();
    Product product = product();

    when(currentUserService.getCurrentUser())
        .thenReturn(user);

    when(productRepository
        .findActiveById(2L))
        .thenReturn(Optional.of(product));

    when(favoriteRepository
        .existsByUserAndProduct(
            user,
            product))
        .thenReturn(false);

    Favorite favorite = new Favorite(
        5L,
        user,
        product);

    when(favoriteRepository
        .save(any(Favorite.class)))
        .thenReturn(favorite);

    var result = service.addFavorite(2L);

    assertEquals(
        5L,
        result.getId());

    assertEquals(
        2L,
        result.getProductId());

    verify(favoriteRepository)
        .save(any(Favorite.class));
  }

  @Test
  void addFavorite_duplicate_rejected() {

    User user = user();
    Product product = product();

    when(currentUserService.getCurrentUser())
        .thenReturn(user);

    when(productRepository
        .findActiveById(2L))
        .thenReturn(Optional.of(product));

    when(favoriteRepository
        .existsByUserAndProduct(
            user,
            product))
        .thenReturn(true);

    assertThrows(
        ResourceAlreadyExistsException.class,
        () -> service.addFavorite(2L));
  }

  @Test
  void addFavorite_missingProduct_rejected() {

    when(currentUserService.getCurrentUser())
        .thenReturn(user());

    when(productRepository
        .findActiveById(99L))
        .thenReturn(Optional.empty());

    assertThrows(
        ResourceNotFoundException.class,
        () -> service.addFavorite(99L));
  }

  @Test
  void removeFavorite_success() {

    User user = user();
    Product product = product();

    Favorite favorite = new Favorite(
        5L,
        user,
        product);

    when(currentUserService.getCurrentUser())
        .thenReturn(user);

    when(productRepository
        .findById(2L))
        .thenReturn(Optional.of(product));

    when(favoriteRepository
        .findByUserAndProduct(
            user,
            product))
        .thenReturn(Optional.of(favorite));

    service.removeFavorite(2L);

    verify(favoriteRepository)
        .delete(favorite);
  }

  @Test
  void removeFavorite_notFavorite_rejected() {

    User user = user();
    Product product = product();

    when(currentUserService.getCurrentUser())
        .thenReturn(user);

    when(productRepository
        .findById(2L))
        .thenReturn(Optional.of(product));

    when(favoriteRepository
        .findByUserAndProduct(
            user,
            product))
        .thenReturn(Optional.empty());

    assertThrows(
        ResourceNotFoundException.class,
        () -> service.removeFavorite(2L));
  }

  @Test
  void getMyFavorites_mapsActiveFavorites() {

    User user = user();
    Product product = product();

    Favorite favorite = new Favorite(
        5L,
        user,
        product);

    when(currentUserService.getCurrentUser())
        .thenReturn(user);

    when(favoriteRepository
        .findActiveFavoritesByUser(user))
        .thenReturn(
            List.of(favorite));

    var result = service.getMyFavorites();

    assertEquals(
        1,
        result.size());

    assertEquals(
        "Pegasus",
        result.get(0).getProductName());
  }
}
