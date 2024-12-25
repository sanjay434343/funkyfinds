import { useStore } from '../store/useStore';
import { Product } from '../types';
import { useProducts } from './useProducts';

export const useCart = () => {
  const { cart, addToCart, removeFromCart } = useStore();
  const { products } = useProducts();

  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product,
      total: product ? product.price * item.quantity : 0
    };
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  
  const isInCart = (productId: string) => 
    cart.some(item => item.productId === productId);

  return {
    cartItems,
    cartTotal,
    isInCart,
    addToCart,
    removeFromCart
  };
};