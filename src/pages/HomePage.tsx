import { useApp } from '../store';
import { ShoppingCart, Star, Truck, CreditCard, Clock, ArrowRight, Utensils } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { state, dispatch } = useApp();
  const featuredItems = state.menuItems.filter(item => item.featured && item.available);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-bg.jpg"
            alt="Delicious food"
            className="w-full h-full object-cover"
          />
          <div className="hero-gradient absolute inset-0" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-6 animate-fade-in-up">
            <Utensils size={16} />
            <span>Welcome to Theresse Food Menu</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Delicious Food,<br />
            <span className="text-accent-light">Delivered Fresh</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Experience the finest culinary creations from our kitchen to your doorstep. Fresh ingredients, authentic flavors, and convenient delivery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => onNavigate('menu')}
              className="px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-light transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer text-lg"
            >
              Browse Menu <ArrowRight size={20} />
            </button>
            {!state.isLoggedIn && (
              <button
                onClick={() => onNavigate('login')}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all border border-white/30 cursor-pointer text-lg"
              >
                Sign In to Order
              </button>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: 'Fast Delivery', desc: 'Get your food delivered to your doorstep in 30 minutes or less.' },
              { icon: CreditCard, title: 'E-Wallet Payment', desc: 'Secure and convenient online payment through our integrated e-wallet.' },
              { icon: Clock, title: 'Fresh & Quick', desc: 'Freshly prepared meals made with the finest ingredients, served fast.' },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 text-center card-hover shadow-sm animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon size={28} className="text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Our Specialties</span>
            <h2 className="font-display text-4xl font-bold text-gray-900 mt-2">Featured Dishes</h2>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">Handpicked favorites from our menu, crafted with love and the freshest ingredients.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item, i) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md card-hover animate-fade-in-up border border-gray-100"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {/* CHANGED TO PESO CURRENCY */}
                    ₱{item.price.toFixed(2)}
                  </div>
                  <div className="absolute top-3 left-3 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Featured
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <button
                    onClick={() => {
                      if (!state.isLoggedIn) {
                        onNavigate('login');
                        return;
                      }
                      dispatch({ type: 'ADD_TO_CART', payload: item });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-all cursor-pointer text-sm"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate('menu')}
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              View Full Menu <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to Order?</h2>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of satisfied customers enjoying fresh, delicious meals delivered right to their door.
          </p>
          <button
            onClick={() => onNavigate(state.isLoggedIn ? 'menu' : 'login')}
            className="px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-light transition-all shadow-lg text-lg cursor-pointer"
          >
            {state.isLoggedIn ? 'Order Now' : 'Get Started'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display text-2xl font-bold mb-3">Theresse <span className="text-accent">Food Menu</span></h3>
              <p className="text-gray-400 text-sm">Delicious food delivered to your doorstep. Quality meals, affordable prices, and fast delivery.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => onNavigate('home')} className="hover:text-accent transition cursor-pointer">Home</button></li>
                <li><button onClick={() => onNavigate('menu')} className="hover:text-accent transition cursor-pointer">Menu</button></li>
                <li><button onClick={() => onNavigate('orders')} className="hover:text-accent transition cursor-pointer">My Orders</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact Us</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>📍 Hinunangan Southern, Leyte</li>
                <li>📞 +63 9552085854</li>
                <li>✉️ penasomariatheresa26@gmail.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2025 Theresse Food Menu. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
