import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { realtimeDb } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';
import SelectedCategoryProducts from '../components/SelectedCategoryProducts';

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

const categoryImages = {
    Clothing: 'https://cdn.pixabay.com/photo/2014/08/26/21/49/shirts-428627_960_720.jpg',
    Makeup: 'https://cdn.pixabay.com/photo/2018/01/14/00/05/makeup-3081015_960_720.jpg',
    Gadgets: 'https://cdn.pixabay.com/photo/2018/03/06/08/31/drone-3202860_1280.jpg',
    Electronics: 'https://cdn.pixabay.com/photo/2019/10/04/14/00/vacuum-tube-4525750_960_720.jpg',
    'Home & Kitchen': 'https://cdn.pixabay.com/photo/2017/06/13/22/42/kitchen-2400367_960_720.jpg',
    Books: 'https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_960_720.jpg',
    Toys: 'https://cdn.pixabay.com/photo/2016/11/29/04/35/building-1867350_960_720.jpg',
    Sports: 'https://cdn.pixabay.com/photo/2023/09/21/06/10/football-8266065_960_720.jpg',
    Footwear: 'https://cdn.pixabay.com/photo/2016/11/19/18/06/feet-1840619_960_720.jpg',
    Accessories: 'https://cdn.pixabay.com/photo/2016/06/25/12/48/go-pro-1478810_960_720.jpg',
   
};


const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-center"
        >
          Shop by Category
        </motion.h1>

        <LayoutGroup>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {categories.map((category) => (
              <motion.div
                key={category.name}
                layoutId={`container-${category.name}`}
                variants={itemVariants}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setTimeout(() => navigate(category.path), 300);
                }}
                onHoverStart={() => setIsHovering(category.name)}
                onHoverEnd={() => setIsHovering(null)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              >
                <motion.div
                  className="absolute inset-0 bg-black/40 z-10"
                  animate={{
                    opacity: isHovering === category.name ? 0.6 : 0.4
                  }}
                />
                
                <motion.img
                  src={categoryImages[category.name]}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  animate={{
                    scale: isHovering === category.name ? 1.1 : 1
                  }}
                  transition={{ duration: 0.4 }}
                />

                <motion.div
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4"
                  animate={{
                    y: isHovering === category.name ? -5 : 0
                  }}
                >
                  <motion.span
                    layoutId={`title-${category.name}`}
                    className="text-white text-xl md:text-2xl font-bold text-center"
                  >
                    {category.name}
                  </motion.span>
                  
                  {isHovering === category.name && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white/80 text-sm mt-2"
                    >
                      View Collection →
                    </motion.span>
                  )}
                </motion.div>

                {selectedCategory === category.name && (
                  <motion.div
                    layoutId="selected"
                    className="absolute inset-0 border-4 border-black rounded-2xl z-30"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </LayoutGroup>
      </div>
    </motion.div>
  );
};

export default CategoryPage;