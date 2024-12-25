import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '../types';

// Container component for the grid
export const ProductGrid = ({ products }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 px-2 md:px-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/product/${product.id}`} className="block">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.stock < 10 && (
            <motion.span 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] md:text-xs"
            >
              Low Stock
            </motion.span>
          )}
        </div>
        
        <div className="p-2 md:p-3 flex flex-col gap-1">
          <h3 className="font-semibold text-xs md:text-sm truncate">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] md:text-xs text-gray-600">
              {product.rating}
            </span>
          </div>
          
          <div className="flex justify-between items-center mt-auto">
            <div className="flex flex-col">
              <span className="font-bold text-xs md:text-sm">
                ${product.price}
              </span>
              {product.oldPrice && (
                <span className="text-[10px] md:text-xs text-gray-500 line-through">
                  ${product.oldPrice}
                </span>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white px-2 py-1 rounded-full text-[10px] md:text-xs md:px-3 md:py-1.5 transition-colors duration-300 hover:bg-gray-800"
            >
              View
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;