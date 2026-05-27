import { useState } from 'react';
import { useApp } from '../store';
import { ShoppingCart, Search, Filter, Star } from 'lucide-react';

interface MenuPageProps {
  onNavigate: (page: string) => void;
}

const categories = [
  { id: 'all', label: 'All Items', emoji: '🍽️' },
  { id: 'meals', label: 'Meals', emoji: '🥘' },
  { id: 'drinks', label: 'Drinks', emoji: '🥤' },
  { id: 'desserts', label: 'Desserts', emoji: '🍰' },
  { id: 'sides', label: 'Sides', emoji: '🥗' },
];

export default function MenuPage({ onNavigate }: MenuPageProps) {
  const { state, dispatch } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');
  const [addedId, setAddedId] = useState<string | null>(null);

  const filteredItems = state.menuItems
    .filter(item => item.available)
    .filter(item => activeCategory === 'all' || item.category === activeCategory)
    .filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  const handleAddToCart = (item: typeof state.menuItems[0]) => {
    if (!state.isLoggedIn) {
      onNavigate('login');
      return;
    }
    dispatch({ type: 'ADD_TO_CART', payload: item });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-white/80">Explore our delicious selection of meals, drinks, desserts, and more.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-gray-500 text-sm mb-6">
          Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </p>

        {/* Menu Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-6xl mb-4">🍽️</p>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, i) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover border border-gray-100 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="relative h-48 overflow-hidden group">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                  <div className="absolute top-3 right-3 bg-white text-primary px-3 py-1 rounded-full text-sm font-bold shadow">
                    {/* DISPLAY: PESO CURRENCY */}
                    ₱{item.price.toFixed(2)}
                  </div>
                  {item.featured && (
                    <div className="absolute top-3 left-3 bg-accent text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> Featured
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-primary/90 text-white text-xs px-2 py-1 rounded-full capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all cursor-pointer text-sm ${
                      addedId === item.id
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-white hover:bg-primary-light'
                    }`}
                  >
                    {addedId === item.id ? (
                      <>✓ Added!</>
                    ) : (
                      <><ShoppingCart size={16} /> Add to Cart</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
