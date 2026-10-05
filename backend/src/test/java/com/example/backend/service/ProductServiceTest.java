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

import com.example.backend.dto.product.CreateProductRequest;
import com.example.backend.dto.product.UpdateProductRequest;
import com.example.backend.entity.Category;
import com.example.backend.entity.Product;
import com.example.backend.entity.Tenant;
import com.example.backend.exception.ResourceAlreadyExistsException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ProductRepository;
import com.example.backend.security.TenantAccessService;

@ExtendWith(MockitoExtension.class)
class ProductServiceUnitTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private TenantService tenantService;

    @Mock
    private CategoryService categoryService;

    @Mock
    private TenantAccessService tenantAccessService;

    @InjectMocks
    private ProductService service;

    private Tenant tenant() {
        return new Tenant(
                1L,
                "Nike",
                "nike",
                true
        );
    }

    private Category category(Tenant tenant) {
        return new Category(
                2L,
                "Shoes",
                tenant
        );
    }

    private Product product(
            Tenant tenant,
            Category category) {

        return new Product(
                10L,
                "Pegasus",
                "Running shoes",
                new BigDecimal("9999"),
                20,
                true,
                tenant,
                category
        );
    }

    @Test
    void createProduct_success() {

        Tenant tenant = tenant();
        Category category = category(tenant);

        CreateProductRequest request =
                new CreateProductRequest(
                        "Pegasus",
                        "Running shoes",
                        new BigDecimal("9999"),
                        20,
                        2L
                );

        when(tenantService.getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(categoryService
                .getCategory("nike", 2L))
                .thenReturn(category);

        when(productRepository.save(any(Product.class)))
                .thenAnswer(invocation -> {
                    Product product =
                            invocation.getArgument(0);

                    product.setId(10L);

                    return product;
                });

        var result =
                service.createProduct(
                        "nike",
                        request
                );

        assertEquals(
                "Pegasus",
                result.getName()
        );

        assertEquals(
                "Nike",
                result.getTenantName()
        );

        verify(tenantAccessService)
                .validateTenantAccess("nike");
    }

    @Test
    void getProducts_searchAndCategory_usesCombinedQuery() {

        Tenant tenant = tenant();
        Category category = category(tenant);
        Product product = product(
                tenant,
                category
        );

        Pageable pageable =
                PageRequest.of(0, 20);

        when(tenantService.getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(productRepository
                .searchByTenantAndCategory(
                        tenant,
                        2L,
                        "Peg",
                        pageable
                ))
                .thenReturn(
                        new PageImpl<>(
                                List.of(product)
                        )
                );

        var result =
                service.getProducts(
                        "nike",
                        "Peg",
                        2L,
                        pageable
                );

        assertEquals(
                1,
                result.getTotalElements()
        );

        verify(productRepository)
                .searchByTenantAndCategory(
                        tenant,
                        2L,
                        "Peg",
                        pageable
                );
    }

    @Test
    void getProducts_searchOnly_usesNameQuery() {

        Tenant tenant = tenant();
        Category category = category(tenant);
        Product product =
                product(tenant, category);

        Pageable pageable =
                PageRequest.of(0, 20);

        when(tenantService.getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(productRepository
                .findByTenantAndNameContainingIgnoreCase(
                        tenant,
                        "Peg",
                        pageable
                ))
                .thenReturn(
                        new PageImpl<>(
                                List.of(product)
                        )
                );

        assertEquals(
                1,
                service.getProducts(
                        "nike",
                        "Peg",
                        null,
                        pageable
                ).getTotalElements()
        );

        verify(productRepository)
                .findByTenantAndNameContainingIgnoreCase(
                        tenant,
                        "Peg",
                        pageable
                );
    }

    @Test
    void getProducts_categoryOnly_usesCategoryQuery() {

        Tenant tenant = tenant();
        Category category = category(tenant);
        Product product =
                product(tenant, category);

        Pageable pageable =
                PageRequest.of(0, 20);

        when(tenantService.getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(productRepository
                .findByTenantAndCategoryId(
                        tenant,
                        2L,
                        pageable
                ))
                .thenReturn(
                        new PageImpl<>(
                                List.of(product)
                        )
                );

        assertEquals(
                1,
                service.getProducts(
                        "nike",
                        null,
                        2L,
                        pageable
                ).getTotalElements()
        );

        verify(productRepository)
                .findByTenantAndCategoryId(
                        tenant,
                        2L,
                        pageable
                );
    }

    @Test
    void getProducts_noFilters_usesTenantQuery() {

        Tenant tenant = tenant();
        Category category = category(tenant);
        Product product =
                product(tenant, category);

        Pageable pageable =
                PageRequest.of(0, 20);

        when(tenantService.getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(productRepository
                .findByTenant(
                        tenant,
                        pageable
                ))
                .thenReturn(
                        new PageImpl<>(
                                List.of(product)
                        )
                );

        assertEquals(
                1,
                service.getProducts(
                        "nike",
                        null,
                        null,
                        pageable
                ).getTotalElements()
        );

        verify(productRepository)
                .findByTenant(
                        tenant,
                        pageable
                );
    }

    @Test
    void getProduct_wrongTenantScope_notFound() {

        Tenant tenant = tenant();

        when(tenantService.getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(productRepository
                .findByIdAndTenant(
                        99L,
                        tenant
                ))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> service.getProduct(
                        "nike",
                        99L
                )
        );
    }

    @Test
    void updateProduct_success() {

        Tenant tenant = tenant();

        Category oldCategory =
                category(tenant);

        Category newCategory =
                new Category(
                        3L,
                        "Training",
                        tenant
                );

        Product product =
                product(
                        tenant,
                        oldCategory
                );

        UpdateProductRequest request =
                new UpdateProductRequest(
                        "Updated",
                        "Updated description",
                        new BigDecimal("10999"),
                        15,
                        3L
                );

        when(tenantService.getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(productRepository
                .findByIdAndTenant(
                        10L,
                        tenant
                ))
                .thenReturn(Optional.of(product));

        when(categoryService
                .getCategory(
                        "nike",
                        3L
                ))
                .thenReturn(newCategory);

        when(productRepository.save(product))
                .thenReturn(product);

        var result =
                service.updateProduct(
                        "nike",
                        10L,
                        request
                );

        assertEquals(
                "Updated",
                result.getName()
        );

        assertEquals(
                15,
                result.getQuantity()
        );

        assertSame(
                newCategory,
                product.getCategory()
        );
    }

    @Test
    void deleteProduct_success_softDeletes() {

        Tenant tenant = tenant();
        Category category = category(tenant);
        Product product =
                product(
                        tenant,
                        category
                );

        when(tenantService.getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(productRepository
                .findByIdAndTenant(
                        10L,
                        tenant
                ))
                .thenReturn(Optional.of(product));

        service.deleteProduct(
                "nike",
                10L
        );

        assertFalse(
                product.isActive()
        );

        verify(productRepository)
                .save(product);
    }

    @Test
    void deleteProduct_alreadyInactive_rejected() {

        Tenant tenant = tenant();
        Category category = category(tenant);

        Product product =
                product(
                        tenant,
                        category
                );

        product.setActive(false);

        when(tenantService.getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(productRepository
                .findByIdAndTenant(
                        10L,
                        tenant
                ))
                .thenReturn(Optional.of(product));

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> service.deleteProduct(
                        "nike",
                        10L
                )
        );
    }

    @Test
    void activateProduct_success() {

        Tenant tenant = tenant();
        Category category = category(tenant);

        Product product =
                product(
                        tenant,
                        category
                );

        product.setActive(false);

        when(tenantService.getTenantByDomain("nike"))
                .thenReturn(tenant);

        when(productRepository
                .findByIdAndTenant(
                        10L,
                        tenant
                ))
                .thenReturn(Optional.of(product));

        when(productRepository.save(product))
                .thenReturn(product);

        var result =
                service.activateProduct(
                        "nike",
                        10L
                );

        assertTrue(
                result.isActive()
        );

        verify(productRepository)
                .save(product);
    }
}
