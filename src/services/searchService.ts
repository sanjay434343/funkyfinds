import { ref, get } from 'firebase/database';
import { realtimeDb } from '../lib/firebase';

export const searchProducts = async (searchQuery: string) => {
  try {
    const productsRef = ref(realtimeDb, 'products');
    const snapshot = await get(productsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    let results = Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...(data as any)
    }));

    // Search filtering
    if (searchQuery.trim()) {
      const terms = searchQuery.toLowerCase().trim().split(/\s+/);
      results = results.filter(product => {
        const searchString = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        return terms.every(term => searchString.includes(term));
      });
    }

    return results;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search products');
  }
};
