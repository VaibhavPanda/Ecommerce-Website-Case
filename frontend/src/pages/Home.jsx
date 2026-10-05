import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBoxOpen,
  faCompass,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import ProductCard from "../components/ProductCard/ProductCard";
import "./Home.css";
import { useAuth } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const {authenticated,user} = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [productError, setProductError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError("");

        const response = await getProducts({
          page: 0,
          size: 4,
        });

        setProducts(response.data.content || []);
      } catch (error) {
        console.error("Failed to load featured products:", error);

        setProductError(
          error.response?.data?.message || "Unable to load featured products.",
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        setCategoryError("");

        const response = await getCategories();

        setCategories(response.data || []);
      } catch (error) {
        console.error("Failed to load categories:", error);

        setCategoryError(
          error.response?.data?.message || "Unable to load categories.",
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-eyebrow">
            <FontAwesomeIcon icon={faCompass} />
            DISCOVER SOMETHING NEW
          </p>

          <h1>
            {authenticated && user?.username ? (
              <>
                Welcome back,
                <br />
                {user.username}.
              </>
            ) : (
              <>
                Find products
                <br />
                you'll love.
              </>
            )}
          </h1>

          <p className="home-hero-description">
            Explore products from multiple brands, discover new categories and
            find exactly what you're looking for.
          </p>

          <div className="home-hero-actions">
            <Link to="/products" className="home-primary-button">
              Browse Products
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>

            <a href="#categories" className="home-secondary-button">
              Explore Categories
            </a>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="home-hero-card home-hero-card-main">
            <FontAwesomeIcon icon={faBoxOpen} />
            <span>Explore</span>
            <strong>Products</strong>
          </div>

          <div className="home-hero-card home-hero-card-small">
            <FontAwesomeIcon icon={faTags} />
            <span>Multiple</span>
            <strong>Categories</strong>
          </div>
        </div>
      </section>

      <section id="categories" className="home-categories-section">
        <div className="home-section-header">
          <div>
            <p className="home-section-eyebrow">BROWSE</p>
            <h2>Shop by Category</h2>
            <p>Explore products based on what you're looking for.</p>
          </div>

          <Link to="/products" className="home-section-link">
            View All
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>

        {loadingCategories ? (
          <div className="home-inline-loading">
            <div className="home-loader" />
            <span>Loading categories...</span>
          </div>
        ) : categoryError ? (
          <div className="home-inline-error">
            <span>{categoryError}</span>

            <Link to="/products">Browse Products</Link>
          </div>
        ) : categories.length === 0 ? (
          <div className="home-empty-section">
            <FontAwesomeIcon icon={faTags} />
            <p>No categories available yet.</p>
          </div>
        ) : (
          <div className="home-category-grid">
            {categories.slice(0, 6).map((category) => (
              <button
                type="button"
                className="home-category-card"
                key={category}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="home-category-icon">
                  <FontAwesomeIcon icon={faTags} />
                </div>

                <div className="home-category-content">
                  <h3>{category}</h3>
                  <span>
                    Explore products
                    <FontAwesomeIcon icon={faArrowRight} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="home-products-section">
        <div className="home-section-header">
          <div>
            <p className="home-section-eyebrow">DISCOVER</p>
            <h2>Featured Products</h2>
            <p>Take a look at some of the products available in our store.</p>
          </div>

          <Link to="/products" className="home-section-link">
            View All
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="home-inline-loading">
            <div className="home-loader" />
            <span>Loading products...</span>
          </div>
        ) : productError ? (
          <div className="home-inline-error">
            <span>{productError}</span>

            <Link to="/products">Browse Products</Link>
          </div>
        ) : products.length === 0 ? (
          <div className="home-empty-section">
            <FontAwesomeIcon icon={faBoxOpen} />
            <p>No products available yet.</p>
          </div>
        ) : (
          <div className="home-products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="home-products-footer">
          <Link to="/products" className="home-primary-button">
            Explore All Products
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
