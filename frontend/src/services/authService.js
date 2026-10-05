import api from "./api";

export const getCurrentUser = async () => {
  return api.get("/auth/me");
};

export const registerUser = async (userData) => {
  return api.post("/auth/register", userData);
};
