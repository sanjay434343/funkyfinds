import React from 'react';
import { motion } from 'framer-motion';

const AddressModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleAddNow = () => {
        // Logic to navigate to the profile page goes here
        window.location.href = '/profile'; // Redirect to profile page
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
                    <h2 className="text-2xl font-semibold">Add Address</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        X
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    Please add your address. This is important for ensuring your orders are delivered correctly and on time. You can update your address in your profile later if needed.
                </p>

                <div className="flex flex-col mt-4">
                    <button onClick={handleAddNow} className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors w-full m-1">
                        Add Now
                    </button>
                    <button onClick={onClose} className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors w-full m-1">
                        Maybe Later
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AddressModal;
