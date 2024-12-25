import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { searchProducts } from '../services/searchService';
import { useDebounce } from '../hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sort: '', // 'price-low', 'price-high', 'rating', 'trending'
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);  // Add this new state
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeFilter, setActiveFilter] = useState('');  // Add this new state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const products = useStore(state => state.products);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    // Extract unique tags from all products
    const tags = [...new Set(products.flatMap(product => product.tags))];
    setAvailableTags(tags);
  }, [products]);

  const applySorting = (results) => {
    if (!filters.sort) return results;

    return [...results].sort((a, b) => {
      switch (filters.sort) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'trending':
          return b.sales - a.sales; // Assuming you have a sales/popularity field
        default:
          return 0;
      }
    });
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const results = await searchProducts(debouncedSearchQuery, {});
        const sortedResults = applySorting(results);
        setFilteredProducts(sortedResults);
        setHasSearched(true);  // Set to true after search
      } catch (err) {
        setError('Failed to fetch search results');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedSearchQuery || filters.sort) {
      fetchSearchResults();
    } else {
      setFilteredProducts([]);
      setHasSearched(false);  // Reset when no search criteria
    }
  }, [debouncedSearchQuery, filters.sort]);

  // Load saved search state from localStorage
  useEffect(() => {
    const savedSearch = localStorage.getItem('lastSearch');
    if (savedSearch) {
      const { query, filters: savedFilters, results, hasSearched: savedHasSearched } = JSON.parse(savedSearch);
      setSearchQuery(query || '');
      setFilters(savedFilters || {});
      setFilteredProducts(results || []);
      setHasSearched(savedHasSearched || false);
    }
  }, []);

  // Save search state to localStorage
  useEffect(() => {
    if (hasSearched) {
      localStorage.setItem('lastSearch', JSON.stringify({
        query: searchQuery,
        filters,
        results: filteredProducts,
        hasSearched
      }));
    }
  }, [searchQuery, filters, filteredProducts, hasSearched]);

  // Add debounced scroll handler
  const handleScroll = () => {
    const currentScroll = window.scrollY;
    setScrollPosition(currentScroll);
    sessionStorage.setItem('searchScrollPosition', currentScroll.toString());
  };

  // Update scroll position management with debouncing
  useLayoutEffect(() => {
    const savedPosition = sessionStorage.getItem('searchScrollPosition');
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
    }
    
    let timeoutId;
    const debouncedScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleScroll, 10);
    };

    window.addEventListener('scroll', debouncedScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is now handled by the useEffect hook
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Clear search results
  const clearSearch = () => {
    setSearchQuery('');
    setFilters({
      sort: '', // 'price-low', 'price-high', 'rating', 'trending'
    });
    setFilteredProducts([]);
    setHasSearched(false);
    localStorage.removeItem('lastSearch');
    sessionStorage.removeItem('searchScrollPosition');
  };

  // Add function to clear filters
  const clearFilters = () => {
    setFilters({ sort: '' });
    setActiveFilter('');
  };

  // Update FloatingFilterButton component
  const FloatingFilterButton = () => (
    <motion.button
      onClick={() => setIsFilterModalOpen(true)}
      className={`fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2 ${
        isFilterModalOpen ? 'z-[30]' : 'z-[100]'
      }`}
    >
      <FiFilter className="h-5 w-5" />
      {activeFilter && (
        <motion.span
          layoutId="filterDot"
          className="w-2 h-2 bg-blue-500 rounded-full absolute -top-1 -right-1"
        />
      )}
    </motion.button>
  );

  // Add filter modal component
  const FilterModal = () => (
    <AnimatePresence>
      {isFilterModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterModalOpen(false)}
            className="fixed inset-0 bg-black/50 z-[45] backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-[50] max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Sort By</h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { id: 'price-low', label: 'Price: Low to High' },
                { id: 'price-high', label: 'Price: High to Low' },
                { id: 'rating', label: 'Highest Rated' },
                { id: 'trending', label: 'Trending' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setFilters({ sort: filter.id });
                    setActiveFilter(filter.id);
                    setIsFilterModalOpen(false);
                  }}
                  className={`p-4 rounded-lg text-sm transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {activeFilter && (
              <button
                onClick={() => {
                  clearFilters();
                  setIsFilterModalOpen(false);
                }}
                className="w-full p-4 rounded-lg text-sm bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              >
                Remove Filter
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Search Section - reduced padding */}
      <div className="bg-gradient-to-r from-black    to-gray-800 py-8">
        <div className="container mx-auto px-4">
         
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 rounded-lg shadow-xl border-none pl-12 pr-12 md:pr-32 text-base focus:ring-2 focus:ring-blue-400"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                {hasSearched && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="px-3 py-1.5 text-gray-600 hover:text-gray-800 hidden md:block"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="md:bg-blue-600 md:text-white md:px-4 md:py-1.5 md:rounded-md md:hover:bg-blue-700 transition-colors"
                >
                  <FiSearch className="h-5 w-5 md:hidden text-gray-600" />
                  <span className="hidden md:inline">Search</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Remove the old filter buttons section */}

        {/* Results Section */}
        <div className="mt-8">
          {!hasSearched ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">Enter search terms to find products</p>
              <p className="text-gray-400 mt-2">Use the search bar above or apply filters</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 text-blue-500 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <p className=" text-gray-600 mb-6 text-[12px]">
                Found {filteredProducts.length} products
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">No products found </p>
            </div>
          )}
        </div>
      </div>

      {/* Add floating filter button and modal */}
      <FloatingFilterButton />
      <FilterModal />
    </div>
  );
};

export default Search;
