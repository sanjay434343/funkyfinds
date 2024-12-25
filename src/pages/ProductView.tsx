import React, { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue, set, get } from 'firebase/database';
import { signInWithPopup } from 'firebase/auth';
import { 
  Star, 
  Truck, 
  RefreshCw, 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  ShoppingCart, 
  Check, 
  X, 
  LogIn 
} from 'lucide-react';
import { auth, googleProvider, realtimeDb } from '../lib/firebase';
import { scrollManager } from '../utils/scrollManager';

// Login Modal Component
export const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store user data in localStorage
      localStorage.setItem('uid', user.uid);

      // Fetch existing user data from Firebase
      const userRef = ref(realtimeDb, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const existingUserData = snapshot.val();

      // Store user data in Firebase, preserving existing address and location status
      await set(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        lastLogin: new Date().toISOString(),
        address: existingUserData?.address || {},
        locationStatus: existingUserData?.locationStatus || false
      });

      onClose();
    } catch (error) {
      console.error('Error during Google login:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Sign In</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Please sign in to add items to your cart and continue shopping.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </motion.div>
    </motion.div>
  );
};

// Cart Success Modal Component
const CartSuccessModal = ({ isOpen, onClose, onViewCart }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          <Check className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Added to Cart!</h2>
          <p className="text-gray-600 mb-6 text-center">
            Your item has been successfully added to the cart.
          </p>
          <div className="flex gap-4 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={onViewCart}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Cart
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Product View Component
const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Auto-slide images
  useEffect(() => {
    if (!product?.images) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [product]);

  // Fetch product data
  useEffect(() => {
    const productsRef = ref(realtimeDb, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.values(data);
        const foundProduct = productList.find((p) => p.id === id);
        if (foundProduct) {
          setProduct(foundProduct);
          if (foundProduct.sizes?.length > 0) setSelectedSize(foundProduct.sizes[0]);
          if (foundProduct.colors?.length > 0) setSelectedColor(foundProduct.colors[0]);
        }
      }
    });
  }, [id]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Save the current product ID and scroll position when component unmounts
  useEffect(() => {
    return () => {
      // Save current product as last viewed when leaving
      scrollManager.saveLastVisibleProduct(id);
    };
  }, [id]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }

    if (isRightSwipe) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const uid = localStorage.getItem('uid');
    
    if (!uid) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedSize || !selectedColor) {
      alert('Please select both size and color');
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        price: product.price,
        image: product.images[0]
      };

      const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const existingItemIndex = existingCart.findIndex(item => 
        item.id === cartItem.id && 
        item.size === cartItem.size && 
        item.color === cartItem.color
      );

      if (existingItemIndex === -1) {
        existingCart.push(cartItem);
      } else {
        existingCart[existingItemIndex].quantity += cartItem.quantity;
      }

      localStorage.setItem('cartItems', JSON.stringify(existingCart));
      setShowCartModal(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (!product) {
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
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery Section */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 relative"
          >
            <div 
              className="relative h-[500px] overflow-hidden rounded-lg"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={product.images[currentImageIndex]}
                  alt={`${product.name} view ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button 
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white/90 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white/90 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <motion.div 
                  key={idx}
                  className="relative cursor-pointer"
                  onClick={() => setCurrentImageIndex(idx)}
                  whileHover={{ scale: 1.05 }}
                >
                  <img 
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className={`w-full h-24 object-cover rounded-lg transition-opacity ${
                      currentImageIndex === idx ? 'opacity-100' : 'opacity-50'
                    }`}
                  />
                  {currentImageIndex === idx && (
                    <motion.div 
                      layoutId="thumbnail-highlight"
                      className="absolute inset-0 border-2 border-black rounded-lg"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Product Details Section */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="text-2xl font-semibold">${product.price.toFixed(2)}</div>
            </div>

            {/* Rating Section */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-5 h-5 ${
                      idx < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">({product.reviews} reviews)</span>
            </div>

            {/* Product Description */}
            <p className="text-gray-600">{product.description}</p>

            {/* Size Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Size</h3>
                <div className="grid grid-cols-4 gap-2"> 
                  {product.sizes?.map((size) => (
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 rounded-lg border ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="font-medium mb-2">Color</h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.colors?.map((color) => (
                    <motion.button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`py-2 rounded-lg border ${
                        selectedColor === color
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {color}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <h3 className="font-medium mb-2">Quantity</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:border-gray-400"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="p-2 rounded-lg border border-gray-300 hover:border-gray-400"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isAddingToCart ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
                {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
              </motion.button>

              {/* Product Features */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5" />
                  <div>
                    <h4 className="font-medium">Free Shipping</h4>
                    <p className="text-sm text-gray-600">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5" />
                  <div>
                    <h4 className="font-medium">Free Returns</h4>
                    <p className="text-sm text-gray-600">Within 30 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <div>
                    <h4 className="font-medium">Secure Payment</h4>
                    <p className="text-sm text-gray-600">SSL encryption</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      <CartSuccessModal 
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        onViewCart={() => navigate('/cart')}
      />
    </>
  );
};

export default ProductView;