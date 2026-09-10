import { useRef, useState } from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import Hero from './components/Hero';
import Divider from './components/Divider';
import CategoryGrid from './components/CategoryGrid';
import Shop from './components/Shop';
import Reels from './components/Reels';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  const [currentCat, setCurrentCat] = useState('all');
  const [currentSub, setCurrentSub] = useState('all');
  const shopRef = useRef(null);
 
  function handleSelectCat(cat) {
    setCurrentCat(cat);
    setCurrentSub('all');
  }

  function handleSelectSub(sub) {
    setCurrentSub(sub);
  }

  function handleGoToShop(cat, sub) {
    setCurrentCat(cat);
    setCurrentSub(sub || 'all');
    shopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <CartProvider>
      <Header onGoToShop={handleGoToShop} />
      <CartDrawer />

      <Hero />

      <Divider text="Where your vibe becomes handcrafted aesthetically!" />

      <CategoryGrid onGoToShop={handleGoToShop} />

      <Divider text="shop the full collection" />

      <Shop
        ref={shopRef}
        currentCat={currentCat}
        currentSub={currentSub}
        onSelectCat={handleSelectCat}
        onSelectSub={handleSelectSub}
      />

      <Divider text="see it come together" />

      <Reels />

      <Divider text="who's behind the thread" />

      <About />

      <Contact />

      <Footer onGoToShop={handleGoToShop} />
    </CartProvider>
  );
}
