import { useState } from 'react';
import { useApp } from '../store';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';

export default function WalletPage() {
  const { state, dispatch } = useApp();
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);

  const quickAmounts = [10, 20, 50, 100];

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (amount > 0) {
      await dispatch({ type: 'TOP_UP_WALLET', payload: amount });
      setTopUpAmount('');
      setShowTopUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Wallet size={28} />
            <h1 className="font-display text-3xl font-bold">My Wallet</h1>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <p className="text-white/70 text-sm mb-1">Available Balance</p>
            <h2 className="font-display text-5xl font-bold mb-6">
              ₱{state.walletBalance.toFixed(2)}
            </h2>
            <button
              onClick={() => setShowTopUp(!showTopUp)}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-light transition cursor-pointer"
            >
              <Plus size={18} /> Top Up Wallet
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Up Modal */}
        {showTopUp && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 animate-fade-in-up">
            <h3 className="font-display text-xl font-semibold mb-4">Top Up Your Wallet</h3>

            <div className="flex flex-wrap gap-3 mb-4">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount.toString())}
                  className={`px-5 py-2 rounded-xl border-2 font-medium transition cursor-pointer ${
                    topUpAmount === amount.toString()
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ₱{amount}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</span>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={e => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <button
                onClick={handleTopUp}
                disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <History size={20} className="text-primary" /> Transaction History
            </h3>
          </div>

          {state.walletTransactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Wallet size={48} className="mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {state.walletTransactions.map(txn => (
                <div key={txn.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      txn.type === 'topup' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {txn.type === 'topup' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{txn.description}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(txn.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`font-bold ${txn.type === 'topup' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {txn.type === 'topup' ? '+' : '-'}₱{txn.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
