import axios from "axios";
import keycloak from "./keycloak";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints that do NOT require a JWT
const publicEndpoints = ["/auth/register", "/products", "/categories"];

api.interceptors.request.use(
  async (config) => {
    const requestUrl = config.url || "";

    // Do not attach a Keycloak token to public endpoints
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      requestUrl.startsWith(endpoint),
    );

    if (isPublicEndpoint) {
      return config;
    }

    // Attach JWT only to protected requests
    if (keycloak.authenticated) {
      try {
        await keycloak.updateToken(30);

        if (keycloak.token) {
          config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
      } catch (error) {
        console.error("Failed to refresh Keycloak token:", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
