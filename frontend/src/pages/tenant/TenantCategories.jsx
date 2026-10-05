import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheck,
  faPen,
  faPlus,
  faTags,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import {
  getTenantCategories,
  createTenantCategory,
  updateTenantCategory,
  deleteTenantCategory,
} from "../../services/categoryService";
import "./TenantCategories.css";

function TenantCategories() {
  const { user } = useAuth();
  const tenantDomain = user?.tenant?.domain;

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadCategories = async () => {
    if (!tenantDomain) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getTenantCategories(tenantDomain);

      setCategories(response.data);
    } catch (error) {
      console.error("Failed to load categories:", error);

      setError(error.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [tenantDomain]);

  const handleCreate = async (event) => {
    event.preventDefault();

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await createTenantCategory(tenantDomain, {
        name: trimmedName,
      });

      setCategories((currentCategories) => [
        ...currentCategories,
        response.data,
      ]);

      setCategoryName("");
    } catch (error) {
      console.error("Failed to create category:", error);

      setError(error.response?.data?.message || "Failed to create category.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdate = async (categoryId) => {
    const trimmedName = editingName.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await updateTenantCategory(tenantDomain, categoryId, {
        name: trimmedName,
      });

      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === categoryId ? response.data : category,
        ),
      );

      cancelEditing();
    } catch (error) {
      console.error("Failed to update category:", error);

      setError(error.response?.data?.message || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category) => {
    setDeleteTarget(category);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget.id);
      setError("");

      await deleteTenantCategory(tenantDomain, deleteTarget.id);

      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete category:", error);

      setError(error.response?.data?.message || "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <main className="tenant-categories-state">
        <div className="tenant-categories-loader" />
        <p>Loading categories...</p>
      </main>
    );
  }

  return (
    <main className="tenant-categories-page">
      <header className="tenant-categories-header">
        <div>
          <Link to="/tenant/dashboard" className="tenant-categories-back-link">
            <FontAwesomeIcon icon={faArrowLeft} />
            Dashboard
          </Link>

          <p className="tenant-categories-eyebrow">CATEGORY MANAGEMENT</p>

          <h1>Manage Categories</h1>

          <p>
            Manage categories for <strong>{user?.tenant?.name}</strong>.
          </p>
        </div>
      </header>

      {error && <div className="tenant-categories-error">{error}</div>}

      <section className="tenant-category-create">
        <div className="tenant-category-create-icon">
          <FontAwesomeIcon icon={faPlus} />
        </div>

        <div className="tenant-category-create-content">
          <div className="tenant-category-section-heading">
            <div>
              <h2>Add Category</h2>
              <p>Create a category for your products.</p>
            </div>
          </div>

          <form className="tenant-category-create-form" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="e.g. Shoes, Electronics, Clothing"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              maxLength={255}
              aria-label="Category name"
            />

            <button type="submit" disabled={saving}>
              <FontAwesomeIcon icon={faPlus} />
              {saving ? "Saving..." : "Add Category"}
            </button>
          </form>
        </div>
      </section>

      <section className="tenant-categories-section">
        <div className="tenant-category-list-header">
          <div>
            <p className="tenant-category-list-eyebrow">YOUR CATEGORIES</p>

            <h2>Categories</h2>
          </div>

          <span>
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"}
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="tenant-categories-empty">
            <div className="tenant-categories-empty-icon">
              <FontAwesomeIcon icon={faTags} />
            </div>

            <h3>No categories yet</h3>

            <p>Create your first category above to organize your products.</p>
          </div>
        ) : (
          <div className="tenant-category-list">
            {categories.map((category) => (
              <article className="tenant-category-item" key={category.id}>
                {editingId === category.id ? (
                  <div className="tenant-category-edit">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onKeyDown = {(event) => {
                        if(event.key === "Enter"){
                          handleUpdate(category.id);
                        }
                        if(event.key === "Escape"){
                          cancelEditing()
                        }
                      }}

                      maxLength={255}
                      autoFocus
                    />

                    <div className="tenant-category-actions">
                      <button
                        type="button"
                        className="tenant-category-save-button"
                        onClick={() => handleUpdate(category.id)}
                        disabled={saving}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        Save
                      </button>

                      <button
                        type="button"
                        className="tenant-category-cancel-button"
                        onClick={cancelEditing}
                        disabled={saving}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="tenant-category-info">
                      <div className="tenant-category-icon">
                        <FontAwesomeIcon icon={faTags} />
                      </div>

                      <div>
                        <h3>{category.name}</h3>
                        <span>Category #{category.id}</span>
                      </div>
                    </div>

                    <div className="tenant-category-actions">
                      <button
                        type="button"
                        className="tenant-category-edit-button"
                        onClick={() => startEditing(category)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="tenant-category-delete-button"
                        onClick={() => handleDelete(category)}
                        disabled={deletingId === category.id}
                      >
                        <FontAwesomeIcon icon={faTrash} />

                        {deletingId === category.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      {deleteTarget && (
        <div
          className="tenant-categories-modal-overlay"
          onClick={() => {
            if (!deletingId) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            className="tenant-categories-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="tenant-categories-modal-icon">
              <FontAwesomeIcon icon={faTrash} />
            </div>

            <h2>Delete category?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?
            </p>

            <div className="tenant-categories-modal-actions">
              <button
                type="button"
                className="tenant-categories-modal-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget.id}
              >
                Cancel
              </button>

              <button
                type="button"
                className="tenant-categories-modal-confirm"
                onClick={confirmDelete}
                disabled={deletingId === deleteTarget.id}
              >
                {deletingId === deleteTarget.id
                  ? "Deleting..."
                  : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default TenantCategories;
