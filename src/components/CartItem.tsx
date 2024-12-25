import { motion } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { CartItem as CartItemType } from '../types';
import { useStore } from '../store/useStore';

interface CartItemProps {
  item: CartItemType;
  product: any;
}

export const CartItem = ({ item, product }: CartItemProps) => {
  const { removeFromCart } = useStore();

  if (!product) {
    return <div>No product data available</div>;
  }

  const { images, name, price } = product;

  if (!images || images.length === 0) {
    return <div>No images available</div>;
  }

  if (!name || !price) {
    return <div>Product data is incomplete</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-4 border-b border-gray-200 py-4"
    >
      <img
        src={images[0]}
        alt={name}
        className="w-24 h-24 object-cover rounded-lg"
      />
      
      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="font-medium">{name}</h3>
          <button
            onClick={() => removeFromCart(product.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          <p>Size: {item.size}</p>
          <p>Color: {item.color}</p>
          <p>Qty: {item.quantity}</p>

        </div>
        
        <div className="mt-2 flex justify-between items-center">
  <div className="flex items-center gap-2">
  </div>
  <span className="font-medium">${(price * item.quantity).toFixed(2)}</span>
</div>
      </div>
    </motion.div>
  );
};