import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Preloader } from './components/layout/Preloader';
import { SiteHeader } from './components/layout/SiteHeader';
import { SiteFooter } from './components/layout/SiteFooter';
import { CartDrawer } from './components/layout/CartDrawer';
import { CinematicHomePage } from './components/pizza/CinematicHomePage';
import { InteractivePizzaBuilderPage } from './components/pizza/InteractivePizzaBuilderPage';
import { StitchCheckoutTrackingPage } from './components/order/StitchCheckoutTrackingPage';
import { StitchAdminDashboard } from './components/admin/StitchAdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import {
  RegisterPage,
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from './components/auth/AuthPages';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-container border-t-transparent" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-container border-t-transparent" />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/menu" replace />;
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md">
      <SiteHeader />
      <main className="flex-1 pt-20">{children}</main>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Preloader />
      <Routes>
        {/* Guest Storefront Pages (Matching Stitch Design) */}
        <Route
          path="/"
          element={
            <Layout>
              <CinematicHomePage />
            </Layout>
          }
        />
        <Route
          path="/menu"
          element={
            <Layout>
              <CinematicHomePage />
            </Layout>
          }
        />
        <Route
          path="/builder"
          element={
            <Layout>
              <InteractivePizzaBuilderPage />
            </Layout>
          }
        />
        <Route
          path="/build-your-pizza"
          element={
            <Layout>
              <InteractivePizzaBuilderPage />
            </Layout>
          }
        />

        {/* Multi-Step Checkout & Live Tracking */}
        <Route
          path="/checkout"
          element={
            <Layout>
              <StitchCheckoutTrackingPage initialMode="checkout" />
            </Layout>
          }
        />
        <Route
          path="/track"
          element={
            <Layout>
              <StitchCheckoutTrackingPage initialMode="tracking" />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <StitchCheckoutTrackingPage initialMode="tracking" />
            </Layout>
          }
        />

        {/* Authentication Pages */}
        <Route
          path="/register"
          element={
            <Layout>
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            </Layout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Layout>
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            </Layout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Layout>
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            </Layout>
          }
        />
        <Route
          path="/verify-email"
          element={
            <Layout>
              <PublicRoute>
                <VerifyEmailPage />
              </PublicRoute>
            </Layout>
          }
        />

        {/* Admin Kitchen Operations & Inventory Control (Full Stitch Admin Layout) */}
        <Route
          path="/admin/login"
          element={
            <Layout>
              <AdminLoginPage />
            </Layout>
          }
        />
        <Route path="/admin" element={<StitchAdminDashboard />} />
        <Route path="/admin/*" element={<StitchAdminDashboard />} />

        {/* Fallback Catch-All */}
        <Route
          path="*"
          element={
            <Layout>
              <Navigate to="/menu" replace />
            </Layout>
          }
        />
      </Routes>
    </>
  );
}