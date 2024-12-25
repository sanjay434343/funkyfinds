import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, Package, Search as SearchIcon, Home, Grid, Truck, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const Navbar = () => {
  const { isAuthenticated, toggleLoginModal } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const navigate = useNavigate();
  const [uid, setUid] = useState(localStorage.getItem('uid'));
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      setCartItemCount(totalItems);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    // Check and update uid from localStorage whenever it changes
    const checkUid = () => {
      const storedUid = localStorage.getItem('uid');
      setUid(storedUid);
    };

    checkUid();
    window.addEventListener('storage', checkUid);
    return () => window.removeEventListener('storage', checkUid);
  }, []);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleCartClick = () => {
    navigate('/cart');
    closeMenu();
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { path: '/products', label: 'All Products', icon: <Package className="h-5 w-5" /> },
    { path: '/category/our', label: 'Categories', icon: <Grid className="h-5 w-5" /> },
    { path: '/track-order', label: 'Track Order', icon: <Truck className="h-5 w-5" /> },
  ];

  const CartButton = ({ isMobile = false }) => (
    <motion.button
      onClick={handleCartClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center ${
        isMobile 
          ? 'p-2 text-black' 
          : 'space-x-2 px-4 py-2 bg-black text-white rounded-md'
      }`}
    >
      <ShoppingBag className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
      {!isMobile && <span className="font-medium">Cart</span>}
      {cartItemCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute ${
            isMobile 
              ? '-top-1 -right-1 h-5 w-5 text-xs'
              : '-top-2 -right-2 h-6 w-6 text-sm'
          } bg-black text-white font-bold rounded-full flex items-center justify-center ${
            isMobile ? 'border border-white' : ''
          }`}
        >
          {cartItemCount}
        </motion.div>
      )}
    </motion.button>
  );

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Layout - adjust width */}
            <div className="flex items-center gap-4 md:hidden w-20">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center"
                onClick={toggleMenu}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>

            {/* Logo - centered with custom font */}
            <Link 
              to="/" 
              className="text-xl font-bold flex-1 text-center font-funky tracking-wider"
              onClick={closeMenu}
            >
              FunkyFinds
            </Link>

            {/* Mobile Cart and Search Icons - adjust width to match left side */}
            <div className="md:hidden w-20">
              <div className="flex items-center justify-end space-x-2">
                <motion.button
                  onClick={() => {
                    navigate('/search');
                    closeMenu();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-black"
                >
                  <SearchIcon className="h-6 w-6" />
                </motion.button>
                <CartButton isMobile />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-300 relative"
                  onClick={closeMenu}
                >
                  {item.icon}
                  <span className="absolute left-1/2 -bottom-8 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              ))}

              {/* Auth Button */}
              {uid ? (
                <Link 
                  to="/profile" 
                  className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-300"
                  onClick={closeMenu}
                >
                  <UserIcon className="h-6 w-6" />
                </Link>
              ) : (
                <button
                  onClick={toggleLoginModal}
                  className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-300"
                >
                  Login
                </button>
              )}

              <motion.button
                onClick={() => navigate('/search')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-300 relative"
              >
                <SearchIcon className="h-5 w-5" />
                <span className="absolute left-1/2 -bottom-8 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Search
                </span>
              </motion.button>
              {/* Desktop Cart Button */}
              <CartButton />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-white/90 backdrop-blur-md"
            >
              <div className="px-4 py-2 space-y-2">
                {navItems.map((item) => (
                  <motion.div
                    key={item.path}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-all duration-300"
                      onClick={closeMenu}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}

                {uid ? (
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-all duration-300"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      toggleLoginModal();
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-all duration-300"
                  >
                    Login
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      {/* Spacer div to prevent content from being hidden under fixed navbar */}
      <div className="h-16" />
    </>
  );
};

// Change the export to default
export default Navbar;