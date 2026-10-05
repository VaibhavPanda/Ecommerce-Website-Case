import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCheck,
  faPlus,
  faTrash,
  faTriangleExclamation,
  faUserShield,
  faUsers,
  faXmark,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

import {
  getAdminUsers,
  makeTenant,
  removeTenant,
} from "../../services/adminUserService";

import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Make tenant modal
  const [showMakeTenantModal, setShowMakeTenantModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tenantName, setTenantName] = useState("");
  const [tenantDomain, setTenantDomain] = useState("");
  const [makeTenantLoading, setMakeTenantLoading] = useState(false);
  const [makeTenantError, setMakeTenantError] = useState("");

  // Remove tenant modal
  const [showRemoveTenantModal, setShowRemoveTenantModal] = useState(false);
  const [removeTenantLoading, setRemoveTenantLoading] = useState(false);
  const [removeTenantError, setRemoveTenantError] = useState("");

  //fetch all users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminUsers();

      setUsers(response.data);
    } catch (error) {
      console.error("Failed to load admin users:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load users. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // MAKE TENANT
  const openMakeTenantModal = (user) => {
    setSelectedUser(user);

    setTenantName("");
    setTenantDomain("");
    setMakeTenantError("");

    setShowMakeTenantModal(true);
  };

  const closeMakeTenantModal = () => {
    if (makeTenantLoading) {
      return;
    }

    setShowMakeTenantModal(false);
    setSelectedUser(null);
    setTenantName("");
    setTenantDomain("");
    setMakeTenantError("");
  };

  //tenant form sumbition
  const handleMakeTenant = async (event) => {
    event.preventDefault();

    const trimmedName = tenantName.trim();
    const trimmedDomain = tenantDomain.trim();

    if (!trimmedName || !trimmedDomain) {
      setMakeTenantError("Tenant name and tenant domain are required.");
      return;
    }

    try {
      setMakeTenantLoading(true);
      setMakeTenantError("");

      const response = await makeTenant(selectedUser.id, {
        tenantName: trimmedName,
        tenantDomain: trimmedDomain,
      });

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === selectedUser.id ? response.data : user,
        ),
      );

      closeMakeTenantModal();
    } catch (error) {
      console.error("Failed to make user a tenant:", error);

      setMakeTenantError(
        error.response?.data?.message || "Unable to make this user a tenant.",
      );
    } finally {
      setMakeTenantLoading(false);
    }
  };
  // REMOVE TENANT
  const openRemoveTenantModal = (user) => {
    setSelectedUser(user);
    setRemoveTenantError("");
    setShowRemoveTenantModal(true);
  };

  const closeRemoveTenantModal = () => {
    if (removeTenantLoading) {
      return;
    }

    setShowRemoveTenantModal(false);
    setSelectedUser(null);
    setRemoveTenantError("");
  };

  const handleRemoveTenant = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      setRemoveTenantLoading(true);
      setRemoveTenantError("");

      const response = await removeTenant(selectedUser.id);

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === selectedUser.id ? response.data : user,
        ),
      );

      closeRemoveTenantModal();
    } catch (error) {
      console.error("Failed to remove tenant:", error);

      setRemoveTenantError(
        error.response?.data?.message || "Unable to remove tenant access.",
      );
    } finally {
      setRemoveTenantLoading(false);
    }
  };


  // Loading Page
  if (loading) {
    return (
      <main className="admin-users-state">
        <div className="admin-users-loader" />
        <p>Loading users...</p>
      </main>
    );
  }
  // Errror Page
  if (error) {
    return (
      <main className="admin-users-state">
        <div className="admin-users-state-icon">
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </div>

        <h2>Unable to load users</h2>

        <p>{error}</p>

        <button
          type="button"
          className="admin-users-retry-button"
          onClick={loadUsers}
        >
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="admin-users-page">
      <header className="admin-users-header">
        <div>
          <Link to="/admin/dashboard" className="admin-users-back-link">
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Dashboard</span>
          </Link>

          <p className="admin-users-eyebrow">
            <FontAwesomeIcon icon={faUserShield} />
            ADMINISTRATION
          </p>

          <h1>Users</h1>

          <p className="admin-users-subtitle">
            Manage users and tenant access.
          </p>
        </div>

        <div className="admin-users-count">
          <FontAwesomeIcon icon={faUsers} />
          <span>{users.length} users</span>
        </div>
      </header>

      <section className="admin-users-card">
        <div className="admin-users-table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Tenant</th>
                <th>Tenant Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-user-name">{user.username}</div>
                  </td>

                  <td>
                    <span className="admin-user-email">{user.email}</span>
                  </td>

                  <td>
                    <span
                      className={`admin-role-badge admin-role-${user.role.toLowerCase()}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td>
                    {user.tenant ? (
                      <div className="admin-tenant-info">
                        <FontAwesomeIcon icon={faBuilding} />
                        <span>{user.tenant.name}</span>
                      </div>
                    ) : (
                      <span className="admin-no-tenant">—</span>
                    )}
                  </td>

                  <td>
                    {user.tenant ? (
                      <span
                        className={`admin-status-badge ${
                          user.tenant.active
                            ? "admin-status-active"
                            : "admin-status-inactive"
                        }`}
                      >
                        {user.tenant.active ? "Active" : "Inactive"}
                      </span>
                    ) : (
                      <span className="admin-no-tenant">—</span>
                    )}
                  </td>

                  <td>
                    {user.role === "USER" && (
                      <button
                        type="button"
                        className="admin-action-button admin-make-tenant-button"
                        onClick={() => openMakeTenantModal(user)}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Make Tenant</span>
                      </button>
                    )}

                    {user.role === "TENANT" && (
                      <button
                        type="button"
                        className="admin-action-button admin-remove-tenant-button"
                        onClick={() => openRemoveTenantModal(user)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Remove Tenant</span>
                      </button>
                    )}

                    {user.role === "ADMIN" && (
                      <span className="admin-protected-user">
                        <FontAwesomeIcon icon={faUserShield} />
                        Admin
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="admin-users-empty">
            <FontAwesomeIcon icon={faUsers} />

            <h2>No users found</h2>

            <p>There are currently no users to display.</p>
          </div>
        )}
      </section>

      {showMakeTenantModal && selectedUser && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={closeMakeTenantModal}
        >
          <div
            className="admin-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <p className="admin-modal-eyebrow">TENANT MANAGEMENT</p>

                <h2>Make User a Tenant</h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeMakeTenantModal}
                disabled={makeTenantLoading}
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="admin-modal-user">
              <strong>{selectedUser.username}</strong>
              <span>{selectedUser.email}</span>
            </div>

            <form className="admin-modal-form" onSubmit={handleMakeTenant}>
              <div className="admin-form-field">
                <label htmlFor="tenant-name">Tenant Name</label>

                <input
                  id="tenant-name"
                  type="text"
                  value={tenantName}
                  onChange={(event) => setTenantName(event.target.value)}
                  placeholder="e.g. Nike"
                  disabled={makeTenantLoading}
                  autoFocus
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="tenant-domain">Tenant Domain</label>

                <input
                  id="tenant-domain"
                  type="text"
                  value={tenantDomain}
                  onChange={(event) => setTenantDomain(event.target.value)}
                  placeholder="e.g. nike"
                  disabled={makeTenantLoading}
                />

                <span className="admin-form-help">
                  This domain identifies the tenant in the application.
                </span>
              </div>

              {makeTenantError && (
                <div className="admin-modal-error">
                  <FontAwesomeIcon icon={faTriangleExclamation} />

                  <span>{makeTenantError}</span>
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-secondary-button"
                  onClick={closeMakeTenantModal}
                  disabled={makeTenantLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-modal-primary-button"
                  disabled={makeTenantLoading}
                >
                  {makeTenantLoading ? (
                    <>
                      <span className="admin-button-spinner" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      Make Tenant
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRemoveTenantModal && selectedUser && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={closeRemoveTenantModal}
        >
          <div
            className="admin-modal admin-confirm-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="admin-confirm-icon">
              <FontAwesomeIcon icon={faTrash} />
            </div>

            <h2>Remove Tenant Access?</h2>

            <p>
              <strong>{selectedUser.username}</strong> will become a regular
              user and the tenant <strong>{selectedUser.tenant?.name}</strong>{" "}
              will be deactivated.
            </p>

            <p className="admin-confirm-warning">
              Existing products and categories will be preserved.
            </p>

            {removeTenantError && (
              <div className="admin-modal-error">
                <FontAwesomeIcon icon={faTriangleExclamation} />

                <span>{removeTenantError}</span>
              </div>
            )}

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-secondary-button"
                onClick={closeRemoveTenantModal}
                disabled={removeTenantLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-modal-danger-button"
                onClick={handleRemoveTenant}
                disabled={removeTenantLoading}
              >
                {removeTenantLoading ? (
                  <>
                    <span className="admin-button-spinner" />
                    Removing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} />
                    Remove Tenant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminUsers;
