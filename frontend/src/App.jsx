import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import CreateListing from './pages/CreateListing';
import AdminPanel from './pages/AdminPanel';

function AppRoutes() {
  // console.log("loading routes");
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        {/* <Route path="/test" element={<h1>Testing page</h1>} /> */}

        {/* Buyer */}
        <Route
          path="/buyer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Seller*/}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/create-listing"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/edit-listing/:id"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <CreateListing isEditMode={true} />
            </ProtectedRoute>
          }
        />

        {/* Admin*/}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Redirects to home if wrong url typed */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    // <BrowserRouter> // changed this
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
