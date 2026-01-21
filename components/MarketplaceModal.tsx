
import React, { useState, useMemo } from 'react';
import { X, ShoppingBag, ShoppingCart, Search, Filter, Tag, ArrowRight, Star, Image as ImageIcon, Video, ChevronRight, Check } from 'lucide-react';
import { Product, CartItem } from '../types';
import VideoPlayer from './VideoPlayer';

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  openCart: () => void;
  lang: 'ru' | 'en';
  t: any;
  getData: (item: any, field: string) => string;
}

const MarketplaceModal: React.FC<MarketplaceModalProps> = ({ 
    isOpen, onClose, products, cart, addToCart, openCart, lang, t, getData
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories from products
  const dynamicCategories = useMemo(() => {
      const cats = new Set<string>();
      products.forEach(p => {
          if (p.category && p.category.trim() !== '') {
              cats.add(p.category.trim());
          }
      });
      return Array.from(cats).sort();
  }, [products]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
      return products.filter(p => {
          // 1. Search Query
          const title = getData(p, 'title').toLowerCase();
          const desc = getData(p, 'description_short').toLowerCase();
          const query = searchQuery.toLowerCase();
          if (query && !title.includes(query) && !desc.includes(query)) return false;

          // 2. Category
          if (selectedCategory === 'all') return true;
          
          return p.category === selectedCategory;
      });
  }, [products, selectedCategory, searchQuery, getData]);

  if (!isOpen) return null;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950 animate-in fade-in duration-200 overflow-hidden font-sans">
      
      {/* Top Header */}
      <header className="shrink-0 h-20 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-8 z-20">
          <div className="flex items-center gap-4">
              <div className="bg-red-600/20 p-2.5 rounded-xl border border-red-600/30">
                 <ShoppingBag className="w-6 h-6 text-red-500" />
              </div>
              <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase leading-none">{t.shop}</h1>
                  <p className="text-xs text-neutral-400 mt-1">{t.shop_subtitle}</p>
              </div>
          </div>
          
          <div className="flex items-center gap-4">
              {/* Search Bar (Desktop) */}
              <div className="hidden md:flex items-center bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 w-64 focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600/50 transition-all">
                  <Search className="w-4 h-4 text-neutral-500 mr-2" />
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'ru' ? "Поиск..." : "Search..."}
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-neutral-600 w-full"
                  />
              </div>

              <button 
                onClick={openCart}
                className="group relative p-3 bg-neutral-900 rounded-full hover:bg-white hover:text-black text-neutral-300 transition-all duration-300 border border-neutral-800 hover:border-white"
              >
                 <ShoppingCart className="w-5 h-5" />
                 {cartCount > 0 && (
                     <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-neutral-950">
                         {cartCount}
                     </span>
                 )}
              </button>

              <div className="h-8 w-px bg-neutral-800 mx-2 hidden md:block"></div>

              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
          </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar (Desktop) */}
          <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-black/20 p-6 overflow-y-auto">
              <div className="space-y-1">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 px-2">
                      {lang === 'ru' ? 'Категории' : 'Categories'}
                  </h3>
                  
                  {/* All Products Button */}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                        selectedCategory === 'all' 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                      {lang === 'ru' ? 'Все товары' : 'All Products'}
                      {selectedCategory === 'all' && <ChevronRight className="w-4 h-4 opacity-50" />}
                  </button>

                  {/* Dynamic Categories */}
                  {dynamicCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                            selectedCategory === cat 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                            : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                        }`}
                      >
                          {cat}
                          {selectedCategory === cat && <ChevronRight className="w-4 h-4 opacity-50" />}
                      </button>
                  ))}
              </div>

              {/* Promo Banner in Sidebar */}
              <div className="mt-auto pt-8">
                  <div className="bg-gradient-to-br from-neutral-900 to-black p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Star className="w-24 h-24 text-white" />
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2 relative z-10">Premium Member?</h4>
                      <p className="text-xs text-neutral-400 mb-4 relative z-10">Get 10% off on all rope kits.</p>
                      <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-lg transition-colors border border-white/5 relative z-10">
                          Upgrade
                      </button>
                  </div>
              </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-neutral-950 p-4 md:p-8 scroll-smooth relative">
              {/* Mobile Search & Filter Tabs */}
              <div className="md:hidden mb-6 space-y-4">
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
                      <Search className="w-5 h-5 text-neutral-500 mr-3" />
                      <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="bg-transparent border-none outline-none text-base text-white placeholder-neutral-600 w-full"
                      />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${
                            selectedCategory === 'all' 
                            ? 'bg-red-600 border-red-600 text-white' 
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                          {lang === 'ru' ? 'Все' : 'All'}
                      </button>
                      {dynamicCategories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${
                                selectedCategory === cat 
                                ? 'bg-red-600 border-red-600 text-white' 
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                            }`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-neutral-500">
                      <Search className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-lg font-medium">No products found</p>
                      <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="mt-4 text-red-500 hover:underline">Clear filters</button>
                  </div>
              ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                      {filteredProducts.map(product => (
                          <div 
                              key={product.id}
                              onClick={() => setSelectedProduct(product)}
                              className="group flex flex-col cursor-pointer"
                          >
                              {/* Image Container */}
                              <div className="aspect-[3/4] w-full bg-neutral-900 rounded-xl overflow-hidden relative border border-white/5 group-hover:border-white/20 transition-all duration-300 shadow-sm">
                                  {product.images && product.images[0] ? (
                                      <img 
                                        src={product.images[0]} 
                                        alt={getData(product, 'title')} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                      />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-neutral-700">
                                          <ImageIcon className="w-10 h-10" />
                                      </div>
                                  )}
                                  
                                  {/* Badges */}
                                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                                      {product.price && product.price > 100 && (
                                          <span className="bg-black/80 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-white/10">Premium</span>
                                      )}
                                  </div>

                                  {/* Quick Actions (Desktop Hover) */}
                                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:flex items-center justify-between">
                                      <span className="text-white font-mono font-bold">${product.price}</span>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                        className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                                      >
                                          <ShoppingCart className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>

                              {/* Info */}
                              <div className="mt-3 space-y-1">
                                  <h3 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1 leading-tight">
                                      {getData(product, 'title')}
                                  </h3>
                                  <p className="text-xs text-neutral-500 line-clamp-1">
                                      {getData(product, 'color') || getData(product, 'description_short')}
                                  </p>
                                  <div className="md:hidden mt-2 flex items-center justify-between">
                                      <span className="text-sm font-mono font-bold text-white">${product.price}</span>
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                          className="p-1.5 bg-neutral-800 rounded-full text-white"
                                      >
                                          <ShoppingCart className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </main>
      </div>

      {/* Detail Overlay */}
      {selectedProduct && (
          <ProductDetailOverlay 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onAdd={() => addToCart(selectedProduct)} 
            t={t} 
            getData={getData} 
          />
      )}
    </div>
  );
};

const ProductDetailOverlay: React.FC<{ product: Product, onClose: () => void, onAdd: () => void, t: any, getData: any }> = ({ product, onClose, onAdd, t, getData }) => {
    const [activeImage, setActiveImage] = useState(product.images?.[0] || '');
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-8 animate-in zoom-in-95 duration-200">
            <div className="bg-neutral-950 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-6xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative border border-white/10">
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors border border-white/10 backdrop-blur">
                    <X className="w-5 h-5" />
                </button>

                {/* Left: Gallery */}
                <div className="w-full md:w-[55%] bg-black flex flex-col h-[45vh] md:h-auto border-r border-white/10 relative">
                     <div className="flex-1 relative flex items-center justify-center bg-neutral-900/20">
                         {activeImage ? (
                             <img src={activeImage} className="w-full h-full object-contain" alt="" />
                         ) : (
                             <ImageIcon className="w-16 h-16 text-neutral-800" />
                         )}
                     </div>
                     {/* Thumbnails */}
                     {(product.images?.length || 0) > 1 && (
                         <div className="p-4 flex gap-3 overflow-x-auto bg-neutral-950 border-t border-white/5 scrollbar-hide">
                             {product.images.map((img, idx) => (
                                 <button 
                                    key={idx} 
                                    onClick={() => setActiveImage(img)}
                                    className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border transition-all ${activeImage === img ? 'border-red-600 ring-2 ring-red-600/30' : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'}`}
                                 >
                                     <img src={img} className="w-full h-full object-cover" alt="" />
                                 </button>
                             ))}
                         </div>
                     )}
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-[45%] flex flex-col h-full bg-neutral-950">
                    <div className="flex-1 overflow-y-auto p-6 md:p-10">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {product.category && (
                                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-neutral-400 font-medium uppercase tracking-wider">
                                        {product.category}
                                    </span>
                                )}
                                {product.color && (
                                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-neutral-300 font-medium">
                                        {getData(product, 'color')}
                                    </span>
                                )}
                                <span className="px-3 py-1 rounded-full bg-red-900/20 text-red-500 border border-red-900/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Check className="w-3 h-3" /> {t.in_stock}
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">{getData(product, 'title')}</h2>
                            
                            <div className="text-3xl font-mono font-bold text-white flex items-center gap-2">
                                ${product.price}
                                <span className="text-sm font-sans font-normal text-neutral-500 ml-2">USD</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mb-10">
                            <button 
                                onClick={() => { onAdd(); onClose(); }}
                                className="w-full bg-white hover:bg-neutral-200 text-black py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-white/5 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <ShoppingBag className="w-5 h-5" /> {t.add_to_cart}
                            </button>
                        </div>

                        {/* Description */}
                        <div className="prose prose-invert max-w-none space-y-8">
                            <div>
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] mb-3">{t.description}</h3>
                                <p className="text-neutral-300 leading-relaxed text-base">
                                    {getData(product, 'description_long') || getData(product, 'description_short')}
                                </p>
                            </div>

                            {/* Specifications / FAQ */}
                            {product.faq && product.faq.length > 0 && (
                                <div className="border-t border-white/10 pt-6">
                                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4">Details</h3>
                                    <div className="space-y-2">
                                        {product.faq.map((item, idx) => (
                                            <div key={idx} className="border border-white/5 rounded-lg overflow-hidden">
                                                <button 
                                                    onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                                                    className="w-full flex items-center justify-between p-4 text-left bg-white/5 hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="text-sm font-bold text-white">{item.question}</span>
                                                    <ChevronRight className={`w-4 h-4 text-neutral-500 transition-transform ${faqOpen === idx ? 'rotate-90' : ''}`} />
                                                </button>
                                                {faqOpen === idx && (
                                                    <div className="p-4 pt-2 text-sm text-neutral-400 bg-black/20 border-t border-white/5 leading-relaxed">
                                                        {item.answer}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {product.video_url && (
                                <div className="border-t border-white/10 pt-6">
                                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4">Video Review</h3>
                                    <div className="rounded-xl overflow-hidden border border-white/10">
                                        <VideoPlayer url={product.video_url} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MarketplaceModal;
