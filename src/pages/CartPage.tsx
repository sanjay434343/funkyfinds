import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginModal } from './ProductView'; // Importing the LoginModal component
import AddressModal from './AddressModal'; // Importing the AddressModal component
import { getDatabase, ref, get } from 'firebase/database'; // Import Firebase database functions

// CartItem component defined inline for completeness
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center gap-4 p-4">
      <img 
        src={item.image} 
        alt={item.name} 
        className="w-24 h-24 object-cover rounded-lg"
      />
      
      <div className="flex-1">
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Size: {item.size} | Color: {item.color}
        </p>
        <p className="font-medium mt-1">${item.price}</p>
        
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
              className="p-2 hover:bg-gray-100"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-2 hover:bg-gray-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const uid = localStorage.getItem('uid');
    if (uid) {
        const savedCartItems = localStorage.getItem('cartItems');
        if (savedCartItems) {
            try {
                setCartItems(JSON.parse(savedCartItems));
            } catch (error) {
                console.error('Error parsing cart items:', error);
                setCartItems([]);
            }
        }
    } else {
        setCartItems([]); // Clear cart if not authenticated
    }
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);
  
  const shippingFee = subtotal > 100 ? 0 : 10;
  const total = subtotal + shippingFee;

  // Handle quantity updates
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      handleRemoveItem(itemId);
      return;
    }

    const updatedItems = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  // Handle item removal
  const handleRemoveItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const handleProceedToCheckout = async () => {
    const uid = localStorage.getItem('uid');

    if (!uid) {
      setShowLoginModal(true); // Show the login modal if uid is not found
      return;
    }

    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const locationStatus = userData.locationStatus; // Check location status

        if (!locationStatus) {
          setShowAddressModal(true); // Show address modal if locationStatus is false
          return;
        }

        navigate('/checkout'); // Navigate to the Checkout page if all checks pass
      } else {
        console.error('User data not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="bg-gray-50 p-8 rounded-lg text-center max-w-md w-full">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-sm"
                >
                  <CartItem 
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white shadow-sm rounded-lg p-6 h-fit border border-gray-100"
        >
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>
                {shippingFee === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `$${shippingFee.toFixed(2)}`
                )}
              </span>
            </div>
            {shippingFee > 0 && (
              <p className="text-sm text-gray-500">
                Free shipping on orders over $100
              </p>
            )}
          </div>
          
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="block w-full bg-black text-white text-center py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Proceed to Checkout
          </button>
          
          <Link
            to="/products"
            className="block w-full text-center py-4 text-gray-600 hover:text-gray-800 transition-colors mt-4"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <AddressModal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} />
    </div>
  );
};

export default CartPage;
