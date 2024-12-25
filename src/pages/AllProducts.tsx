import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { realtimeDb } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { scrollManager } from '../utils/scrollManager';
import { matchCategory } from '../utils/categoryUtils';
import { ChevronDown } from 'lucide-react';

const categories = [
  { name: 'Clothing', path: '/SelectedCategoryProducts/Clothing' },
  { name: 'Makeup', path: '/SelectedCategoryProducts/Makeup' },
  { name: 'Gadgets', path: '/SelectedCategoryProducts/Gadgets' },
  { name: 'Electronics', path: '/SelectedCategoryProducts/Electronics' },
  { name: 'Home & Kitchen', path: '/SelectedCategoryProducts/Home & Kitchen' },
  { name: 'Books', path: '/SelectedCategoryProducts/Books' },
  { name: 'Toys', path: '/SelectedCategoryProducts/Toys' },
  { name: 'Sports', path: '/SelectedCategoryProducts/Sports' },
  { name: 'Footwear', path: '/SelectedCategoryProducts/Footwear' },
  { name: 'Accessories', path: '/SelectedCategoryProducts/Accessories' },
];

const AllProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [showCategories, setShowCategories] = useState(() => {
    return sessionStorage.getItem('showCategories') === 'true'
  });
  const scrollTimeout = useRef(null);
  const location = useLocation();
  const productsRef = useRef<HTMLDivElement>(null);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        localStorage.setItem('productsScrollPosition', window.scrollY.toString());
      }, 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout.current);
    };
  }, []);

  // Save scroll position before navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('productsScrollPosition', window.scrollY.toString());
    };

    // Save position when leaving the page
    return () => {
      handleBeforeUnload();
    };
  }, []);

  // Fetch products
  useEffect(() => {
    const productsRef = ref(realtimeDb, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const productList = data ? Object.values(data) : [];
      setProducts(productList);
      setLoading(false);
    });
  }, []);

  // Save dropdown state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('showCategories', showCategories.toString());
  }, [showCategories]);

  // Modified scroll position restoration
  useEffect(() => {
    if (!loading && products.length > 0) {
      requestAnimationFrame(() => {
        // First try to get the position from sessionStorage
        const savedPosition = sessionStorage.getItem('productsScrollPosition');
        const lastViewedProduct = sessionStorage.getItem('lastViewedProduct');

        if (savedPosition) {
          window.scrollTo({
            top: parseInt(savedPosition),
            behavior: 'instant'
          });
        } else if (lastViewedProduct) {
          const element = document.getElementById(`product-${lastViewedProduct}`);
          if (element) {
            element.scrollIntoView({ block: 'center', behavior: 'instant' });
          }
        }

        // Setup intersection observer after position is restored
        const elements = document.querySelectorAll('[id^="product-"]');
        elements.forEach(element => {
          scrollManager.observeProduct(element);
        });
      });
    }

    // Cleanup
    return () => {
      const currentScroll = window.scrollY;
      sessionStorage.setItem('productsScrollPosition', currentScroll.toString());
      scrollManager.disconnectAll();
    };
  }, [loading, products]);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => matchCategory(p.category, selectedCategory));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05 // Faster stagger effect
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 }, // Reduced y distance
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2 // Faster animation
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 px-2"
      >
        All Products
      </motion.h1>

      <div className="flex items-center justify-between gap-4 mb-4 md:mb-8 px-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {['all', 'men', 'women'].map(category => (
            <motion.button
              key={category}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm whitespace-nowrap transition-colors duration-300 ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCategories(!showCategories)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm"
        >
          Categories
          <motion.div
            animate={{ rotate: showCategories ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {showCategories && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-8"
          >
            <div className="flex flex-wrap gap-2 px-2">
              {categories.map((category) => (
                <motion.div
                  key={category.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={category.path}
                    className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-black transition-colors"
                  >
                    {category.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory} // Force re-render on category change
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 px-2"
            layout
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                id={`product-${product.id}`} // Add this ID to help with scrolling
                variants={itemVariants}
                layoutId={product.id} // Add layoutId for smooth transitions
                className="w-full"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {filteredProducts.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-500"
        >
          No products found in this category
        </motion.div>
      )}
    </div>
  );
};

export default AllProducts;