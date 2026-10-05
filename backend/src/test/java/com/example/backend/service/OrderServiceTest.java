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

import com.example.backend.dto.order.CreateOrderRequest;
import com.example.backend.dto.order.OrderItemRequest;
import com.example.backend.entity.Category;
import com.example.backend.entity.Order;
import com.example.backend.entity.Product;
import com.example.backend.entity.Role;
import com.example.backend.entity.Tenant;
import com.example.backend.entity.User;
import com.example.backend.exception.InsufficientStockException;
import com.example.backend.exception.ResourceAlreadyExistsException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.security.CurrentUserService;

@ExtendWith(MockitoExtension.class)
class OrderServiceUnitTest {

  @Mock
  private OrderRepository orderRepository;

  @Mock
  private ProductRepository productRepository;

  @Mock
  private CurrentUserService currentUserService;

  @InjectMocks
  private OrderService service;

  private User user() {

    Role role = new Role(
        1L,
        "USER");

    return new User(
        1L,
        "user",
        "user@test.com",
        "kc-1",
        null,
        role);
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
        10L,
        "Pegasus",
        "Running",
        new BigDecimal("100.00"),
        10,
        true,
        tenant,
        category);
  }

  private CreateOrderRequest request(
      long productId,
      int quantity) {

    return new CreateOrderRequest(
        List.of(
            new OrderItemRequest(
                productId,
                quantity)));
  }

  @Test
  void createOrder_success_calculatesTotalsAndReducesStock() {

    User user = user();
    Product product = product();

    when(currentUserService.getCurrentUser())
        .thenReturn(user);

    when(productRepository
        .findActiveByIdForUpdate(10L))
        .thenReturn(Optional.of(product));

    when(orderRepository.save(any(Order.class)))
        .thenAnswer(invocation -> {

          Order order = invocation.getArgument(0);

          order.setId(100L);

          return order;
        });

    var result = service.createOrder(
        request(10L, 3));

    assertEquals(
        3,
        result.getTotalQuantity());

    assertEquals(
        new BigDecimal("300.00"),
        result.getTotalAmount());

    assertEquals(
        7,
        product.getQuantity());

    assertEquals(
        1,
        result.getItems().size());

    assertEquals(
        new BigDecimal("100.00"),
        result.getItems()
            .get(0)
            .getPrice());

    verify(orderRepository)
        .save(any(Order.class));
  }

  @Test
  void duplicateProductInOrder_rejected() {

    when(currentUserService.getCurrentUser())
        .thenReturn(user());

    CreateOrderRequest request = new CreateOrderRequest(
        List.of(
            new OrderItemRequest(10L, 1),
            new OrderItemRequest(10L, 2)));

    assertThrows(
        ResourceAlreadyExistsException.class,
        () -> service.createOrder(request));

    verifyNoInteractions(
        productRepository,
        orderRepository);
  }

  @Test
  void quantityEqualToAvailable_isRejected() {

    Product product = product();

    when(currentUserService.getCurrentUser())
        .thenReturn(user());

    when(productRepository
        .findActiveByIdForUpdate(10L))
        .thenReturn(Optional.of(product));

    assertThrows(
        InsufficientStockException.class,
        () -> service.createOrder(
            request(10L, 10)));

    verify(
        orderRepository,
        never()).save(any());
  }

  @Test
  void quantityGreaterThanAvailable_isRejected() {

    Product product = product();

    when(currentUserService.getCurrentUser())
        .thenReturn(user());

    when(productRepository
        .findActiveByIdForUpdate(10L))
        .thenReturn(Optional.of(product));

    assertThrows(
        InsufficientStockException.class,
        () -> service.createOrder(
            request(10L, 11)));
  }

  @Test
  void inactiveOrMissingProduct_rejected() {

    when(currentUserService.getCurrentUser())
        .thenReturn(user());

    when(productRepository
        .findActiveByIdForUpdate(99L))
        .thenReturn(Optional.empty());

    assertThrows(
        ResourceNotFoundException.class,
        () -> service.createOrder(
            request(99L, 1)));
  }

  @Test
  void getMyOrders_returnsCurrentUsersHistory() {

    User user = user();

    Order order = new Order();

    order.setId(1L);
    order.setUser(user);
    order.setOrderItems(List.of());
    order.setTotalQuantity(0);
    order.setTotalAmount(BigDecimal.ZERO);

    when(currentUserService.getCurrentUser())
        .thenReturn(user);

    when(orderRepository
        .findByUserOrderByIdDesc(user))
        .thenReturn(List.of(order));

    assertEquals(
        1,
        service.getMyOrders().size());
  }

  @Test
  void getMyOrder_wrongUserCannotAccess() {

    User user = user();

    when(currentUserService.getCurrentUser())
        .thenReturn(user);

    when(orderRepository
        .findByIdAndUser(99L, user))
        .thenReturn(Optional.empty());

    assertThrows(
        ResourceNotFoundException.class,
        () -> service.getMyOrder(99L));
  }
}


//
