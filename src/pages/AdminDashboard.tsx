import { useApp } from '../store';
import { Package, DollarSign, ShoppingBag, TrendingUp, Clock, CheckCircle, Truck, ChefHat } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { state } = useApp();

  const totalRevenue = state.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = state.orders.filter(o => o.status === 'pending').length;
  const preparingOrders = state.orders.filter(o => o.status === 'preparing').length;
  const deliveredOrders = state.orders.filter(o => o.status === 'delivered').length;

  const stats = [
    { icon: ShoppingBag, label: 'Total Orders', value: state.orders.length, color: 'bg-blue-100 text-blue-600' },
    // Total Revenue is formatted with the Peso sign inside the template string but outside the evaluation block
    { icon: DollarSign, label: 'Total Revenue', value: `₱${totalRevenue.toFixed(2)}`, color: 'bg-green-100 text-green-600' },
    { icon: Package, label: 'Menu Items', value: state.menuItems.length, color: 'bg-purple-100 text-purple-600' },
    { icon: TrendingUp, label: 'Delivered', value: deliveredOrders, color: 'bg-yellow-100 text-yellow-600' },
  ];

  const recentOrders = state.orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-primary-dark to-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-white/80 mt-1">Welcome back, {state.userName}! Here's your overview.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} mb-4`}>
                <stat.icon size={22} />
              </div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Status Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-display text-xl font-semibold mb-6">Order Status</h3>
            <div className="space-y-4">
              {[
                { label: 'Pending', count: pendingOrders, icon: Clock, color: 'bg-yellow-500' },
                { label: 'Preparing', count: preparingOrders, icon: ChefHat, color: 'bg-blue-500' },
                { label: 'Out for Delivery', count: state.orders.filter(o => o.status === 'out-for-delivery').length, icon: Truck, color: 'bg-purple-500' },
                { label: 'Delivered', count: deliveredOrders, icon: CheckCircle, color: 'bg-green-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color} text-white`}>
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{
                          width: `${state.orders.length > 0 ? (item.count / state.orders.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">Recent Orders</h3>
              <button
                onClick={() => onNavigate('admin-orders')}
                className="text-sm text-primary font-medium hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package size={48} className="mx-auto mb-3 opacity-50" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      #{order.id.slice(-4)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₱{order.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'out-for-delivery' ? 'bg-purple-100 text-purple-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('admin-menu')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:border-primary/30 hover:shadow-md transition cursor-pointer"
          >
            <Package size={24} className="text-primary mb-3" />
            <h4 className="font-semibold text-gray-900">Manage Menu</h4>
            <p className="text-sm text-gray-500 mt-1">Add, edit, or remove menu items</p>
          </button>
          <button
            onClick={() => onNavigate('admin-orders')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:border-primary/30 hover:shadow-md transition cursor-pointer"
          >
            <ShoppingBag size={24} className="text-primary mb-3" />
            <h4 className="font-semibold text-gray-900">Manage Orders</h4>
            <p className="text-sm text-gray-500 mt-1">View and update order statuses</p>
          </button>
        </div>
      </div>
    </div>
  );
}
