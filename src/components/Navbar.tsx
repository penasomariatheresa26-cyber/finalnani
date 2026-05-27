import { useState } from 'react';
import { useApp } from '../store';
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  Shield,
  Wallet,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount: number;
}

export default function Navbar({ currentPage, onNavigate, cartCount }: NavbarProps) {
  const { state, dispatch } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = state.isAdmin
    ? [
        { id: 'admin-dashboard', label: 'Dashboard' },
        { id: 'admin-menu', label: 'Manage Menu' },
        { id: 'admin-orders', label: 'Orders' },
      ]
    : [
        { id: 'home', label: 'Home' },
        { id: 'menu', label: 'Menu' },
        { id: 'orders', label: 'My Orders' },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate(state.isAdmin ? 'admin-dashboard' : 'home')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
              <img src="/images/logo.png" alt="Theresse" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-display text-xl font-bold text-primary-dark">Theresse</span>
              <span className="hidden sm:inline text-xs text-gray-500 ml-1">Food Menu</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentPage === link.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {!state.isAdmin && state.isLoggedIn && (
              <>
                {/* Wallet */}
                <button
                  onClick={() => onNavigate('wallet')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    currentPage === 'wallet'
                      ? 'bg-accent text-white'
                      : 'text-gray-700 hover:bg-accent/10'
                  }`}
                >
                  <Wallet size={18} />
                  <span className="hidden sm:inline">${state.walletBalance.toFixed(2)}</span>
                </button>

                {/* Cart */}
                <button
                  onClick={() => onNavigate('cart')}
                  className={`relative p-2 rounded-lg transition-all cursor-pointer ${
                    currentPage === 'cart'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-primary/10'
                  }`}
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse-glow">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* User Menu */}
            {state.isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {state.userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {state.userName}
                  </span>
                  {state.isAdmin && <Shield size={14} className="text-accent" />}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in-up">
                    {!state.isAdmin && (
                      <button
                        onClick={() => {
                          dispatch({ type: 'LOGIN', payload: { name: 'Admin', isAdmin: true } });
                          setUserMenuOpen(false);
                          onNavigate('admin-dashboard');
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        <Shield size={16} />
                        Switch to Admin
                      </button>
                    )}
                    {state.isAdmin && (
                      <button
                        onClick={() => {
                          dispatch({ type: 'LOGIN', payload: { name: state.userName, isAdmin: false } });
                          setUserMenuOpen(false);
                          onNavigate('home');
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        <User size={16} />
                        Switch to User
                      </button>
                    )}
                    <button
                      onClick={() => {
                        dispatch({ type: 'LOGOUT' });
                        setUserMenuOpen(false);
                        onNavigate('home');
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-all cursor-pointer"
              >
                <User size={16} />
                Login
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-fade-in-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentPage === link.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-primary/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
