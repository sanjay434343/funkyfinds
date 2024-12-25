import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { realtimeDb as firebaseDb } from '../lib/firebase';
import { Product } from '../types';

const db = getDatabase();

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = () => {
      setLoading(true);
      const productsRef = ref(db, 'products');
      onValue(productsRef, (snapshot) => {
        const productsFromDb = snapshot.val();
        if (productsFromDb) {
          const productsArray = Object.keys(productsFromDb).map(key => ({
            id: key,
            ...productsFromDb[key]
          })) as Product[];
          setProducts(productsArray);
        }
        setLoading(false);
      }, (error) => {
        setError('Failed to fetch products');
        console.error(error);
        setLoading(false);
      });
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};