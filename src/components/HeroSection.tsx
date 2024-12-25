import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { realtimeDb } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

// Animation variants
const liquidFlow: Variants = {
  initial: {
    filter: 'blur(10px) hue-rotate(0deg)',
    scale: 1.2,
    opacity: 0
  },
  animate: {
    filter: ['blur(10px) hue-rotate(0deg)', 'blur(0px) hue-rotate(90deg)', 'blur(0px) hue-rotate(0deg)'],
    scale: 1,
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

const velvetFade: Variants = {
  initial: {
    opacity: 0,
    filter: 'brightness(0.5) contrast(1.2)'
  },
  animate: {
    opacity: 1,
    filter: 'brightness(1) contrast(1)',
    transition: {
      duration: 1.4,
      ease: 'easeOut'
    }
  }
};

const rippleGlide: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const neoMorph: Variants = {
  initial: {
    boxShadow: '0px 0px 0px rgba(255,255,255,0)',
    scale: 0.95
  },
  animate: {
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.01, -0.05, 0.95]
    }
  }
};

const silkScroll: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

const quantumFade: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.8,
    filter: 'blur(10px)'
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  },
  hidden: {
    opacity: 0,
    scale: 0.8,
    filter: 'blur(10px)'
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

const ctaReveal: Variants = {
  initial: {
    opacity: 0,
    y: 50
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

const ctaButtonHover: Variants = {
  initial: {
    scale: 1,
    backgroundColor: "transparent"
  },
  
  
};

const categoryImages = {
  'Clothing': 'https://cdn.pixabay.com/photo/2014/08/26/21/49/shirts-428627_960_720.jpg',
  'Makeup': 'https://cdn.pixabay.com/photo/2018/01/14/00/05/makeup-3081015_960_720.jpg',
  'Gadgets': 'https://cdn.pixabay.com/photo/2018/03/06/08/31/drone-3202860_1280.jpg',
  'Electronics': 'https://cdn.pixabay.com/photo/2019/10/04/14/00/vacuum-tube-4525750_960_720.jpg',
  'Home & Kitchen': 'https://cdn.pixabay.com/photo/2017/06/13/22/42/kitchen-2400367_960_720.jpg',
  'Books': 'https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_960_720.jpg',
  'Toys': 'https://cdn.pixabay.com/photo/2016/11/29/04/35/building-1867350_960_720.jpg',
  'Sports': 'https://cdn.pixabay.com/photo/2023/09/21/06/10/football-8266065_960_720.jpg',
  'Footwear': 'https://cdn.pixabay.com/photo/2016/11/19/18/06/feet-1840619_960_720.jpg',
  'Accessories': 'https://cdn.pixabay.com/photo/2016/06/25/12/48/go-pro-1478810_960_720.jpg',
};

const categories = [
  { name: 'Clothing', path: '/SelectedCategoryProducts/Clothing' },
  { name: 'Gadgets', path: '/SelectedCategoryProducts/Gadgets' },
  { name: 'Footwear', path: '/SelectedCategoryProducts/Footwear' },
  { name: 'Accessories', path: '/SelectedCategoryProducts/Accessories' },
];

export const HeroSection = () => {
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [popularStyles, setPopularStyles] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchPopularStyles = async () => {
      const productsRef = ref(realtimeDb, 'products');
      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const filteredProducts = Object.values(data).filter((product: any) => product.category === 'Popular');
          setPopularStyles(filteredProducts);
          setTimeout(() => setCollectionsLoading(false), 1500);
        }
      });
    };
    fetchPopularStyles();
  }, []);

  return (
    <motion.div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        className="relative h-[90vh] overflow-hidden"
        variants={liquidFlow}
        initial="initial"
        animate="animate"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"
          variants={velvetFade}
          initial="initial"
          animate="animate"
        />
        
        {/* Add the gray ball gradient */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(75,85,99,0.6) 0%, rgba(0,0,0,0) 70%)',
            transform: 'translateY(-50%)'
          }}
        />

        <div className="relative h-full flex items-center justify-center">
          <motion.div
            variants={silkScroll}
            initial="initial"
            animate="animate"
            className="max-w-7xl mx-auto px-6 lg:px-8 text-center"
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold text-white mb-8 leading-none tracking-tight mx-auto"
              variants={quantumFade}
            >
            Elevate<br />
              <span className="text-gray-300">Luxury.</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-300 mb-12 max-w-md mx-auto font-light tracking-wide"
              variants={quantumFade}
            >
              Curated essentials for the contemporary lifestyle
            </motion.p>

            <motion.div
              variants={neoMorph}
              className="flex flex-col sm:flex-row gap-6 justify-center bg-transparent"
            >
              <Link 
                to="/products"
                className="group relative overflow-hidden bg-white text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-all duration-300"
              >
                <motion.div
                  className="flex items-center justify-center gap-2"
                  whileHover={{ x: 5 }}
                >
                  Top Picks
                  <ShoppingBag className="w-5 h-5" />
                </motion.div>
              </Link>

              <Link
                to="/category/new"
                className="group relative overflow-hidden bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white/10 transition-all duration-300"
              >
                <motion.div
                  className="flex items-center justify-center gap-2"
                  whileHover={{ x: 5 }}
                >
                  Explore Collections
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Collections Section */}
      <motion.div 
        className="py-24 px-4 sm:px-6 lg:px-8"
        variants={rippleGlide}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={quantumFade}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Collections</h2>
          <p className="text-gray-600 text-lg">Explore our carefully curated categories</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          variants={rippleGlide}
          initial="initial"
          animate="animate"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              variants={quantumFade}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Link to={category.path} className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={categoryImages[category.name]} 
                  alt={category.name} 
                  className="w-full h-56 object-cover rounded-lg" 
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150'; }} 
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xl font-medium">{category.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Enhanced CTA Section - Updated */}
      <motion.section 
        className="relative h-80 flex justify-center items-center overflow-hidden"
        variants={velvetFade}
        initial="initial"
        animate="animate"
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"
          variants={velvetFade}
          initial="initial"
          animate="animate"
        />
        
        {/* Gray ball gradient */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(75,85,99,0.6) 0%, rgba(0,0,0,0) 70%)',
            transform: 'translateY(-50%)'
          }}
        />
        
        <motion.div 
          className="max-w-7xl mx-auto text-center relative z-10"
          variants={ctaReveal}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight"
            variants={quantumFade}
            initial="hidden"
            whileInView="visible"
          >
            Refined Selection
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-300 mb-6 font-light tracking-wide"
            variants={quantumFade}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.2 }}
          >
            Thoughtfully crafted pieces for those who appreciate simplicity
          </motion.p>
          
          <motion.div
            variants={ctaButtonHover}
            initial="initial"
            whileHover="hover"
          >
            <Link 
    to="/products" 
    className="inline-flex items-center border-2 border-white text-white px-6 py-3 rounded-full group hover:bg-white hover:text-black transition-colors duration-300"
  >
    <span>Pick Now</span>
    <motion.div
      className="ml-2"
      whileHover={{ x: 5 }}
      transition={{ duration: 0.2 }}
    >
                <ShoppingBag className="w-5 h-5" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
};