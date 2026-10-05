import api from "./api";

export const getTenantProducts = (tenantDomain, params = {}) => {
  return api.get(`/${tenantDomain}/products`, {
    params,
  });
};

export const createTenantProduct = (tenantDomain, product) => {
  return api.post(`/${tenantDomain}/products`, product);
};

export const updateTenantProduct = (tenantDomain, productId, product) => {
  return api.put(`/${tenantDomain}/products/${productId}`, product);
};

export const deleteTenantProduct = (tenantDomain, productId) => {
  return api.delete(`/${tenantDomain}/products/${productId}`);
};

export const getTenantProduct = (tenantDomain, productId) => {
  return api.get(`/${tenantDomain}/products/${productId}`);
};

export const activateTenantProduct = (tenantDomain, productId) =>
  api.patch(`/${tenantDomain}/products/${productId}/activate`);
