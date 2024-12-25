import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Product } from '../types';

interface AddToCartButtonProps {
  product: Product;
  selectedSize: string;
  selectedColor: string;
}

export const AddToCartButton = ({ product, selectedSize, selectedColor }: AddToCartButtonProps) => {
  const { addToCart, isAuthenticated, toggleLoginModal } = useStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toggleLoginModal();
      return;
    }

    setIsAdding(true);
    addToCart({
      productId: product.id,
      quantity: 1,
      size: selectedSize,
      color: selectedColor
    });

    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`
        w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full
        ${isAdding ? 'bg-green-500' : 'bg-black'}
        text-white font-medium transition-colors
      `}
    >
      <ShoppingCart size={20} />
      {isAdding ? 'Added!' : 'Add to Cart'}
    </motion.button>
  );
};