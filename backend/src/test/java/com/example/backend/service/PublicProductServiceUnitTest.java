
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.backend.entity.Category;
import com.example.backend.entity.Product;
import com.example.backend.entity.Tenant;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class PublicProductServiceUnitTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private PublicProductService service;

    private Product product() {

        Tenant tenant =
                new Tenant(
                        1L,
                        "Nike",
                        "nike",
                        true
                );

        Category category =
                new Category(
                        2L,
                        "Shoes",
                        tenant
                );

        return new Product(
                3L,
                "Pegasus",
                "Running",
                new BigDecimal("9999"),
                10,
                true,
                tenant,
                category
        );
    }

    @Test
    void noFilters_usesActiveProducts() {

        Pageable pageable =
                PageRequest.of(0, 20);

        when(productRepository
                .findActiveProducts(pageable))
                .thenReturn(
                        new PageImpl<>(
                                List.of(product())
                        )
                );

        assertEquals(
                1,
                service.getProducts(
                        null,
                        null,
                        pageable
                ).getTotalElements()
        );

        verify(productRepository)
                .findActiveProducts(pageable);
    }

    @Test
    void searchOnly_usesNameQuery() {

        Pageable pageable =
                PageRequest.of(0, 20);

        when(productRepository
                .findActiveProductsByName(
                        "peg",
                        pageable
                ))
                .thenReturn(
                        new PageImpl<>(
                                List.of(product())
                        )
                );

        assertEquals(
                1,
                service.getProducts(
                        "peg",
                        null,
                        pageable
                ).getTotalElements()
        );

        verify(productRepository)
                .findActiveProductsByName(
                        "peg",
                        pageable
                );
    }

    @Test
    void categoryOnly_usesCategoryQuery() {

        Pageable pageable =
                PageRequest.of(0, 20);

        when(productRepository
                .findActiveProductsByCategory(
                        "Shoes",
                        pageable
                ))
                .thenReturn(
                        new PageImpl<>(
                                List.of(product())
                        )
                );

        assertEquals(
                1,
                service.getProducts(
                        null,
                        "Shoes",
                        pageable
                ).getTotalElements()
        );

        verify(productRepository)
                .findActiveProductsByCategory(
                        "Shoes",
                        pageable
                );
    }

    @Test
    void searchAndCategory_usesCombinedQuery() {

        Pageable pageable =
                PageRequest.of(0, 20);

        when(productRepository
                .searchActiveProductsByCategory(
                        "Shoes",
                        "peg",
                        pageable
                ))
                .thenReturn(
                        new PageImpl<>(
                                List.of(product())
                        )
                );

        assertEquals(
                1,
                service.getProducts(
                        "peg",
                        "Shoes",
                        pageable
                ).getTotalElements()
        );

        verify(productRepository)
                .searchActiveProductsByCategory(
                        "Shoes",
                        "peg",
                        pageable
                );
    }

    @Test
    void getProduct_notFound() {

        when(productRepository
                .findActiveById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> service.getProduct(99L)
        );
    }

    @Test
    void getProduct_success() {

        Product product = product();

        when(productRepository
                .findActiveById(3L))
                .thenReturn(Optional.of(product));

        var result =
                service.getProduct(3L);

        assertEquals(
                3L,
                result.getId()
        );

        assertEquals(
                "Nike",
                result.getTenantName()
        );
    }
}
