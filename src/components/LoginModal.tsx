import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { X, LogIn } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useStore } from '../store/useStore';

export const LoginModal = () => {
  const { isLoginModalOpen, toggleLoginModal, setUser, setIsAuthenticated } = useStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add effect to check for uid
  useEffect(() => {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      toggleLoginModal();
    }
  }, [toggleLoginModal]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const { uid, email, displayName } = result.user;
      
      const userData = {
        uid,
        email: email || '',
        displayName: displayName || '',
        addresses: []
      };

      // Store uid in localStorage
      localStorage.setItem('uid', uid);

      setUser(userData);
      setIsAuthenticated(true);
      toggleLoginModal();
    } catch (error) {
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <Dialog
          as={motion.div}
          static
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          open={isLoginModalOpen}
          onClose={toggleLoginModal}
          className="relative z-50"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden="true" 
          />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Dialog.Title className="text-2xl font-bold text-gray-900">
                    Welcome Back
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-gray-500">
                    Please sign in to continue
                  </p>
                </motion.div>
                <motion.button
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleLoginModal}
                  className="rounded-full p-1 text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <motion.button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl p-4 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <LogIn className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="w-5 h-5"
                    />
                  )}
                  <span className="font-medium">
                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                  </span>
                </motion.button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Protected by Google
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-center text-xs text-gray-500"
              >
                By continuing, you agree to our Terms of Service and Privacy Policy
              </motion.p>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};