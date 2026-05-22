"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Newspaper, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Bookmark, 
  BookmarkCheck,
  Video,
  Image as ImageIcon,
  Activity,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { searchNASAImages, mockImages, categories, type NASAImage } from "@/lib/external/nasa-images";
import { saveToFavorites } from "@/app/actions/user";

interface NewsItem extends NASAImage {
  thumbnail?: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("mission");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchNewsList();
  }, [selectedCategory, currentPage]);

  const fetchNewsList = async () => {
    setLoading(true);
    try {
      const activeCat = categories.find(c => c.id === selectedCategory);
      const query = searchQuery.trim() || activeCat?.query || "nasa";
      const data = await searchNASAImages(query, "image", currentPage);
      
      const items: NewsItem[] = data.collection.items
        .map(item => {
          if (!item.data || item.data.length === 0) return null;
          return {
            ...item.data[0],
            thumbnail: item.links?.[0]?.href
          } as NewsItem;
        })
        .filter((item): item is NewsItem => item !== null);

      setNews(items);
      setUseMock(false);
    } catch (error) {
      console.error("❌ Erro ao obter feed de notícias da NASA:", error);
      // Map mock images to match the new dynamic type
      const mockItems: NewsItem[] = mockImages.map(img => ({
        ...img,
        thumbnail: img.asset?.thumbnail || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop"
      }));
      setNews(mockItems);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNewsList();
  };

  const handleSaveFavorite = async (item: NewsItem) => {
    setSavingId(item.nasa_id);
    const mediaUrl = item.thumbnail || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop";
    
    try {
      const res = await saveToFavorites(
        item.title,
        "news",
        mediaUrl,
        item.date_created,
        item.description || "Sem descrição adicional da NASA.",
        mediaUrl
      );
      
      if (res.success) {
        setSavedSuccess(item.nasa_id);
        setTimeout(() => setSavedSuccess(null), 3000);
      } else {
        alert(res.error || "Erro ao salvar favorito.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Newspaper className="w-8 h-8 text-[var(--color-primary)] animate-pulse" />
            NASA Media Feed & Notícias Espaciais
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Explore as últimas publicações, pesquisas, missões e descobertas da NASA através da biblioteca oficial de mídia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="py-1 px-3">
            NASA Images API Active
          </Badge>
          {useMock && <Badge variant="warning">Demo Mode</Badge>}
        </div>
      </div>

      {/* Search & Category Filter Section */}
      <Card className="p-5 bg-white/5 border border-white/10 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input 
              type="text" 
              placeholder="Pesquise por temas (ex: James Webb, Marte, Apollo, Saturno...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all"
            />
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="flex items-center justify-center gap-2"
          >
            {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Pesquisar
          </Button>
        </form>

        <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1 border-t border-white/5">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            Categorias:
          </span>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.id && !searchQuery
                    ? "bg-[var(--color-primary)] text-black"
                    : "bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* News Grid */}
      {loading ? (
        <div className="py-20 text-center text-[var(--color-text-muted)] space-y-4">
          <Activity className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto" />
          <p className="animate-pulse">Descriptografando imagens e dados científicos oficiais da NASA...</p>
        </div>
      ) : news.length === 0 ? (
        <Card className="py-20 text-center bg-white/5 border border-white/10">
          <Newspaper className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 animate-pulse" />
          <p className="text-[var(--color-text-muted)]">Nenhuma notícia encontrada para esta pesquisa.</p>
          <Button size="sm" variant="ghost" onClick={fetchNewsList} className="mt-4">
            Recarregar Notícias
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => {
              const dateText = new Date(item.date_created).toLocaleDateString("pt-BR");
              const hasThumb = !!item.thumbnail;

              return (
                <motion.div
                  key={item.nasa_id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index % 6) * 0.05 }}
                  className="group flex flex-col justify-between rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-[var(--color-primary)]/40 transition-all cursor-pointer"
                  onClick={() => setSelectedNews(item)}
                >
                  <div className="relative aspect-video w-full bg-black overflow-hidden border-b border-white/5">
                    {hasThumb ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] bg-white/3">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-[10px]">Sem visualização</span>
                      </div>
                    )}
                    
                    <Badge variant="primary" className="absolute top-2 left-2 backdrop-blur-md bg-black/60 font-mono text-[9px] tracking-wider">
                      {item.center}
                    </Badge>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[var(--color-primary)]" />
                          {dateText}
                        </span>
                        <span className="flex items-center gap-1 uppercase">
                          {item.media_type === "video" ? <Video className="w-3 h-3 text-amber-400" /> : <ImageIcon className="w-3 h-3 text-cyan-400" />}
                          {item.media_type}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex gap-2 border-t border-white/5 pt-3" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedNews(item)}
                        className="flex-1 text-xs border border-white/10"
                      >
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleSaveFavorite(item)}
                        disabled={savingId === item.nasa_id}
                        className="flex-1 text-xs"
                      >
                        {savingId === item.nasa_id ? (
                          "Salvando..."
                        ) : savedSuccess === item.nasa_id ? (
                          "Salvo ✓"
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            <Bookmark className="w-3 h-3" /> Favoritar
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-4 border-t border-white/10 pt-6">
            <Button
              size="sm"
              variant="ghost"
              disabled={currentPage <= 1 || loading}
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>
            <span className="text-xs text-[var(--color-text-muted)] font-mono">
              Página <strong className="text-white">{currentPage}</strong>
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={loading || news.length < 9}
              onClick={() => {
                setCurrentPage(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-1"
            >
              Próxima <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* News Reader Modal */}
      <AnimatePresence>
        {selectedNews && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl w-full mx-4 bg-space-black/95 border border-white/15 rounded-2xl p-6 relative overflow-hidden" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white text-2xl font-bold bg-white/5 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10 z-10"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="w-5 h-5 text-[var(--color-primary)]" />
                <h4 className="text-lg font-bold text-white truncate max-w-[80%]">NASA Mídia Oficial</h4>
              </div>

              {selectedNews.thumbnail && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center mb-4 border border-white/10 max-h-[300px]">
                  <img 
                    src={selectedNews.thumbnail}
                    alt={selectedNews.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                <h5 className="text-xl font-bold text-white leading-snug">{selectedNews.title}</h5>

                <div className="flex flex-wrap gap-3 items-center text-xs text-[var(--color-text-muted)] font-mono bg-white/3 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>Lançado em: {new Date(selectedNews.date_created).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>Centro: {selectedNews.center}</span>
                  </div>
                  {selectedNews.keywords && selectedNews.keywords.length > 0 && (
                    <div className="flex items-center gap-1.5 truncate max-w-full">
                      <span>Keywords: {selectedNews.keywords.slice(0, 3).join(", ")}</span>
                    </div>
                  )}
                </div>

                <div className="text-sm leading-relaxed text-white/80 space-y-2 border-t border-white/5 pt-4">
                  <p>{selectedNews.description}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-white/5 pt-4 mt-6">
                <Button variant="ghost" onClick={() => setSelectedNews(null)}>
                  Fechar
                </Button>
                <Button variant="primary" onClick={() => handleSaveFavorite(selectedNews)}>
                  {savingId === selectedNews.nasa_id ? (
                    "Salvando..."
                  ) : savedSuccess === selectedNews.nasa_id ? (
                    "Salvo nos Favoritos ✓"
                  ) : (
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5" /> Adicionar aos Favoritos
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
