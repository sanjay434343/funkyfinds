import { create } from 'zustand';
import { User, CartItem } from '../types';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  sizes: string[];
  tags: string[];
}

interface Store {
  user: User | null;
  isAuthenticated: boolean;
  cart: CartItem[];
  isLoginModalOpen: boolean;
  products: Product[];
  setUser: (user: User | null) => void;
  setIsAuthenticated: (status: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  toggleLoginModal: () => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  isAuthenticated: false,
  cart: [],
  isLoginModalOpen: false,
  products: [],
  setUser: (user) => set({ user }),
  setIsAuthenticated: (status) => set({ isAuthenticated: status }),
  addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.productId !== productId),
    })),
  toggleLoginModal: () =>
    set((state) => ({ isLoginModalOpen: !state.isLoginModalOpen })),
}));