import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./pages/Products";
import Home from "./pages/Home";
import Navbar from "./components/Navbar/Navbar";
import ProductDetails from "./pages/ProductDetails";
import Favorites from "./pages/Favorites";
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoutes";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import TenantProducts from "./pages/tenant/TenantProducts";
import CreateProduct from "./pages/tenant/CreateProduct";
import EditProduct from "./pages/tenant/EditProduct";
import TenantCategories from "./pages/tenant/TenantCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        //public
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/register" element={<Register />} />
        //customer
        <Route element={<ProtectedRoute allowedRoles={["USER", "TENANT"]} />}>
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />}></Route>
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
        </Route>
        //tenant
        <Route element={<ProtectedRoute allowedRoles={["TENANT"]} />}>
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />
          <Route path="/tenant/products" element={<TenantProducts />} />
          <Route path="/tenant/products/new" element={<CreateProduct />} />
          <Route
            path="/tenant/products/:productId/edit"
            element={<EditProduct />}
          />
          <Route path="/tenant/categories" element={<TenantCategories />} />
        </Route>
        //admin
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
