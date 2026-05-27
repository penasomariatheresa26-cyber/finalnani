import { useState } from 'react';
import { AppProvider, useApp } from './store';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import WalletPage from './pages/WalletPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminOrdersPage from './pages/AdminOrdersPage';

function AppContent() {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'menu':
        return <MenuPage onNavigate={handleNavigate} />;
      case 'cart':
        if (!state.isLoggedIn) return <LoginPage onNavigate={handleNavigate} />;
        return <CartPage onNavigate={handleNavigate} />;
      case 'orders':
        if (!state.isLoggedIn) return <LoginPage onNavigate={handleNavigate} />;
        return <OrdersPage onNavigate={handleNavigate} />;
      case 'wallet':
        if (!state.isLoggedIn) return <LoginPage onNavigate={handleNavigate} />;
        return <WalletPage />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        if (!state.isAdmin) return <LoginPage onNavigate={handleNavigate} />;
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'admin-menu':
        if (!state.isAdmin) return <LoginPage onNavigate={handleNavigate} />;
        return <AdminMenuPage />;
      case 'admin-orders':
        if (!state.isAdmin) return <LoginPage onNavigate={handleNavigate} />;
        return <AdminOrdersPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="font-body min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} cartCount={cartCount} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
