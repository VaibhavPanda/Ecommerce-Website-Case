package com.example.backend.exception;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;

class GlobalExceptionHandlerUnitTest {

  private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

  private MockHttpServletRequest request() {

    MockHttpServletRequest request = new MockHttpServletRequest();

    request.setRequestURI("/api/test");

    return request;
  }

  @Test
  void notFound_returns404() {

    var response = handler.handleResourceNotFound(
        new ResourceNotFoundException(
            "missing"),
        request());

    assertEquals(
        HttpStatus.NOT_FOUND,
        response.getStatusCode());

    assertEquals(
        "missing",
        response.getBody().getMessage());
  }

  @Test
  void alreadyExists_returns409() {

    var response = handler.handleResourceAlreadyExists(
        new ResourceAlreadyExistsException(
            "duplicate"),
        request());

    assertEquals(
        HttpStatus.CONFLICT,
        response.getStatusCode());
  }

  @Test
  void insufficientStock_returns409() {

    var response = handler.handleInsufficientStock(
        new InsufficientStockException(
            "stock"),
        request());

    assertEquals(
        HttpStatus.CONFLICT,
        response.getStatusCode());
  }

  @Test
  void accessDenied_returns403() {

    var response = handler.handleAccessDenied(
        new org.springframework.security.access.AccessDeniedException(
            "denied"),
        request());

    assertEquals(
        HttpStatus.FORBIDDEN,
        response.getStatusCode());
  }
}
