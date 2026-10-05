import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMinus,
  faPlus,
  faCartShopping,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

import { getProduct } from "../services/productService";

import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../services/favoriteService";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import FavoriteButton from "../components/FavoriteButton/FavoriteButton";

import "./ProductDetails.css";

function ProductDetails() {
  const { productId } = useParams();

  const { authenticated, initialized, user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [cartSuccess, setCartSuccess] = useState("");

  /*
   * LOAD PRODUCT
   */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setQuantity(1);

        const response = await getProduct(productId);

        setProduct(response.data);
      } catch (error) {
        console.error("Failed to load product:", error);
        setError("Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  /*
   * LOAD FAVORITE STATUS
   */
  useEffect(() => {
    if (!initialized) return;

    if (!authenticated || !user) {
      setIsFavorite(false);
      return;
    }

    const loadFavoriteStatus = async () => {
      try {
        const response = await getFavorites();

        const favoriteExists = response.data.some(
          (favorite) => favorite.productId === Number(productId)
        );

        setIsFavorite(favoriteExists);
      } catch (error) {
        console.error("Failed to load favorite status:", error);
      }
    };

    loadFavoriteStatus();
  }, [initialized, authenticated, user, productId]);

  /*
   * DECREASE QUANTITY
   */
  const decreaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.max(1, currentQuantity - 1)
    );
  };

  /*
   * INCREASE QUANTITY
   */
  const increaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.min(product.quantity, currentQuantity + 1)
    );
  };

  /*
   * TOGGLE FAVORITE
   */
  const handleFavoriteToggle = async () => {
    if (!authenticated || favoriteLoading) return;

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await removeFavorite(product.id);
        setIsFavorite(false);
      } else {
        await addFavorite(product.id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Failed to update favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  /*
   * ADD TO CART
   */
  const handleAddToCart = () => {
    addToCart(product, quantity);

    setCartSuccess(
      `${quantity} ${quantity === 1 ? "item" : "items"} added to cart.`
    );

    setTimeout(() => {
      setCartSuccess("");
    }, 2500);
  };

  if (loading) {
    return (
      <main className="product-details-state">
        <div className="product-details-loader">
          <div className="product-details-spinner" />
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="product-details-state">
        <div className="product-details-error">
          <h2>Something went wrong</h2>
          <p>{error}</p>

          <Link to="/products" className="product-details-state-button">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-details-state">
        <div className="product-details-error">
          <h2>Product not found</h2>
          <p>The product you're looking for does not exist.</p>

          <Link to="/products" className="product-details-state-button">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const isOutOfStock = product.quantity <= 0;

  /*
   * ONLY USER/TENANT SHOULD HAVE FAVORITES
   */
  const canFavorite =
    authenticated &&
    (user?.role === "USER" || user?.role === "TENANT");

  return (
    <main className="product-details">

      <Link to="/products" className="product-details-back">
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back to Products</span>
      </Link>

      <div className="product-details-card">

        <div className="product-details-info">

          <div className="product-details-header">

            <span className="product-details-category">
              {product.categoryName}
            </span>

            {canFavorite && (
              <FavoriteButton
                isFavorite={isFavorite}
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
              />
            )}

          </div>

          <h1>{product.name}</h1>

          <p className="product-details-description">
            {product.description || "No description available."}
          </p>

          <div className="product-details-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </div>

          <div className="product-details-meta">

            <div className="product-details-meta-item">
              <span>Brand</span>
              <strong>{product.tenantName}</strong>
            </div>

            <div className="product-details-meta-item">
              <span>Availability</span>

              <strong
                className={
                  isOutOfStock
                    ? "stock-out"
                    : "stock-available"
                }
              >
                {isOutOfStock ? "Out of stock" : "In stock"}
              </strong>
            </div>

          </div>

          {!isOutOfStock && (
            <>
              <div className="product-stock-info">
                <FontAwesomeIcon icon={faBoxOpen} />

                <span>
                  {product.quantity}{" "}
                  {product.quantity === 1 ? "item" : "items"} available
                </span>
              </div>

              <div className="product-purchase">

                <div className="product-quantity">

                  <span className="quantity-label">
                    Quantity
                  </span>

                  <div className="quantity-controls">

                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>

                    <span>{quantity}</span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={quantity >= product.quantity}
                      aria-label="Increase quantity"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>

                  </div>

                </div>

                <button
                  type="button"
                  className="add-to-cart-button"
                  onClick={handleAddToCart}
                >
                  <FontAwesomeIcon icon={faCartShopping} />
                  Add to Cart
                </button>

              </div>

              {cartSuccess && (
                <div className="cart-success-message">
                  {cartSuccess}
                </div>
              )}
            </>
          )}

          {isOutOfStock && (
            <button
              type="button"
              className="add-to-cart-button add-to-cart-disabled"
              disabled
            >
              Out of Stock
            </button>
          )}

        </div>

      </div>

    </main>
  );
}

export default ProductDetails;
