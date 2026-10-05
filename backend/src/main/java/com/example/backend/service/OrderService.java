package com.example.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.order.CreateOrderRequest;
import com.example.backend.dto.order.OrderItemRequest;
import com.example.backend.dto.order.OrderItemResponse;
import com.example.backend.dto.order.OrderResponse;
import com.example.backend.entity.Order;
import com.example.backend.entity.OrderItem;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import com.example.backend.exception.InsufficientStockException;
import com.example.backend.exception.ResourceAlreadyExistsException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.security.CurrentUserService;

@Service
public class OrderService {

  private final OrderRepository orderRepository;
  private final ProductRepository productRepository;
  private final CurrentUserService currentUserService;

  public OrderService(
      OrderRepository orderRepository,
      ProductRepository productRepository,
      CurrentUserService currentUserService) {

    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.currentUserService = currentUserService;
  }

  //create -> duplicates check
  // -> item quantity and concurrency check
  // -> also saves historical price
  @Transactional
  public OrderResponse createOrder(
      CreateOrderRequest request) {

    User user = currentUserService.getCurrentUser();


    // Prevent the same product from appearing multiple times in a single order.
    Set<Long> productIds = new HashSet<>();

    for (OrderItemRequest itemRequest : request.getItems()) {

      if (!productIds.add(itemRequest.getProductId())) {

        throw new ResourceAlreadyExistsException(
            "Product appears more than once in the order: "
                + itemRequest.getProductId());
      }
    }

    Order order = new Order();

    order.setUser(user);
    order.setOrderDate(LocalDateTime.now());

    List<OrderItem> orderItems = new ArrayList<>();

    int totalQuantity = 0;

    BigDecimal totalAmount = BigDecimal.ZERO;

    for (OrderItemRequest itemRequest : request.getItems()) {


        // Pessimistic lock + active product/tenant check
        // -> stock check then stock change then only continues

      Product product = productRepository
          .findActiveByIdForUpdate(
              itemRequest.getProductId())
          .orElseThrow(() -> new ResourceNotFoundException(
              "Product not found or is no longer available: "
                  + itemRequest.getProductId()));

      int requestedQuantity = itemRequest.getQuantity();

      int availableQuantity = product.getQuantity();


      if (requestedQuantity >= availableQuantity) {

        throw new InsufficientStockException(
            "Requested quantity must be less than available quantity for product: "
                + product.getName());
      }

      OrderItem orderItem = new OrderItem();

      orderItem.setOrder(order);
      orderItem.setProduct(product);
      orderItem.setQuantity(requestedQuantity);

      // capture price at purchase time.
      BigDecimal price = product.getPrice();

      orderItem.setPrice(price);

      BigDecimal subtotal = price.multiply(
          BigDecimal.valueOf(
              requestedQuantity));

      totalQuantity += requestedQuantity;

      totalAmount = totalAmount.add(subtotal);

      //update product
      product.setQuantity(
          availableQuantity - requestedQuantity);

      orderItems.add(orderItem);
    }

    order.setOrderItems(orderItems);
    order.setTotalQuantity(totalQuantity);
    order.setTotalAmount(totalAmount);

    Order savedOrder = orderRepository.save(order);

    return mapToResponse(savedOrder);
  }

  //mapping function
  private OrderResponse mapToResponse(
      Order order) {

    List<OrderItemResponse> itemResponses = order.getOrderItems()
        .stream()
        .map(item -> {

          BigDecimal subtotal = item.getPrice()
              .multiply(
                  BigDecimal.valueOf(
                      item.getQuantity()));

          return new OrderItemResponse(
              item.getProduct().getId(),
              item.getProduct().getName(),
              item.getQuantity(),
              item.getPrice(),
              subtotal);
        })
        .toList();

    return new OrderResponse(
        order.getId(),
        order.getOrderDate(),
        order.getTotalQuantity(),
        order.getTotalAmount(),
        itemResponses);
  }

  //order history
  public List<OrderResponse> getMyOrders() {

    User user = currentUserService.getCurrentUser();

    return orderRepository
        .findByUserOrderByIdDesc(user)
        .stream()
        .map(this::mapToResponse)
        .toList();
  }

  //single order detail
  public OrderResponse getMyOrder(
      Long orderId) {

    User user = currentUserService.getCurrentUser();

    Order order = orderRepository
        .findByIdAndUser(
            orderId,
            user)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Order not found"));

    return mapToResponse(order);
  }
}
