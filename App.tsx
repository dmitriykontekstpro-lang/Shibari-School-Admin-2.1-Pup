/**
 * Shibari School Admin 1.2 LIfe
 * 
 * Main Application Component
 * 
 * CORE RESPONSIBILITIES:
 * 1. Data Fetching: Loads all content (lessons, products, courses, events, etc.) from Supabase on mount.
 * 2. Auth State: Manages user session (AuthOverlay) and profile data (user_shibari table).
 * 3. Navigation: Handles sidebar lesson selection and top navigation for modals (Marketplace, Catalog, etc.).
 * 4. Lesson Logic: Manages "Locked" state for free vs registered users (first 4 lessons free).
 * 5. Routing: Uses a "Single Page" approach with heavy modal usage for sub-modules.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { Lesson, Product, Course, AppEvent, HistoryEvent, CartItem, UserProfile, CatalogCategory, CatalogVideo, Article, DictionaryEntry } from './types';
import { INITIAL_LESSONS, INITIAL_PRODUCTS, INITIAL_COURSES, INITIAL_EVENTS, INITIAL_HISTORY, INITIAL_DICTIONARY, INITIAL_CATALOG_CATEGORIES, INITIAL_CATALOG_VIDEOS, UI_TRANSLATIONS, INITIAL_SOCIAL_RESOURCES, INITIAL_ARTICLES } from './constants';
import { Settings, Menu, ShoppingBag, User as UserIcon, LogOut, Globe, HelpCircle, ArrowRight, Play, Lock, FileText } from 'lucide-react';

// Components
import AuthOverlay from './components/AuthOverlay';
import CartDrawer from './components/CartDrawer';
import MarketplaceModal from './components/MarketplaceModal';
import CoursesModal from './components/CoursesModal';
import CatalogModal from './components/CatalogModal';
import HistoryModal from './components/HistoryModal';
import KinbakushiModal from './components/KinbakushiModal';
import EventsModal from './components/EventsModal';
import NavazuModal from './components/NavazuModal';
import ResourcesModal from './components/ResourcesModal';
import SettingsModal from './components/SettingsModal';
import VideoPlayer from './components/VideoPlayer';
import TextContent from './components/TextContent';
import DictionaryDrawer from './components/DictionaryDrawer';
import ArticlesModal from './components/ArticlesModal';
import ArticleReader from './components/ArticleReader';
import GlossaryModal from './components/GlossaryModal';

const App: React.FC = () => {
  // --- State Management ---
  
  // Core Content State
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [currentLessonId, setCurrentLessonId] = useState<number>(1);
  
  // User & Auth State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null); // Triggers Dictionary Drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

  // Modals Controller
  // 'activeModal' determines which overlay is currently visible (Shop, Courses, etc.)
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [readingArticle, setReadingArticle] = useState<Article | null>(null); // Specific state for Article Reader
  
  // Loaded Data Containers
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [events, setEvents] = useState<AppEvent[]>(INITIAL_EVENTS);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>(INITIAL_HISTORY);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>(INITIAL_CATALOG_CATEGORIES);
  const [catalogVideos, setCatalogVideos] = useState<CatalogVideo[]>(INITIAL_CATALOG_VIDEOS);
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>(INITIAL_DICTIONARY);
  
  // Localization
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const t = UI_TRANSLATIONS[lang];

  // --- Logic: Authentication & Profile Sync ---
  // Checks Supabase session. If user exists, fetches detailed profile from 'user_shibari'.
  // If profile is missing (new user), creates a default entry.
  const fetchUserProfile = async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
        try {
            const { data: profile } = await supabase
                .from('user_shibari')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile) {
                setUserProfile(profile as UserProfile);
            } else {
                const metadata = session.user.user_metadata || {};
                const newProfile = {
                    id: session.user.id,
                    email: session.user.email || '',
                    full_name: metadata.full_name || '',
                    country: metadata.country || '',
                    city: metadata.city || '',
                    shibari_role: metadata.shibari_role || 'unknown',
                    experience_level: metadata.experience_level || 'newbie',
                    system_role: metadata.system_role || 'user',
                    created_at: new Date().toISOString()
                };
                await supabase.from('user_shibari').insert([newProfile]);
                // @ts-ignore
                setUserProfile(newProfile as UserProfile);
            }
        } catch (e) {
            console.error("Error fetching user profile:", e);
        }
    } else {
        setUserProfile(null);
    }
  };

  // --- Logic: Data Loading ---
  // Fetches all dynamic content from Supabase tables. Falls back to INITIAL constants if fetch fails or DB is empty.
  const fetchData = async () => {
     if (!supabase) return;
     try {
        const { data: lData } = await supabase.from('lessons_shibari').select('*').order('id');
        if (lData && lData.length) setLessons(lData as Lesson[]);

        const { data: pData } = await supabase.from('market_shibari').select('*').order('id');
        if (pData && pData.length) setProducts(pData);

        const { data: cData } = await supabase.from('kurs_market_shibari').select('*').order('id');
        if (cData && cData.length) setCourses(cData);

        const { data: eData } = await supabase.from('event_shibari').select('*').order('date');
        if (eData && eData.length) setEvents(eData);

        const { data: hData } = await supabase.from('history_shibari').select('*').order('id');
        if (hData && hData.length) setHistoryEvents(hData);

        const { data: aData } = await supabase.from('letter_shibari').select('*').order('id');
        if (aData && aData.length) setArticles(aData);

        const { data: catData } = await supabase.from('catalog_categories_shibari').select('*');
        if (catData && catData.length) setCatalogCategories(catData);
        
        const { data: vidData } = await supabase.from('catalog_videos_shibari').select('*');
        if (vidData && vidData.length) setCatalogVideos(vidData);
        
        const { data: dData } = await supabase.from('dictionary_shibari').select('*').order('term');
        if (dData && dData.length) setDictionary(dData);

     } catch(e) { console.error("Error fetching data", e); }
  };

  // --- Effects ---
  useEffect(() => {
    fetchData();
    fetchUserProfile();
    // Subscribe to auth changes (Sign In / Sign Out / Token Refresh)
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            fetchUserProfile();
        } else if (event === 'SIGNED_OUT') {
            setUserProfile(null);
        }
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  // --- Handlers: Admin & Cart ---
  const handleUpdateLesson = async (id: number, data: Partial<Lesson>) => {
      if (!supabase) return;
      // Optimistic update for immediate UI feedback
      setLessons(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
      
      try { 
          const { error } = await supabase.from('lessons_shibari').update(data).eq('id', id); 
          if (error) throw error;
      } catch (e: any) { 
          console.error("Update failed:", e);
          alert(`Ошибка сохранения урока: ${e.message || 'Check console'}`);
          fetchData(); // Revert on error
      }
  };

  const addToCart = (product: Product) => {
      setCart(prev => {
          const existing = prev.find(item => item.product.id === product.id);
          if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
          return [...prev, { product, quantity: 1 }];
      });
  };

  const removeFromCart = (productId: number) => setCart(prev => prev.filter(item => item.product.id !== productId));

  const updateCartQuantity = (productId: number, delta: number) => {
      setCart(prev => prev.map(item => {
          if (item.product.id === productId) {
              const newQ = item.quantity + delta;
              return newQ < 1 ? item : { ...item, quantity: newQ };
          }
          return item;
      }));
  };

  const getData = (item: any, field: string) => {
      if (lang === 'en' && item[field + '_en']) return item[field + '_en'];
      return item[field];
  };

  const activeLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];

  // Logic: "Related Articles" slots
  // Maps the lesson's configured related_articles IDs to actual Article objects.
  // Fills empty slots with random articles to ensure the grid always has 4 items.
  const currentRelatedArticles = useMemo(() => {
      const configIds = activeLesson.related_articles || [];
      const result: Article[] = [];
      const usedIds = new Set<number>();

      // 1. Fill Fixed Slots (preserve index from Admin Panel)
      for (let i = 0; i < 4; i++) {
          const id = configIds[i];
          if (id) {
              const art = articles.find(a => a.id === id);
              if (art) {
                  result[i] = art;
                  usedIds.add(art.id);
              }
          }
      }

      // 2. Fill Empty Slots with fallback articles
      const fillers = articles.filter(a => !usedIds.has(a.id));
      let fillerIndex = 0;

      for (let i = 0; i < 4; i++) {
          if (!result[i]) {
              if (fillerIndex < fillers.length) {
                  result[i] = fillers[fillerIndex];
                  fillerIndex++;
              } else {
                  // Fallback if we run out of unique articles
                  result[i] = articles[0] || { id: 0, title: 'No Article', url: '#' };
              }
          }
      }

      return result;
  }, [activeLesson, articles]);

  const handleLessonClick = (lessonId: number, isLocked: boolean) => {
      if (isLocked) {
          setIsAuthOpen(true); // Prompt login for locked lessons
      } else {
          setCurrentLessonId(lessonId);
          setIsSidebarOpen(false);
      }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
       
       {/* --- LEFT SIDEBAR: Navigation & User --- */}
       <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-black border-r border-[#222] transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
          
          <div className="p-8 pb-4 shrink-0">
              <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded flex items-center justify-center shrink-0">
                    <img 
                        src="https://cqpqyhehoiybggjuljzn.supabase.co/storage/v1/object/public/Enot/Group%201.png" 
                        className="w-full h-full object-contain" 
                        alt="Logo"
                    />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white leading-none">Shibari School</h1>
              </div>
              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-3 pl-2">
                  {t.course_content}
              </div>
          </div>

          {/* Lesson List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4 space-y-1">
              {lessons.map((lesson, index) => {
                  const isActive = currentLessonId === lesson.id;
                  // Business Logic: First 4 lessons are free. Others require auth.
                  const isLocked = !userProfile && index >= 4;

                  return (
                      <button 
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson.id, isLocked)}
                          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all group text-left ${
                              isActive ? 'bg-[#151515]' : 'hover:bg-[#111]'
                          } ${isLocked ? 'opacity-60 hover:opacity-100' : ''}`}
                      >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                              isLocked
                              ? 'bg-neutral-900 text-neutral-500'
                              : isActive 
                                ? 'bg-red-600 text-white' 
                                : 'bg-[#222] text-[#666] group-hover:bg-[#333]'
                          }`}>
                              {isLocked ? <Lock className="w-3 h-3" /> : index + 1}
                          </div>
                          <span className={`text-sm font-medium leading-tight ${isActive ? 'text-white' : 'text-[#888] group-hover:text-neutral-300'} ${isLocked ? 'text-neutral-500' : ''}`}>
                              {getData(lesson, 'title')}
                          </span>
                      </button>
                  );
              })}
          </div>

          {/* User Footer */}
          <div className="p-6 border-t border-[#222] bg-black space-y-4">
              {userProfile && (
                  <div className="flex items-center gap-3 px-2">
                      <div className="w-9 h-9 rounded-full bg-[#111] border border-[#222] flex items-center justify-center shrink-0 text-neutral-400">
                          <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-white truncate leading-none mb-1">
                              {userProfile.full_name || userProfile.email?.split('@')[0] || 'User'}
                          </span>
                          <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
                              {userProfile.system_role === 'admin' ? 'Administrator' : 'Student'}
                          </span>
                      </div>
                  </div>
              )}

              {userProfile && userProfile.system_role === 'admin' && (
                  <button 
                    onClick={() => setActiveModal('settings')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#333] text-[#888] hover:text-white hover:border-[#555] transition-all text-xs font-bold uppercase tracking-wider"
                  >
                      <Settings className="w-4 h-4" /> {t.settings}
                  </button>
              )}

              <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                        if (userProfile) {
                            supabase?.auth.signOut();
                        } else {
                            setIsAuthOpen(true);
                        }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 text-[#555] hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider py-2.5 rounded hover:bg-[#111]"
                  >
                      <LogOut className="w-3 h-3" /> {userProfile ? t.logout : t.login}
                  </button>
                  
                  <button 
                    onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#333] text-[#888] hover:text-white hover:border-[#555] transition-all text-[10px] font-bold uppercase shrink-0"
                  >
                      {lang === 'ru' ? 'EN' : 'RU'}
                  </button>
              </div>
          </div>
       </aside>

       {isSidebarOpen && <div className="fixed inset-0 bg-black/80 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

       {/* --- MAIN CONTENT AREA --- */}
       <main className="flex-1 flex flex-col min-w-0 relative bg-[#050505]">
           
           {/* Mobile Header */}
           <div className="md:hidden h-16 border-b border-[#222] flex items-center justify-between px-4 bg-black">
               <button onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6 text-white"/></button>
               <span className="font-bold text-white tracking-tight">Shibari School</span>
               <button onClick={() => setIsCartOpen(true)}><ShoppingBag className="w-6 h-6 text-white"/></button>
           </div>

           {/* Desktop Navigation */}
           <header className="hidden md:flex h-24 bg-[#050505] z-10 border-b border-white/5 relative items-center px-8 md:px-12">
               <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
                   <nav className="flex items-center gap-8 lg:gap-10 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                       <NavButton onClick={() => setActiveModal('articles')} label="Статьи" isActive={activeModal === 'articles'} />
                       <NavButton onClick={() => setActiveModal('dictionary')} label="Словарь" isActive={activeModal === 'dictionary'} />
                       <NavButton onClick={() => setActiveModal('navazu')} label="Навадзу" isActive={activeModal === 'navazu'} />
                       <NavButton onClick={() => setActiveModal('shop')} label="Магазин" isActive={activeModal === 'shop'} />
                       <NavButton onClick={() => setActiveModal('courses')} label="Курсы" isActive={activeModal === 'courses'} />
                       <NavButton onClick={() => setActiveModal('catalog')} label="Каталог" isActive={activeModal === 'catalog'} />
                       <NavButton onClick={() => setActiveModal('history')} label="История" isActive={activeModal === 'history'} />
                       <NavButton onClick={() => setActiveModal('kinbakushi')} label="Мастера" isActive={activeModal === 'kinbakushi'} />
                       <NavButton onClick={() => setActiveModal('events')} label="Афиша" isActive={activeModal === 'events'} />
                       <NavButton onClick={() => setActiveModal('resources')} label="Ресурсы" isActive={activeModal === 'resources'} />
                   </nav>
               </div>
           </header>

           {/* Lesson Content */}
           <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
               <div className="px-6 md:px-12 py-10 max-w-[1600px] mx-auto pb-32">
                   
                   <div className="mb-8 w-full max-w-5xl mx-auto flex flex-col items-start text-left relative">
                       {/* Floating Dictionary Button */}
                       <div className="absolute right-0 top-0">
                            <button 
                                    onClick={() => setActiveModal('dictionary')}
                                    className="text-[#444] hover:text-white transition-colors"
                                    title={t.dictionary}
                            >
                                <HelpCircle className="w-7 h-7" />
                            </button>
                       </div>

                       <div className="inline-block px-3 py-1.5 mb-4 text-[10px] font-bold text-red-500 bg-red-900/10 border border-red-900/30 rounded uppercase tracking-widest">
                           {t.current_lesson}
                       </div>
                       <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                           {getData(activeLesson, 'title')}
                       </h2>
                   </div>

                   {/* Video Player */}
                   <div className="mb-10 w-full max-w-5xl mx-auto">
                       <div className="aspect-video bg-black rounded-xl overflow-hidden border border-[#222] shadow-[0_0_40px_rgba(0,0,0,0.5)] relative w-full">
                           <VideoPlayer url={getData(activeLesson, 'video_url')} />
                       </div>
                   </div>

                   {/* Related Articles Row */}
                   <div className="w-full max-w-5xl mx-auto mb-12">
                        <div className="flex items-center gap-3 mb-6 pl-1 border-b border-white/5 pb-4">
                            <FileText className="w-4 h-4 text-red-600" />
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.15em]">
                                {lang === 'ru' ? 'Материалы к уроку' : 'Related Materials'}
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {currentRelatedArticles.map((article, index) => (
                                <button 
                                        key={`${article.id}-${index}`}
                                        onClick={() => setReadingArticle(article)}
                                        className="bg-[#111] border border-[#222] rounded-xl text-left hover:border-red-900/30 transition-all group flex flex-col hover:-translate-y-1 shadow-sm hover:shadow-red-900/10 hover:bg-[#161616] p-5 h-full"
                                >
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <h4 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors leading-snug">
                                            {getData(article, 'title')}
                                        </h4>
                                        <span className="text-[10px] font-bold text-neutral-600 group-hover:text-red-500 font-mono uppercase bg-black/50 px-2 py-1 rounded transition-colors shrink-0">
                                            #{index + 1}
                                        </span>
                                    </div>
                                    
                                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                                        {getData(article, 'description')}
                                    </p>
                                </button>
                            ))}
                        </div>
                   </div>

                   {/* Text Content (With Dictionary Hooks) */}
                   <div className="w-full max-w-5xl mx-auto border-t border-white/5 pt-10">
                        <TextContent 
                            paragraphs={getData(activeLesson, 'content') || []} 
                            dictionary={dictionary} 
                            onWordClick={setSelectedTerm}
                            lang={lang}
                        />
                   </div>

                   <div className="text-center mt-20 text-[#333] text-xs uppercase tracking-widest font-bold">
                       {t.copyright}
                   </div>

               </div>
           </div>

           {/* Floating Cart Button (Mobile) */}
           <button 
                onClick={() => setIsCartOpen(true)} 
                className="fixed bottom-8 right-8 z-30 bg-red-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:scale-110 transition-transform md:hidden"
           >
               <ShoppingBag className="w-6 h-6" />
               {cart.length > 0 && (
                   <span className="absolute top-0 right-0 bg-white text-red-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-red-600">
                       {cart.length}
                   </span>
               )}
           </button>

       </main>

       {/* --- MODALS & OVERLAYS --- */}
       
       <DictionaryDrawer 
          term={selectedTerm} 
          dictionary={dictionary} 
          onClose={() => setSelectedTerm(null)} 
          lang={lang} 
          t={t}
       />

       <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart} 
          userProfile={userProfile} 
          onUpdateQuantity={updateCartQuantity} 
          onRemove={removeFromCart} 
          onClear={() => setCart([])} 
          t={t}
          getData={getData}
       />

       {isAuthOpen && <AuthOverlay onLoginSuccess={() => { setIsAuthOpen(false); fetchData(); }} onClose={() => setIsAuthOpen(false)} t={t} />}

       <MarketplaceModal isOpen={activeModal === 'shop'} onClose={() => setActiveModal(null)} products={products} cart={cart} addToCart={addToCart} openCart={() => setIsCartOpen(true)} lang={lang} t={t} getData={getData} />
       <CoursesModal isOpen={activeModal === 'courses'} onClose={() => setActiveModal(null)} courses={courses} cart={cart} addToCart={addToCart} openCart={() => setIsCartOpen(true)} lang={lang} t={t} getData={getData} />
       <CatalogModal isOpen={activeModal === 'catalog'} onClose={() => setActiveModal(null)} categories={catalogCategories} videos={catalogVideos} lang={lang} t={t} />
       <HistoryModal isOpen={activeModal === 'history'} onClose={() => setActiveModal(null)} events={historyEvents} lang={lang} t={t} />
       <KinbakushiModal isOpen={activeModal === 'kinbakushi'} onClose={() => setActiveModal(null)} lang={lang} t={t} />
       <EventsModal isOpen={activeModal === 'events'} onClose={() => setActiveModal(null)} events={events} lang={lang} t={t} />
       <NavazuModal isOpen={activeModal === 'navazu'} onClose={() => setActiveModal(null)} lang={lang} />
       <ResourcesModal isOpen={activeModal === 'resources'} onClose={() => setActiveModal(null)} resources={INITIAL_SOCIAL_RESOURCES} lang={lang} t={t} />
       <GlossaryModal isOpen={activeModal === 'dictionary'} onClose={() => setActiveModal(null)} dictionary={dictionary} lang={lang} t={t} />

       <ArticlesModal 
         isOpen={activeModal === 'articles'} 
         onClose={() => setActiveModal(null)} 
         articles={articles} 
         lessons={lessons}
         onSelectArticle={(a) => { setActiveModal(null); setReadingArticle(a); }}
         lang={lang}
         t={t}
         getData={getData}
       />
       <ArticleReader 
         article={readingArticle} 
         onClose={() => setReadingArticle(null)} 
         lang={lang} 
         t={t}
         getData={getData}
       />

       <SettingsModal 
          isOpen={activeModal === 'settings'} 
          onClose={() => setActiveModal(null)} 
          lessons={lessons} 
          onUpdateLesson={handleUpdateLesson}
          products={products}
          courses={courses}
          events={events}
          history={historyEvents}
          articles={articles}
          catalogCategories={catalogCategories}
          catalogVideos={catalogVideos}
          dictionary={dictionary}
          onRefresh={fetchData}
       />

    </div>
  );
};

// Navigation Button Helper
const NavButton: React.FC<{ onClick: () => void; label: string; isActive?: boolean }> = ({ onClick, label, isActive }) => (
    <button 
        onClick={onClick} 
        className={`relative group uppercase hover:text-white transition-colors duration-300 py-1 ${isActive ? 'text-white' : ''}`}
    >
        {label}
        <span className={`absolute -bottom-1 left-0 w-full h-[2px] bg-red-600 transition-transform duration-300 ease-out origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
    </button>
);

export default App;