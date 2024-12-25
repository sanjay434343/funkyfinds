import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';  // Make sure this import statement is correct
import { LoginModal } from './components/LoginModal';
import { default as AllProducts } from './pages/AllProducts';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { HeroSection } from './components/HeroSection';
import { FeaturedProducts } from './components/FeaturedProducts';
import { default as ProductView } from './pages/ProductView';
import { default as CategoryPage } from './pages/CategoryPage';
import { CartPage } from './pages/CartPage';
import Profile from './pages/Profile';
import SelectedCategoryProducts from './components/SelectedCategoryProducts';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import Search from './pages/Search';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (!isLoggedOut) {
          const userData = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            addresses: []
          };
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('uid', user.uid);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('uid');
        setIsLoggedOut(true);
      }
    });

    return () => unsubscribe();
  }, [isLoggedOut]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoginModal />
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <HeroSection />
                <FeaturedProducts />
              </>
            } />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/product/:id" element={<ProductView />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/SelectedCategoryProducts/:category" element={<SelectedCategoryProducts />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;