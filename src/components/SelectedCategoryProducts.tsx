import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, SlidersHorizontal, RefreshCw, ChevronDown } from 'lucide-react';
import { realtimeDb } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { ProductCard } from './ProductCard';
import { matchCategory } from '../utils/categoryUtils';

const SelectedCategoryProducts: React.FC = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const productsRef = ref(realtimeDb, 'products');
      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data && category) {
          const filteredProducts = Object.values(data).filter((product: any) => 
            matchCategory(product.category, category)
          );
          setProducts(filteredProducts);
        }
        setLoading(false);
      });
    };
    fetchProducts();
  }, [category]);

  // Save scroll position when leaving
  useEffect(() => {
    return () => {
      const currentScroll = window.scrollY;
      sessionStorage.setItem('productsScrollPosition', currentScroll.toString());
    };
  }, []);

  const sortProducts = (products: any[]) => {
    switch (sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...products].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating);
      default:
        return products;
    }
  };

  const sortedProducts = sortProducts(products);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(-1); // This will go back to the previous page in history
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-gray-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="text-sm text-gray-600 hover:text-black"
        >
          ← Back
        </button>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-black transition-colors"
          >
            <span className="text-sm font-medium">
              {sortOptions.find(opt => opt.value === sortBy)?.label}
            </span>
            <motion.div
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
              >
                {sortOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors
                      ${sortBy === option.value 
                        ? 'bg-black text-white' 
                        : 'hover:bg-gray-50'
                      }`}
                    whileHover={{ x: 4 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <h1 className="text-xl font-medium mb-6">
        {category?.charAt(0).toUpperCase() + category?.slice(1)}
        <span className="text-gray-400 text-sm ml-2">
          ({products.length} items)
        </span>
      </h1>

      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <p className="text-gray-500 text-lg">No products found in {category} category</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Browse All Products
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SelectedCategoryProducts;