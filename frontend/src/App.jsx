import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import TrackOrder from './pages/TrackOrder';
import AdminOrders from './pages/AdminOrders';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CatalogProvider } from './context/CatalogContext';
import AdminRoute from './components/AdminRoute';
import AdminLogin from './pages/AdminLogin';
import AdminProducts from './pages/AdminProducts';
import './App.css';

function App() {
  return (
    <CartProvider>
      <AdminAuthProvider>
        <CatalogProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<Success />} />
              <Route path="/track" element={<TrackOrder />} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CatalogProvider>
      </AdminAuthProvider>
    </CartProvider>
  );
}

export default App;
