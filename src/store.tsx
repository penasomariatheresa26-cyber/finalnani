import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import { MenuItem, CartItem, Order, WalletTransaction } from './types';

interface AppState {
  menuItems: MenuItem[];
  cart: CartItem[];
  orders: Order[];
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  isAdmin: boolean;
  isLoggedIn: boolean;
  userName: string;
  isLoading: boolean;
  apiError: string | null;
}

interface AppData {
  menuItems: MenuItem[];
  orders: Order[];
  walletBalance: number;
  walletTransactions: WalletTransaction[];
}

type Action =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'SET_API_ERROR'; payload: string | null }
  | { type: 'SET_WALLET'; payload: Pick<AppData, 'walletBalance' | 'walletTransactions'> }
  | { type: 'ADD_TO_CART'; payload: MenuItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'PLACE_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { id: string; status: Order['status'] } }
  | { type: 'TOGGLE_ADMIN' }
  | { type: 'TOP_UP_WALLET'; payload: number }
  | { type: 'DEDUCT_WALLET'; payload: { amount: number; description: string } }
  | { type: 'LOGIN'; payload: { name: string; isAdmin: boolean } }
  | { type: 'LOGOUT' };

type AppDispatch = (action: Action) => Promise<void> | void;

const initialState: AppState = {
  menuItems: [],
  cart: [],
  orders: [],
  walletBalance: 0,
  walletTransactions: [],
  isAdmin: false,
  isLoggedIn: false,
  userName: '',
  isLoading: true,
  apiError: null,
};

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Database request failed');
  }

  return data as T;
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        menuItems: action.payload.menuItems,
        orders: action.payload.orders,
        walletBalance: action.payload.walletBalance,
        walletTransactions: action.payload.walletTransactions,
        isLoading: false,
        apiError: null,
      };
    case 'SET_API_ERROR':
      return { ...state, isLoading: false, apiError: action.payload };
    case 'SET_WALLET':
      return {
        ...state,
        walletBalance: action.payload.walletBalance,
        walletTransactions: action.payload.walletTransactions,
        apiError: null,
      };
    case 'ADD_TO_CART': {
      const existing = state.cart.find(item => item.menuItem.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.menuItem.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, { menuItem: action.payload, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.menuItem.id !== action.payload) };
    case 'UPDATE_CART_QUANTITY':
      if (action.payload.quantity <= 0) {
        return { ...state, cart: state.cart.filter(item => item.menuItem.id !== action.payload.id) };
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item.menuItem.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'ADD_MENU_ITEM':
      return { ...state, menuItems: [action.payload, ...state.menuItems], apiError: null };
    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        apiError: null,
      };
    case 'DELETE_MENU_ITEM':
      return { ...state, menuItems: state.menuItems.filter(item => item.id !== action.payload), apiError: null };
    case 'PLACE_ORDER':
      return { ...state, orders: [action.payload, ...state.orders], cart: [], apiError: null };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? { ...order, status: action.payload.status } : order
        ),
        apiError: null,
      };
    case 'TOGGLE_ADMIN':
      return { ...state, isAdmin: !state.isAdmin };
    case 'TOP_UP_WALLET': {
      const txn: WalletTransaction = {
        id: `txn-${Date.now()}`,
        type: 'topup',
        amount: action.payload,
        description: 'Wallet top-up',
        date: new Date().toISOString(),
      };
      return {
        ...state,
        walletBalance: state.walletBalance + action.payload,
        walletTransactions: [txn, ...state.walletTransactions],
      };
    }
    case 'DEDUCT_WALLET': {
      const txn: WalletTransaction = {
        id: `txn-${Date.now()}`,
        type: 'payment',
        amount: action.payload.amount,
        description: action.payload.description,
        date: new Date().toISOString(),
      };
      return {
        ...state,
        walletBalance: state.walletBalance - action.payload.amount,
        walletTransactions: [txn, ...state.walletTransactions],
      };
    }
    case 'LOGIN':
      return { ...state, isLoggedIn: true, userName: action.payload.name, isAdmin: action.payload.isAdmin };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false, userName: '', isAdmin: false, cart: [] };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: AppDispatch;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, localDispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    let active = true;

    apiRequest<AppData>('/api/app-data')
      .then(data => {
        if (active) {
          localDispatch({ type: 'LOAD_DATA', payload: data });
        }
      })
      .catch(error => {
        if (active) {
          localDispatch({ type: 'SET_API_ERROR', payload: error.message });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const dispatch = useCallback<AppDispatch>(async action => {
    try {
      switch (action.type) {
        case 'ADD_MENU_ITEM': {
          const item = await apiRequest<MenuItem>('/api/menu-items', {
            method: 'POST',
            body: JSON.stringify(action.payload),
          });
          localDispatch({ type: 'ADD_MENU_ITEM', payload: item });
          break;
        }
        case 'UPDATE_MENU_ITEM': {
          const item = await apiRequest<MenuItem>(`/api/menu-items/${encodeURIComponent(action.payload.id)}`, {
            method: 'PUT',
            body: JSON.stringify(action.payload),
          });
          localDispatch({ type: 'UPDATE_MENU_ITEM', payload: item });
          break;
        }
        case 'DELETE_MENU_ITEM':
          await apiRequest<{ success: boolean }>(`/api/menu-items/${encodeURIComponent(action.payload)}`, {
            method: 'DELETE',
          });
          localDispatch(action);
          break;
        case 'PLACE_ORDER': {
          const order = await apiRequest<Order>('/api/orders', {
            method: 'POST',
            body: JSON.stringify(action.payload),
          });
          localDispatch({ type: 'PLACE_ORDER', payload: order });
          break;
        }
        case 'UPDATE_ORDER_STATUS':
          await apiRequest<{ id: string; status: Order['status'] }>(`/api/orders/${encodeURIComponent(action.payload.id)}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: action.payload.status }),
          });
          localDispatch(action);
          break;
        case 'TOP_UP_WALLET': {
          const wallet = await apiRequest<Pick<AppData, 'walletBalance' | 'walletTransactions'>>('/api/wallet/top-up', {
            method: 'POST',
            body: JSON.stringify({ amount: action.payload }),
          });
          localDispatch({ type: 'SET_WALLET', payload: wallet });
          break;
        }
        case 'DEDUCT_WALLET': {
          const wallet = await apiRequest<Pick<AppData, 'walletBalance' | 'walletTransactions'>>('/api/wallet/payment', {
            method: 'POST',
            body: JSON.stringify(action.payload),
          });
          localDispatch({ type: 'SET_WALLET', payload: wallet });
          break;
        }
        default:
          localDispatch(action);
      }
    } catch (error) {
      localDispatch({
        type: 'SET_API_ERROR',
        payload: error instanceof Error ? error.message : 'Database request failed',
      });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
