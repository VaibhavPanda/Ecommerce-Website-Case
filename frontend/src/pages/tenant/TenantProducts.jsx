import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBoxOpen,
  faPen,
  faPlus,
  faTrash,
  faRotateLeft
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import {
  getTenantProducts,
  deleteTenantProduct,
  activateTenantProduct,
} from "../../services/tenantProductService";
import "./TenantProducts.css";

function TenantProducts() {
  const { user } = useAuth();
  const tenantDomain = user?.tenant?.domain;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activatingId, setActivatingId] = useState(null);

  const loadProducts = async () => {
    if (!tenantDomain) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getTenantProducts(tenantDomain);

      setProducts(response.data.content || []);
    } catch (error) {
      console.error("Failed to load tenant products:", error);

      setError(error.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [tenantDomain]);

  const handleDelete = (product) => {
    setDeleteTarget(product);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget.id);
      setError("");

      await deleteTenantProduct(tenantDomain, deleteTarget.id);

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      setError(error.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleActivate = async (product) => {
    try {
      setActivatingId(product.id);
      setError("");

      const response = await activateTenantProduct(tenantDomain, product.id);

      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct.id === product.id ? response.data : currentProduct,
        ),
      );
    } catch (error) {
      console.error("Failed to activate product:", error);

      setError(error.response?.data?.message || "Failed to activate product.");
    } finally {
      setActivatingId(null);
    }
  };

  if (loading) {
    return (
      <main className="tenant-products-state">
        <div className="tenant-products-loader" />
        <p>Loading products...</p>
      </main>
    );
  }

  if (error && products.length === 0) {
    return (
      <main className="tenant-products-state">
        <div className="tenant-products-state-icon">!</div>

        <h2>Unable to load products</h2>

        <p>{error}</p>

        <button
          type="button"
          className="tenant-products-primary-button"
          onClick={loadProducts}
        >
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="tenant-products-page">
      <header className="tenant-products-header">
        <div>
          <Link to="/tenant/dashboard" className="tenant-products-back-link">
            <FontAwesomeIcon icon={faArrowLeft} />
            Dashboard
          </Link>

          <p className="tenant-products-eyebrow">PRODUCT MANAGEMENT</p>

          <h1>Manage Products</h1>

          <p>
            Manage products listed under <strong>{user?.tenant?.name}</strong>.
          </p>
        </div>

        <Link to="/tenant/products/new" className="tenant-products-add-button">
          <FontAwesomeIcon icon={faPlus} />
          Add Product
        </Link>
      </header>

      {error && <div className="tenant-products-inline-error">{error}</div>}

      <div className="tenant-products-result-info">
        <span>
          {products.length} {products.length === 1 ? "product" : "products"}
        </span>
      </div>

      {products.length === 0 ? (
        <section className="tenant-products-empty">
          <div className="tenant-products-empty-icon">
            <FontAwesomeIcon icon={faBoxOpen} />
          </div>

          <h2>No products yet</h2>

          <p>You haven't added any products to your store yet.</p>

          <Link
            to="/tenant/products/new"
            className="tenant-products-primary-button"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Your First Product
          </Link>
        </section>
      ) : (
        <section className="tenant-products-list">
          {products.map((product) => {
            const isOutOfStock = product.quantity <= 0;

            return (
              <article className="tenant-product-card" key={product.id}>
                <div className="tenant-product-main">
                  <div className="tenant-product-icon">
                    <FontAwesomeIcon icon={faBoxOpen} />
                  </div>

                  <div className="tenant-product-info">
                    <div className="tenant-product-heading">
                      <h2>{product.name}</h2>

                      <span
                        className={`tenant-product-status ${
                          product.active
                            ? "tenant-product-status-active"
                            : "tenant-product-status-inactive"
                        }`}
                      >
                        {product.active ? "Active" : "Inactive"}
                      </span>

                      <span
                        className={`tenant-product-stock ${
                          isOutOfStock
                            ? "tenant-product-stock-out"
                            : "tenant-product-stock-available"
                        }`}
                      >
                        {isOutOfStock
                          ? "Out of stock"
                          : `${product.quantity} in stock`}
                      </span>
                    </div>

                    <p className="tenant-product-category">
                      {product.categoryName}
                    </p>

                    {product.description && (
                      <p className="tenant-product-description">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="tenant-product-price">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </div>

                <div className="tenant-product-actions">
                  <Link
                    to={`/tenant/products/${product.id}/edit`}
                    className="tenant-product-edit-button"
                  >
                    <FontAwesomeIcon icon={faPen} />
                    Edit
                  </Link>

                  {product.active ? (
                    <button
                      type="button"
                      className="tenant-product-delete-button"
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product.id}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      {deletingId === product.id ? "Deleting..." : "Deactivate"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="tenant-product-activate-button"
                      onClick={() => handleActivate(product)}
                      disabled={activatingId === product.id}
                    >
                      <FontAwesomeIcon icon={faRotateLeft} />
                      {activatingId === product.id
                        ? "Activating..."
                        : "Activate"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {deleteTarget && (
        <div
          className="tenant-products-modal-overlay"
          onClick={() => {
            if (!deletingId) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            className="tenant-products-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="tenant-products-modal-icon">
              <FontAwesomeIcon icon={faTrash} />
            </div>

            <h2>Delete product?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?
            </p>

            <div className="tenant-products-modal-actions">
              <button
                type="button"
                className="tenant-products-modal-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget.id}
              >
                Cancel
              </button>

              <button
                type="button"
                className="tenant-products-modal-confirm"
                onClick={confirmDelete}
                disabled={deletingId === deleteTarget.id}
              >
                {deletingId === deleteTarget.id
                  ? "Deleting..."
                  : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default TenantProducts;
