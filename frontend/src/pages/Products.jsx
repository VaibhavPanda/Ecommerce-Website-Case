import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";

import ProductCard from "../components/ProductCard/ProductCard";
import SearchBar from "../components/SearchBar/SearchBar";
import CategoryFilter from "../components/CategoryFilter/CategoryFilter";

import useDebounce from "../hooks/useDebounce";

import { useAuth } from "../context/AuthContext";

import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../services/favoriteService";

import "./Products.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownWideShort } from "@fortawesome/free-solid-svg-icons";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("id,asc");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const { authenticated, initialized } = useAuth();

  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          size: 20,
          sort,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (category) {
          params.category = category;
        }

        const response = await getProducts(params);

        setProducts(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Failed to load products:", error);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [debouncedSearch, category, page, sort]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!authenticated) {
      setFavoriteIds(new Set());
      return;
    }

    const loadFavorites = async () => {
      try {
        const response = await getFavorites();

        const ids = new Set(
          response.data.map((favorite) => favorite.productId),
        );

        setFavoriteIds(ids);
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    };

    loadFavorites();
  }, [initialized, authenticated]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);

    const params = new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }

    setSearchParams(params, { replace: true });
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(0);

    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    setSearchParams(params, { replace: true });
  };

  const handleFavoriteToggle = async (productId) => {
    try {
      setFavoriteLoadingId(productId);

      const isFavorite = favoriteIds.has(productId);

      if (isFavorite) {
        await removeFavorite(productId);

        setFavoriteIds((current) => {
          const updated = new Set(current);
          updated.delete(productId);
          return updated;
        });
      } else {
        await addFavorite(productId);

        setFavoriteIds((current) => {
          const updated = new Set(current);
          updated.add(productId);
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to update favorite:", error);
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(0);

    const params = new URLSearchParams(searchParams);

    if (value && value !== "id,asc") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    setSearchParams(params, { replace: true });
  };

  return (
    <main className="products-page">
      <header className="products-header">
        <div>
          <p className="products-eyebrow">SHOP COLLECTION</p>
          <h1>Products</h1>
          <p className="products-subtitle">
            Explore products from all available brands.
          </p>
        </div>
      </header>

      <section className="product-filters">
        <SearchBar value={search} onChange={handleSearchChange} />

        <CategoryFilter
          categories={categories}
          value={category}
          onChange={handleCategoryChange}
        />

        <div className="sort-filter">
          <FontAwesomeIcon
            icon={faArrowDownWideShort}
            className="sort-filter-icon"
          />
          <select
            id="product-sort"
            value={sort}
            onChange={(event) => handleSortChange(event.target.value)}
            aria-label="Sort products"
          >
            <option value="id,asc">Sort By</option>

            <option value="price,asc">Price: Low to High</option>

            <option value="price,desc">Price: High to Low</option>

            <option value="id,desc">Newest Arrivals</option>
          </select>
        </div>
      </section>

      {!loading && !error && (
        <div className="products-result-info">
          <span>
            {products.length > 0
              ? `Showing ${products.length} product${
                  products.length === 1 ? "" : "s"
                }`
              : "No products"}
          </span>

          {(search.trim() || category || sort !== "id,asc") && (
            <button
              type="button"
              className="clear-filters"
              onClick={() => {
                setSearch("");
                setCategory("");
                setSort("id,asc")
                setPage(0);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="products-state">
          <div className="products-loader" />
          <p>Loading products...</p>
        </div>
      )}

      {!loading && error && (
        <div className="products-state products-error">
          <div className="products-state-icon">!</div>

          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={handleRetry}
            className="products-retry-button"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="products-state products-empty">
          <div className="products-state-icon">⌕</div>

          <h2>No products found</h2>

          <p>
            Try changing your search term or selecting a different category.
          </p>

          {(search.trim() || category || sort !== "id,asc") && (
            <button
              type="button"
              className="products-retry-button"
              onClick={() => {
                setSearch("");
                setCategory("");
                setSort("id,asc");
                setPage(0);
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favoriteIds.has(product.id)}
                onFavoriteToggle={
                  authenticated ? handleFavoriteToggle : undefined
                }
                favoriteLoading={favoriteLoadingId === product.id}
              />
            ))}
          </div>

          {/* //pagination - setpage(0) whenever we want to filter. */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="pagination-button"
                disabled={page === 0}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>

              <span className="pagination-info">
                Page <strong>{page + 1}</strong> of{" "}
                <strong>{totalPages}</strong>
              </span>

              <button
                type="button"
                className="pagination-button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default Products;
