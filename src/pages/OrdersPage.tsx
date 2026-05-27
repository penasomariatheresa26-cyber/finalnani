import { useApp } from '../store';
import { Package, Clock, ChefHat, Truck, CheckCircle, XCircle } from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  preparing: { icon: ChefHat, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Preparing' },
  'out-for-delivery': { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Out for Delivery' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
};

export default function OrdersPage({ onNavigate }: OrdersPageProps) {
  const { state } = useApp();

  if (state.orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-8xl mb-6">📦</div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">No orders yet</h2>
          <p className="text-gray-500 mb-6">Place your first order to see it here!</p>
          <button
            onClick={() => onNavigate('menu')}
            className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition cursor-pointer"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Package size={28} /> My Orders
          </h1>
          <p className="text-white/80 mt-1">{state.orders.length} order(s)</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {state.orders.map((order, i) => {
          const config = statusConfig[order.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-gray-100">
                <div>
                  <h3 className="font-display text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.color}`}>
                  <StatusIcon size={16} />
                  <span className="text-sm font-semibold">{config.label}</span>
                </div>
              </div>

              {/* Items */}
              <div className="p-6">
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.menuItem.id} className="flex items-center gap-3">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.menuItem.name}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                      </div>
                      {/* DISPLAY: PESO CURRENCY */}
                      <p className="font-semibold text-sm">₱{(item.menuItem.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-gray-500 space-y-1">
                  <p>📍 {order.address}</p>
                  <p>💳 {order.paymentMethod === 'e-wallet' ? 'E-Wallet' : 'Cash on Delivery'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  {/* DISPLAY: PESO CURRENCY */}
                  <p className="text-xl font-bold text-primary">₱{order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

