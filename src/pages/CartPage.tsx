import { useState } from 'react';
import { useApp } from '../store';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, Phone, User, CreditCard, Wallet, Truck } from 'lucide-react';
import { Order } from '../types';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [customerName, setCustomerName] = useState(state.userName);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'e-wallet' | 'cash-on-delivery'>('e-wallet');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = state.cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const total = subtotal + deliveryFee;

  const canPayWithWallet = state.walletBalance >= total;

  const handlePlaceOrder = async () => {
    if (!customerName || !address || !phone) return;

    if (paymentMethod === 'e-wallet') {
      if (!canPayWithWallet) return;
      await dispatch({
        type: 'DEDUCT_WALLET',
        payload: { amount: total, description: `Order payment - ${state.cart.length} item(s)` },
      });
    }

    const order: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      items: [...state.cart],
      total,
      status: 'pending',
      customerName,
      address,
      phone,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    await dispatch({ type: 'PLACE_ORDER', payload: order });
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md mx-4 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">Order Placed!</h2>
          <p className="text-gray-600 mb-6">Your order has been successfully placed. You can track it in your orders page.</p>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('orders')}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition cursor-pointer"
            >
              View My Orders
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
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
          <h1 className="font-display text-3xl font-bold">
            {step === 'cart' ? 'Shopping Cart' : 'Checkout'}
          </h1>
          <p className="text-white/80 mt-1">
            {step === 'cart'
              ? `${state.cart.length} item(s) in your cart`
              : 'Complete your order details'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'cart' ? 'text-primary font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'cart' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            Cart
          </div>
          <div className="flex-1 h-0.5 bg-gray-200">
            <div className={`h-full bg-primary transition-all ${step === 'checkout' ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center gap-2 ${step === 'checkout' ? 'text-primary font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'checkout' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            Checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'cart' ? (
              <div className="space-y-4">
                {state.cart.map(cartItem => (
                  <div
                    key={cartItem.menuItem.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 animate-fade-in-up"
                  >
                    <img
                      src={cartItem.menuItem.image}
                      alt={cartItem.menuItem.name}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold text-gray-900">{cartItem.menuItem.name}</h3>
                      <p className="text-gray-500 text-sm truncate">{cartItem.menuItem.description}</p>
                      <p className="text-primary font-bold mt-1">${cartItem.menuItem.price.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: cartItem.menuItem.id })}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-xl">
                        <button
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_CART_QUANTITY',
                              payload: { id: cartItem.menuItem.id, quantity: cartItem.quantity - 1 },
                            })
                          }
                          className="p-2 hover:bg-gray-200 rounded-l-xl transition cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{cartItem.quantity}</span>
                        <button
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_CART_QUANTITY',
                              payload: { id: cartItem.menuItem.id, quantity: cartItem.quantity + 1 },
                            })
                          }
                          className="p-2 hover:bg-gray-200 rounded-r-xl transition cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-gray-900">
                        ${(cartItem.menuItem.price * cartItem.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Truck size={20} className="text-primary" /> Delivery Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <User size={14} /> Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <MapPin size={14} /> Delivery Address
                    </label>
                    <textarea
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      rows={3}
                      placeholder="Enter your complete delivery address"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Phone size={14} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                </div>

                <h3 className="font-display text-xl font-semibold flex items-center gap-2 pt-4 border-t">
                  <CreditCard size={20} className="text-primary" /> Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('e-wallet')}
                    className={`p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                      paymentMethod === 'e-wallet'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Wallet size={24} className={paymentMethod === 'e-wallet' ? 'text-primary' : 'text-gray-400'} />
                    <p className="font-semibold mt-2">E-Wallet</p>
                    <p className="text-sm text-gray-500">Balance: ${state.walletBalance.toFixed(2)}</p>
                    {paymentMethod === 'e-wallet' && !canPayWithWallet && (
                      <p className="text-xs text-red-500 mt-1">Insufficient balance</p>
                    )}
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash-on-delivery')}
                    className={`p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                      paymentMethod === 'cash-on-delivery'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard size={24} className={paymentMethod === 'cash-on-delivery' ? 'text-primary' : 'text-gray-400'} />
                    <p className="font-semibold mt-2">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive</p>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" /> Order Summary
              </h3>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {state.cart.map(item => (
                  <div key={item.menuItem.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.menuItem.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full mt-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              ) : (
                <div className="space-y-3 mt-6">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!customerName || !address || !phone || (paymentMethod === 'e-wallet' && !canPayWithWallet)}
                    className="w-full py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-light transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Place Order — ${total.toFixed(2)}
                  </button>
                  <button
                    onClick={() => setStep('cart')}
                    className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition cursor-pointer"
                  >
                    Back to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
