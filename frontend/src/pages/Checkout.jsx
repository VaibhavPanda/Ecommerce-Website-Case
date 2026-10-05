import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCartShopping,
  faLock,
  faBox,
} from "@fortawesome/free-solid-svg-icons";

import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";

import "./Checkout.css";

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await createOrder(items);

      console.log("Order creation response:", response.data);

      const orderId = response.data.orderId;

      if (!orderId) {
        throw new Error("Order was created but no order ID was returned.");
      }

      clearCart();

      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error("Failed to create order:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <div className="checkout-empty-icon">
            <FontAwesomeIcon icon={faCartShopping} />
          </div>

          <h1>Your cart is empty</h1>

          <p>Add some products to your cart before proceeding to checkout.</p>

          <Link to="/products" className="checkout-primary-button">
            <FontAwesomeIcon icon={faArrowLeft} />
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <Link to="/cart" className="checkout-back-link">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Cart
        </Link>

        <p className="checkout-eyebrow">Secure Checkout</p>

        <h1>Checkout</h1>

        <p>Review your order before placing it.</p>
      </header>

      <div className="checkout-layout">
        {/* LEFT SIDE */}
        <section className="checkout-items">
          <div className="checkout-section-header">
            <div>
              <h2>Order Summary</h2>

              <span>
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          <div className="checkout-item-list">
            {cartItems.map((item) => (
              <article key={item.productId} className="checkout-item">
                <div className="checkout-item-main">
                  <div className="checkout-item-icon">
                    <FontAwesomeIcon icon={faBox} />
                  </div>

                  <div className="checkout-item-info">
                    <h3>{item.name}</h3>

                    <p>
                      ₹{Number(item.price).toLocaleString("en-IN")} ×{" "}
                      {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="checkout-item-subtotal">
                  ₹
                  {(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                </div>
              </article>
            ))}
          </div>

          <Link to="/cart" className="checkout-edit-cart">
            <FontAwesomeIcon icon={faArrowLeft} />
            Edit Cart
          </Link>
        </section>

        {/* RIGHT SIDE */}
        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="checkout-summary-row">
            <span>Items</span>

            <span>{totalQuantity}</span>
          </div>

          <div className="checkout-summary-row">
            <span>Subtotal</span>

            <span>₹{cartTotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="checkout-summary-divider" />

          <div className="checkout-total">
            <span>Total</span>

            <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
          </div>

          {error && (
            <div className="checkout-error">
              <strong>Unable to place order</strong>

              <p>{error}</p>

              <Link to="/cart" className="checkout-error-link">
                <FontAwesomeIcon icon={faArrowLeft} />
                Review Cart
              </Link>
            </div>
          )}

          <button
            type="button"
            className="place-order-button"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="checkout-spinner" />
                Placing Order...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCartShopping} />
                Place Order
              </>
            )}
          </button>

          <div className="checkout-security">
            <FontAwesomeIcon icon={faLock} />

            <span>
              Your order will be securely processed and added to your order
              history.
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
