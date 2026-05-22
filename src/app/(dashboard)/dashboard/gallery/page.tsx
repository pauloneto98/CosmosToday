"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Image as ImageIcon, Heart, Download, Share2, Trash2, Filter, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { getFavorites, deleteFavorite } from "@/app/actions/user";

interface FavoriteItem {
  id: number;
  userId: string;
  title: string;
  mediaType: string;
  url: string;
  date: string;
  explanation: string;
  hdurl: string | null;
}

const filterOptions = [
  { id: "all", label: "Todas" },
  { id: "apod", label: "APOD" },
  { id: "mars", label: "Marte" },
  { id: "asteroid", label: "Asteroides" },
  { id: "comet", label: "Cometas" },
];

export default function GalleryPage() {
  const [filter, setFilter] = useState("all");
  const [favoritesList, setFavoritesList] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<FavoriteItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavoritesList(data as unknown as FavoriteItem[]);
    } catch (error) {
      console.error("Erro ao carregar favoritos da galeria:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent | undefined, id: number) => {
    if (e) e.stopPropagation();
    if (!confirm("Tem certeza que deseja remover esta imagem dos salvos?")) return;
    setDeletingId(id);
    try {
      const res = await deleteFavorite(id);
      if (res.success) {
        setFavoritesList(prev => prev.filter(f => f.id !== id));
        if (selectedImage?.id === id) {
          setSelectedImage(null);
        }
      } else {
        alert(res.error || "Erro ao deletar.");
      }
    } catch (err: any) {
      alert(err.message || "Erro ao deletar.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredImages = filter === "all" 
    ? favoritesList 
    : favoritesList.filter(img => img.mediaType.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text)]">
            Galeria Cósmica
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Seus registros e fotos salvos do cosmos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={loadFavorites} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Sincronizar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Filtrar:</span>
        </div>
        <div className="flex gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ${
                filter === opt.id
                  ? "bg-[var(--color-primary)] text-[var(--color-bg)] font-bold shadow-md shadow-[var(--color-primary)]/20"
                  : "bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-4" />
          <p className="text-[var(--color-text-muted)]">Buscando dados no seu terminal espacial...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10">
          <ImageIcon className="w-16 h-16 text-[var(--color-text-muted)] mb-4 animate-pulse" />
          <p className="text-[var(--color-text-muted)] mb-2 text-lg">Nenhum registro cósmico nesta categoria</p>
          <p className="text-sm text-[var(--color-primary)] max-w-sm text-center">
            Explore os widgets de APOD, Marte, Asteroides ou Cometas no dashboard e clique no botão de salvar para catalogá-los aqui!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img, index) => {
            const isImageUrl = img.url && (img.url.startsWith("http") && !img.url.includes("youtube.com") && !img.url.includes("vimeo.com") && !img.url.includes("html"));
            return (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative group cursor-pointer border border-white/10 hover:border-[var(--color-primary)]/50 rounded-lg overflow-hidden bg-white/5"
                onClick={() => setSelectedImage(img)}
              >
                <div className="aspect-square relative overflow-hidden flex items-center justify-center">
                  {isImageUrl ? (
                    <img 
                      src={img.url} 
                      alt={img.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-space-black p-4 text-center">
                      <ImageIcon className="w-12 h-12 text-[var(--color-text-muted)] mb-2 group-hover:text-[var(--color-primary)] transition-colors" />
                      <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{img.mediaType}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(e, img.id)}
                    disabled={deletingId === img.id}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-red-400 hover:text-red-500 hover:bg-black/90 transition-colors z-20 opacity-0 group-hover:opacity-100"
                  >
                    {deletingId === img.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
                  <p className="text-sm text-white font-medium truncate mb-1">{img.title}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      img.mediaType === "apod" ? "primary" :
                      img.mediaType === "mars" ? "warning" :
                      img.mediaType === "comet" ? "accent" : "secondary"
                    } className="text-[8px] py-0 px-1 uppercase">
                      {img.mediaType}
                    </Badge>
                    <span className="text-[10px] text-white/50">{new Date(img.date).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-3xl w-full mx-4 glass p-5 border border-white/10 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-text)] truncate max-w-[85%]">{selectedImage.title}</h3>
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center mb-4 border border-white/5 relative">
              {selectedImage.url && (selectedImage.url.startsWith("http") && !selectedImage.url.includes("youtube.com") && !selectedImage.url.includes("vimeo.com") && !selectedImage.url.includes("html")) ? (
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.title} 
                  className="w-full h-full object-contain"
                />
              ) : selectedImage.url && (selectedImage.url.includes("youtube.com") || selectedImage.url.includes("vimeo.com")) ? (
                <iframe 
                  src={selectedImage.url} 
                  className="w-full h-full"
                  allowFullScreen
                  title={selectedImage.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-[var(--color-text-muted)]">
                  <ImageIcon className="w-16 h-16 mb-2" />
                  <p className="text-sm">Pré-visualização de imagem não disponível para este item.</p>
                  {selectedImage.url && (
                    <a 
                      href={selectedImage.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      Ver link de origem <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="uppercase">{selectedImage.mediaType}</Badge>
                  <span className="text-xs text-[var(--color-text-muted)]">Catalogado em {new Date(selectedImage.date).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDelete(undefined, selectedImage.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Remover
                  </Button>
                  {selectedImage.url && selectedImage.url.startsWith("http") && (
                    <a href={selectedImage.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="primary">
                        <ExternalLink className="w-4 h-4 mr-1" /> Abrir JPL/NASA
                      </Button>
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-h-[120px] overflow-y-auto pr-1">
                {selectedImage.explanation || "Sem descrição adicional registrada para este item."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}