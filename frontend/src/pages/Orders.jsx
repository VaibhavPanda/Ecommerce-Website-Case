import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBoxOpen,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";

import { getOrders } from "../services/orderService";

import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getOrders();

        setOrders(response.data);
      } catch (error) {
        console.error("Failed to load orders:", error);

        setError(error.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <main className="orders-state">
        <div className="orders-loader" />
        <p>Loading orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-state">
        <div className="orders-state-icon">!</div>

        <h2>Unable to load orders</h2>

        <p>{error}</p>

        <Link to="/orders" className="orders-primary-button">
          Try Again
        </Link>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="orders-page">
        <div className="orders-empty">
          <div className="orders-empty-icon">
            <FontAwesomeIcon icon={faBoxOpen} />
          </div>

          <h1>No Orders Yet</h1>

          <p>Your completed orders will appear here.</p>

          <Link to="/products" className="orders-primary-button">
            <FontAwesomeIcon icon={faCartShopping} />
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <header className="orders-header">
        <p className="orders-eyebrow">PURCHASE HISTORY</p>

        <h1>My Orders</h1>

        <p>View your previous orders and their details.</p>
      </header>

      <section className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order.orderId}>
            <div className="order-card-header">
              <div>
                <span className="order-label">ORDER</span>

                <h2>#{order.orderId}</h2>
              </div>

              <span className="order-date">
                {new Date(order.orderDate).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="order-card-details">
              <div className="order-detail">
                <span>Items</span>
                <strong>{order.totalQuantity}</strong>
              </div>

              <div className="order-detail">
                <span>Total</span>
                <strong>
                  ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div className="order-card-footer">
              <Link
                to={`/orders/${order.orderId}`}
                className="order-view-button"
              >
                <span>View Order</span>

                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Orders;
