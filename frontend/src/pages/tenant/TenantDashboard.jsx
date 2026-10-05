import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faTags,
  faArrowRight,
  faGaugeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { getTenantProducts } from "../../services/tenantProductService";
import "./TenantDashboard.css";

function TenantDashboard() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      if (!user?.tenant?.domain) return;

      try {
        const response = await getTenantProducts(user.tenant.domain, {
          page: 0,
          size: 20,
        });

        setProducts(response.data.content || []);
      } catch (error) {
        console.error("Failed to load tenant products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user]);

  const totalProducts = products.length;

  const activeProducts = products.filter((product) => product.active).length;

  return (
    <main className="tenant-dashboard">
      <header className="tenant-dashboard-header">
        <div>
          <p className="tenant-dashboard-eyebrow">
            <FontAwesomeIcon icon={faGaugeHigh} />
            TENANT DASHBOARD
          </p>

          <h1>Welcome back</h1>

          <p className="tenant-dashboard-subtitle">
            Manage your products and categories for{" "}
            <strong>{user?.tenant?.name}</strong>.
          </p>
        </div>
      </header>

      {/* DASHBOARD STATS */}
      <section className="tenant-dashboard-stats">
        <article className="tenant-dashboard-stat-card">
          <div className="tenant-dashboard-stat-icon">
            <FontAwesomeIcon icon={faBoxOpen} />
          </div>

          <div>
            <span className="tenant-dashboard-stat-label">TOTAL PRODUCTS</span>

            <strong className="tenant-dashboard-stat-value">
              {loading ? "—" : totalProducts}
            </strong>
          </div>
        </article>

        <article className="tenant-dashboard-stat-card">
          <div className="tenant-dashboard-stat-icon">
            <FontAwesomeIcon icon={faBoxOpen} />
          </div>

          <div>
            <span className="tenant-dashboard-stat-label">ACTIVE PRODUCTS</span>

            <strong className="tenant-dashboard-stat-value">
              {loading ? "—" : activeProducts}
            </strong>
          </div>
        </article>
      </section>

      {/* MANAGEMENT CARDS */}
      <section className="tenant-dashboard-grid">
        <article className="tenant-dashboard-card">
          <div className="tenant-dashboard-card-icon">
            <FontAwesomeIcon icon={faBoxOpen} />
          </div>

          <div className="tenant-dashboard-card-content">
            <span className="tenant-dashboard-card-label">
              PRODUCT MANAGEMENT
            </span>

            <h2>Products</h2>

            <p>
              Add new products, update existing products, manage pricing and
              control available stock.
            </p>

            <Link
              to="/tenant/products"
              className="tenant-dashboard-card-button"
            >
              <span>Manage Products</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </article>

        <article className="tenant-dashboard-card">
          <div className="tenant-dashboard-card-icon">
            <FontAwesomeIcon icon={faTags} />
          </div>

          <div className="tenant-dashboard-card-content">
            <span className="tenant-dashboard-card-label">
              CATEGORY MANAGEMENT
            </span>

            <h2>Categories</h2>

            <p>
              Create, update and manage the categories used to organize your
              products.
            </p>

            <Link
              to="/tenant/categories"
              className="tenant-dashboard-card-button"
            >
              <span>Manage Categories</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}

export default TenantDashboard;
