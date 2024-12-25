import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useState, useEffect } from 'react';

export const FeaturedProducts = () => {
  const { products, isLoading, error } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (products?.length) {
      setFeaturedProducts(products.slice(0, 4));
    }
  }, [products]);

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    },
    hover: {
      scale: 1.03,
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.6
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 px-2">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="w-full">
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48 md:h-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <motion.div
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-gray-900">
            Our Products
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Discover our most popular styles
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-red-500"
            >
              {error}
            </motion.div>
          ) : featuredProducts.length > 0 ? (
            <section>
              <div className="max-w-7xl mx-auto">
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 px-0"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "50px" }}
                >
                  <AnimatePresence>
                    {featuredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover="hover"
                        className="w-full focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 rounded-lg"
                        tabIndex={0}
                      >
                        <ProductCard 
                          product={product}
                          className="h-full transition-shadow duration-300 rounded-lg hover:shadow-xl focus:outline-none"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            </section>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-gray-500"
            >
              No featured products available
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FeaturedProducts;