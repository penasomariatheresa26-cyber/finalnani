import { useState } from 'react';
import { useApp } from '../store';
import { Order } from '../types';
import { Package, Clock, ChefHat, Truck, CheckCircle, XCircle, Eye, X } from 'lucide-react';

const statusSteps: Order['status'][] = ['pending', 'preparing', 'out-for-delivery', 'delivered'];

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  preparing: { icon: ChefHat, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Preparing' },
  'out-for-delivery': { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Out for Delivery' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
};

export default function AdminOrdersPage() {
  const { state, dispatch } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = state.orders.filter(
    order => filterStatus === 'all' || order.status === filterStatus
  );

  const updateStatus = async (orderId: string, status: Order['status']) => {
    await dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id: orderId, status } });
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-primary-dark to-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Package size={28} /> Manage Orders
          </h1>
          <p className="text-white/80 mt-1">{state.orders.length} total order(s)</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {[
            { id: 'all', label: 'All', count: state.orders.length },
            { id: 'pending', label: 'Pending', count: state.orders.filter(o => o.status === 'pending').length },
            { id: 'preparing', label: 'Preparing', count: state.orders.filter(o => o.status === 'preparing').length },
            { id: 'out-for-delivery', label: 'Delivery', count: state.orders.filter(o => o.status === 'out-for-delivery').length },
            { id: 'delivered', label: 'Delivered', count: state.orders.filter(o => o.status === 'delivered').length },
            { id: 'cancelled', label: 'Cancelled', count: state.orders.filter(o => o.status === 'cancelled').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                filterStatus === tab.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="font-display text-xl font-semibold">Order #{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Details */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer</h4>
                  <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-500">📍 {selectedOrder.address}</p>
                  <p className="text-sm text-gray-500">📞 {selectedOrder.phone}</p>
                  <p className="text-sm text-gray-500">
                    💳 {selectedOrder.paymentMethod === 'e-wallet' ? 'E-Wallet' : 'Cash on Delivery'}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map(item => (
                      <div key={item.menuItem.id} className="flex items-center gap-3">
                        <img src={item.menuItem.image} alt={item.menuItem.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.menuItem.name}</p>
                          <p className="text-xs text-gray-500">x{item.quantity}</p>
                        </div>
                        <p className="font-semibold text-sm">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Update Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {statusSteps.map(status => {
                      const config = statusConfig[status];
                      const StatusIcon = config.icon;
                      return (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedOrder.id, status)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition cursor-pointer ${
                            selectedOrder.status === status
                              ? `${config.bg} border-current ${config.color}`
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <StatusIcon size={16} />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                    className={`mt-2 w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition cursor-pointer ${
                      selectedOrder.status === 'cancelled'
                        ? 'bg-red-100 border-red-300 text-red-600'
                        : 'border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'
                    }`}
                  >
                    <XCircle size={16} /> Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, i) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        #{order.id.slice(-4)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.customerName}</h3>
                        <p className="text-sm text-gray-500">
                          {order.items.length} item(s) •{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
                        <StatusIcon size={14} />
                        {config.label}
                      </div>
                      <span className="font-bold text-lg text-gray-900">${order.total.toFixed(2)}</span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Quick status buttons */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      {statusSteps
                        .filter(s => statusSteps.indexOf(s) > statusSteps.indexOf(order.status as typeof s))
                        .slice(0, 1)
                        .map(nextStatus => {
                          const nextConfig = statusConfig[nextStatus];
                          const NextIcon = nextConfig.icon;
                          return (
                            <button
                              key={nextStatus}
                              onClick={() => updateStatus(order.id, nextStatus)}
                              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition cursor-pointer"
                            >
                              <NextIcon size={14} /> Move to {nextConfig.label}
                            </button>
                          );
                        })}
                      <button
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition cursor-pointer"
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
