import { useState } from 'react';
import { useApp } from '../store';
import { MenuItem } from '../types';
import { Plus, Edit3, Trash2, X, Save, Image, ToggleLeft, ToggleRight, Search } from 'lucide-react';

export default function AdminMenuPage() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'meals' as MenuItem['category'],
    available: true,
    featured: false,
  });

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'meals',
      available: true,
      featured: false,
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const openEditForm = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      available: item.available,
      featured: item.featured || false,
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.image) return;

    const menuItem: MenuItem = {
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image: form.image,
      category: form.category,
      available: form.available,
      featured: form.featured,
    };

    if (editingItem) {
      await dispatch({ type: 'UPDATE_MENU_ITEM', payload: menuItem });
    } else {
      await dispatch({ type: 'ADD_MENU_ITEM', payload: menuItem });
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await dispatch({ type: 'DELETE_MENU_ITEM', payload: id });
    setDeleteConfirm(null);
  };

  const toggleAvailability = async (item: MenuItem) => {
    await dispatch({ type: 'UPDATE_MENU_ITEM', payload: { ...item, available: !item.available } });
  };

  const filteredItems = state.menuItems
    .filter(item => filterCategory === 'all' || item.category === filterCategory)
    .filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const imageOptions = [
    '/images/food-1.jpg',
    '/images/food-2.jpg',
    '/images/food-3.jpg',
    '/images/food-4.jpg',
    '/images/food-5.jpg',
    '/images/food-6.jpg',
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-primary-dark to-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Manage Menu</h1>
            <p className="text-white/80 mt-1">{state.menuItems.length} items in menu</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition cursor-pointer"
          >
            <Plus size={18} /> Add New Item
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="font-display text-xl font-semibold">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g., Grilled Chicken Platter"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    rows={3}
                    placeholder="Describe the item..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value as MenuItem['category'] })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white"
                    >
                      <option value="meals">🥘 Meals</option>
                      <option value="drinks">🥤 Drinks</option>
                      <option value="desserts">🍰 Desserts</option>
                      <option value="sides">🥗 Sides</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image size={14} className="inline mr-1" /> Food Image *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {imageOptions.map(img => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => setForm({ ...form, image: img })}
                        className={`relative rounded-xl overflow-hidden h-24 border-3 transition cursor-pointer ${
                          form.image === img ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {form.image === img && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <span className="text-white text-2xl">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    className="w-full mt-3 px-4 py-2 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm"
                    placeholder="Or enter custom image URL..."
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.available}
                      onChange={e => setForm({ ...form, available: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={e => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save size={16} /> {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fade-in-up">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Item?</h3>
                <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-sm"
          >
            <option value="all">All Categories</option>
            <option value="meals">Meals</option>
            <option value="drinks">Drinks</option>
            <option value="desserts">Desserts</option>
            <option value="sides">Sides</option>
          </select>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Item</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Price</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item, i) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                          <p className="text-gray-400 text-xs truncate max-w-[200px]">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-900">${item.price.toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleAvailability(item)}
                        className={`flex items-center gap-1.5 text-sm font-medium cursor-pointer ${
                          item.available ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {item.available ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        {item.available ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🍽️</p>
              <p>No items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
