package com.example.backend.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.backend.dto.error.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

  //1
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleResourceNotFound(
      ResourceNotFoundException exception,
      HttpServletRequest request) {

    ErrorResponse error = new ErrorResponse(
        LocalDateTime.now(),
        HttpStatus.NOT_FOUND.value(),
        "Resource Not Found",
        exception.getMessage(),
        request.getRequestURI());

    return ResponseEntity
        .status(HttpStatus.NOT_FOUND)
        .body(error);
  }

  //2
  @ExceptionHandler(ResourceAlreadyExistsException.class)
  public ResponseEntity<ErrorResponse> handleResourceAlreadyExists(
      ResourceAlreadyExistsException exception,
      HttpServletRequest request) {

    ErrorResponse error = new ErrorResponse(
        LocalDateTime.now(),
        HttpStatus.CONFLICT.value(),
        "Resource Already Exists",
        exception.getMessage(),
        request.getRequestURI());

    return ResponseEntity
        .status(HttpStatus.CONFLICT)
        .body(error);
  }

  //3
  @ExceptionHandler(InsufficientStockException.class)
  public ResponseEntity<ErrorResponse> handleInsufficientStock(
      InsufficientStockException exception,
      HttpServletRequest request) {

    ErrorResponse error = new ErrorResponse(
        LocalDateTime.now(),
        HttpStatus.CONFLICT.value(),
        "Insufficient Stock",
        exception.getMessage(),
        request.getRequestURI());

    return ResponseEntity
        .status(HttpStatus.CONFLICT)
        .body(error);
  }

  //4
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(
          AccessDeniedException exception,
          HttpServletRequest request) {

      ErrorResponse error = new ErrorResponse(
          LocalDateTime.now(),
          HttpStatus.FORBIDDEN.value(),
          "Forbidden",
          exception.getMessage(),
          request.getRequestURI()
      );

      return ResponseEntity
          .status(HttpStatus.FORBIDDEN)
          .body(error);
  }

  //5
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(
      MethodArgumentNotValidException exception,
      HttpServletRequest request) {

    Map<String, String> validationErrors = new HashMap<>();

    exception.getBindingResult()
        .getFieldErrors()
        .forEach(error -> validationErrors.put(
            error.getField(),
            error.getDefaultMessage()));

    ErrorResponse error = new ErrorResponse(
        LocalDateTime.now(),
        HttpStatus.BAD_REQUEST.value(),
        "Validation Failed",
        validationErrors.toString(),
        request.getRequestURI());

    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(error);
  }


}
