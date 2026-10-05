import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBuilding,
  faChartSimple,
  faShieldHalved,
  faUser,
  faUserShield,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

import { getAdminUsers } from "../../services/adminUserService";

import "./AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch users because the dashboard statistics
  // are calculated from the existing admin users API.
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminUsers();

      setUsers(response.data);
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Calculate dashboard statistics from the users list.
  const stats = useMemo(() => {
    const totalUsers = users.length;

    const adminUsers = users.filter(
      (user) => user.role === "ADMIN",
    ).length;

    const tenantUsers = users.filter(
      (user) => user.role === "TENANT",
    ).length;

    const regularUsers = users.filter(
      (user) => user.role === "USER",
    ).length;

    const activeTenants = users.filter(
      (user) => user.role === "TENANT" && user.tenant?.active,
    ).length;

    return {
      totalUsers,
      adminUsers,
      tenantUsers,
      regularUsers,
      activeTenants,
    };
  }, [users]);

  // Loading state
  if (loading) {
    return (
      <main className="admin-dashboard-state">
        <div className="admin-dashboard-loader" />

        <p>Loading dashboard...</p>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="admin-dashboard-state">
        <div className="admin-dashboard-state-icon">
          <FontAwesomeIcon icon={faChartSimple} />
        </div>

        <h2>Unable to load dashboard</h2>

        <p>{error}</p>

        <button
          type="button"
          className="admin-dashboard-retry-button"
          onClick={loadUsers}
        >
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="admin-dashboard-page">

      {/* PAGE HEADER */}

      <header className="admin-dashboard-header">

        <p className="admin-dashboard-eyebrow">
          <FontAwesomeIcon icon={faShieldHalved} />
          ADMINISTRATION
        </p>

        <h1>Dashboard</h1>

        <p className="admin-dashboard-subtitle">
          Manage users, tenant access and platform activity.
        </p>

      </header>


      {/* STATISTICS */}

      <section className="admin-dashboard-stats">

        <article className="admin-stat-card">

          <div className="admin-stat-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>

          <div>
            <span>Total Users</span>

            <strong>{stats.totalUsers}</strong>
          </div>

        </article>


        <article className="admin-stat-card">

          <div className="admin-stat-icon">
            <FontAwesomeIcon icon={faBuilding} />
          </div>

          <div>
            <span>Active Tenants</span>

            <strong>{stats.activeTenants}</strong>
          </div>

        </article>


        <article className="admin-stat-card">

          <div className="admin-stat-icon">
            <FontAwesomeIcon icon={faUser} />
          </div>

          <div>
            <span>Regular Users</span>

            <strong>{stats.regularUsers}</strong>
          </div>

        </article>


        <article className="admin-stat-card">

          <div className="admin-stat-icon">
            <FontAwesomeIcon icon={faUserShield} />
          </div>

          <div>
            <span>Administrators</span>

            <strong>{stats.adminUsers}</strong>
          </div>

        </article>

      </section>


      {/* ADMIN DASHBOARD CARDS */}

      <section className="admin-dashboard-grid">

        {/* USER MANAGEMENT */}

        <article className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>

              <p className="admin-dashboard-card-eyebrow">
                USER MANAGEMENT
              </p>

              <h2>Users & Tenants</h2>

            </div>

            <div className="admin-dashboard-card-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>

          </div>


          <p className="admin-dashboard-card-description">
            View platform users, manage tenant access, create new
            tenants and deactivate existing tenant access.
          </p>


          <div className="admin-dashboard-summary">

            <div>
              <span>Tenant users</span>
              <strong>{stats.tenantUsers}</strong>
            </div>

            <div>
              <span>Active tenants</span>
              <strong>{stats.activeTenants}</strong>
            </div>

            <div>
              <span>Regular users</span>
              <strong>{stats.regularUsers}</strong>
            </div>

          </div>


          <Link
            to="/admin/users"
            className="admin-dashboard-primary-link"
          >
            Manage Users

            <FontAwesomeIcon icon={faArrowRight} />
          </Link>

        </article>


        {/* QUICK ACTION */}

        <article className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>

              <p className="admin-dashboard-card-eyebrow">
                QUICK ACTION
              </p>

              <h2>Platform Users</h2>

            </div>

            <div className="admin-dashboard-card-icon">
              <FontAwesomeIcon icon={faUserShield} />
            </div>

          </div>


          <p className="admin-dashboard-card-description">
            Open the complete user management table to review
            roles and tenant assignments.
          </p>


          <Link
            to="/admin/users"
            className="admin-dashboard-secondary-link"
          >
            Open User List

            <FontAwesomeIcon icon={faArrowRight} />
          </Link>

        </article>

      </section>

    </main>
  );
}

export default AdminDashboard;
