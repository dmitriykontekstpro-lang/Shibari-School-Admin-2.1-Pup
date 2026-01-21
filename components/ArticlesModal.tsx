import React, { useState, useMemo } from 'react';
import { X, FileText, ExternalLink, ArrowRight, Search } from 'lucide-react';
import { Article, Lesson } from '../types';

interface ArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  lessons: Lesson[];
  onSelectArticle?: (article: Article) => void;
  lang?: 'ru' | 'en';
  t?: any;
  getData?: (item: any, field: string) => string;
}

const ArticlesModal: React.FC<ArticlesModalProps> = ({ 
    isOpen, onClose, articles, lessons, onSelectArticle, lang = 'ru', t, getData 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Helper must be defined before useMemo
  const _getData = getData || ((i: any, f: string) => i[f]);

  // Filter articles based on search
  // MOVED UP: Must be called unconditionally before any return statement
  const filteredArticles = useMemo(() => {
      if (!searchQuery) return articles;
      const lowerQ = searchQuery.toLowerCase();
      return articles.filter(a => {
          const title = _getData(a, 'title')?.toLowerCase() || '';
          const desc = _getData(a, 'description')?.toLowerCase() || '';
          return title.includes(lowerQ) || desc.includes(lowerQ);
      });
  }, [articles, searchQuery, _getData]);

  // Conditional return must be AFTER all hooks
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-neutral-900 px-4 md:px-8 py-4 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 bg-red-900/20 rounded-lg">
                    <FileText className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight whitespace-nowrap">
                    {t ? t.articles : 'Библиотека'}
                </h2>
            </div>

            {/* Right Side: Search + Desktop Close */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                {/* Search Bar */}
                <div className="relative w-full md:w-64 lg:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={lang === 'ru' ? "Поиск статей..." : "Search articles..."}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-red-600 transition-colors placeholder-neutral-600"
                    />
                </div>

                {/* Desktop Close Button */}
                <button 
                onClick={onClose}
                className="group hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600 hover:bg-red-900/20 transition-all duration-300 shrink-0"
                >
                <X className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Mobile Close Button (Absolute) */}
        <button 
          onClick={onClose}
          className="group flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600 hover:bg-red-900/20 transition-all duration-300 shrink-0 absolute top-4 right-4"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 scroll-smooth">
        <div className="max-w-7xl mx-auto pb-20">
          {filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg">Статьи не найдены.</p>
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="mt-4 text-red-500 hover:underline text-sm">
                        Очистить поиск
                    </button>
                )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} onClick={onSelectArticle} getData={_getData} t={t} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ArticleCard: React.FC<{ article: Article, onClick?: (a: Article) => void, getData: any, t: any }> = ({ article, onClick, getData, t }) => (
    <button 
        onClick={() => onClick && onClick(article)}
        className="group relative flex flex-col p-5 bg-neutral-900/50 rounded-xl border border-neutral-800 hover:border-red-600/50 hover:bg-neutral-900 transition-all duration-300 shadow-sm hover:shadow-red-900/10 text-left w-full h-full min-h-[180px]"
    >
        <div className="flex justify-between items-start mb-3 w-full">
            <span className="text-[10px] font-bold text-neutral-600 group-hover:text-red-500 uppercase tracking-widest bg-black/30 px-2 py-1 rounded transition-colors">
                #{article.id}
            </span>
            <ExternalLink className="w-3 h-3 text-neutral-700 group-hover:text-neutral-400 transition-colors" />
        </div>
        
        <h4 className="text-base font-bold text-neutral-300 group-hover:text-white mb-2 leading-snug line-clamp-2">
            {getData(article, 'title')}
        </h4>
        
        <p className="text-neutral-500 text-xs leading-relaxed mb-4 flex-1 line-clamp-3">
            {getData(article, 'description') || '...'}
        </p>
        
        <div className="flex items-center text-xs font-medium text-neutral-600 group-hover:text-red-500 transition-colors mt-auto pt-3 border-t border-neutral-800/50 group-hover:border-neutral-800 w-full">
            {t ? t.read_more : 'Читать'} <ArrowRight className="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform" />
        </div>
    </button>
);

export default ArticlesModal;