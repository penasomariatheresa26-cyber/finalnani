import { useState } from 'react';
import { useApp } from '../store';
import { User, Shield, LogIn, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { dispatch } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAs, setLoginAs] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    dispatch({
      type: 'LOGIN',
      payload: { name: name.trim(), isAdmin: loginAs === 'admin' },
    });
    onNavigate(loginAs === 'admin' ? 'admin-dashboard' : 'home');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-light p-8 text-center text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn size={28} />
            </div>
            <h2 className="font-display text-3xl font-bold">Welcome Back</h2>
            <p className="text-white/80 mt-1">Sign in to your Theresse account</p>
          </div>

          {/* Login Type Toggle */}
          <div className="flex p-2 m-6 mb-0 bg-gray-100 rounded-xl">
            <button
              onClick={() => setLoginAs('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
                loginAs === 'user'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={16} /> Customer
            </button>
            <button
              onClick={() => setLoginAs('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
                loginAs === 'admin'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield size={16} /> Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder={loginAs === 'admin' ? 'Admin Name' : 'Your Name'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder={loginAs === 'admin' ? 'admin@theresse.com' : 'you@email.com'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition pr-12"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-light transition cursor-pointer text-lg mt-2"
            >
              {loginAs === 'admin' ? 'Sign In as Admin' : 'Sign In'}
            </button>

            <p className="text-center text-gray-500 text-sm">
              Demo mode — enter any credentials to sign in
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
