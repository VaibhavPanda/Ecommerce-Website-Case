import { createContext, useContext, useEffect, useState } from "react";

import keycloak from "../services/keycloak";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

let keycloakInitPromise = null;

const initializeKeycloak = () => {
  if (!keycloakInitPromise) {
    keycloakInitPromise = keycloak.init({
      onLoad: "check-sso",
      pkceMethod: "S256",
      checkLoginIframe: false,
    });
  }

  return keycloakInitPromise;
};

export function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeKeycloak()
      .then(async (isAuthenticated) => {
        setAuthenticated(isAuthenticated);

        if (isAuthenticated) {
          try {
            const response = await getCurrentUser();
            setUser(response.data);
          } catch (error) {
            console.error("Failed to load application user:", error);
          }
        }
      })
      .catch((error) => {
        console.error("Keycloak initialization failed:", error);
      })
      .finally(() => {
        setInitialized(true);
      });
  }, []);

  const login = () => {
    keycloak.login({
      redirectUri: window.location.origin,
    });
  };

  const logout = () => {
    setUser(null);
    setAuthenticated(false);

    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        keycloak,
        initialized,
        authenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
