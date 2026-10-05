import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEye,
  faEyeSlash,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleLogin = () => {
    login();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = formData.username.trim();
    const email = formData.email.trim();

    if (!username || !email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await registerUser({
        username,
        email,
        password: formData.password,
      });

      /*
       * Account has been created successfully.
       *
       * Now send the user directly to Keycloak
       * so they can log in.
       */
      login();
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        {/* Authentication tabs */}
        <div className="auth-tabs">
          <button type="button" className="auth-tab" onClick={handleLogin}>
            Login
          </button>

          <span className="auth-tab auth-tab-active">
            <FontAwesomeIcon icon={faUserPlus} />
            Sign Up
          </span>
        </div>

        {/* Header */}
        <div className="auth-header">
          <p className="auth-eyebrow">CREATE ACCOUNT</p>

          <h1>Create an account</h1>

          <p>Create your account and start shopping.</p>
        </div>

        {/* Registration form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="auth-field">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="password">Password</label>

            <div className="auth-password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm password</label>

            <div className="auth-password-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-button-spinner" />
                Creating account...
              </>
            ) : (
              <>
                Create an account
                <FontAwesomeIcon icon={faArrowRight} />
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="auth-footer">
          Already have an account?{" "}
          <button
            type="button"
            className="auth-inline-button"
            onClick={handleLogin}
          >
            Log in
          </button>
        </p>
      </section>
    </main>
  );
}

export default Register;
