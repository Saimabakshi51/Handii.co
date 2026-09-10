import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import AuthModal from './components/AuthModal';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CombosPage from './pages/CombosPage';
import CustomizePage from './pages/CustomizePage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            {/* Persistent Global Header */}
            <Header />

            {/* Global Drawers & Modals */}
            <CartDrawer />
            <WishlistDrawer />
            <AuthModal />

            {/* Distinct Dedicated Full Pages */}
            <main className="main-site-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/combos" element={<CombosPage />} />
                <Route path="/customize" element={<CustomizePage />} />
                <Route path="/dashboard" element={<CustomerDashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>

            {/* Persistent Global Footer */}
            <Footer />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </HashRouter>
  );
}
