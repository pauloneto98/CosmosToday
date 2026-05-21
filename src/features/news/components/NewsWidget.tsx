"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { searchNASAImages, mockImages, categories, type NASAImage } from "@/lib/external/nasa-images";
import { Newspaper, Search, Filter } from "lucide-react";

export function NewsWidget() {
  const [images, setImages] = useState<NASAImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("mission");
  const [selectedImage, setSelectedImage] = useState<NASAImage | null>(null);

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const category = categories.find(c => c.id === selectedCategory);
      const data = await searchNASAImages(category?.query || "nasa", "image", 1);
      const items = data.collection.items
        .slice(0, 6)
        .map(item => item.data[0])
        .filter(Boolean);
      setImages(items);
      setUseMock(false);
    } catch {
      setImages(mockImages);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          <Skeleton variant="rectangular" height={40} className="w-full" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} className="w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (images.length === 0) {
    return (
      <Card className="cursor-pointer hover:border-[var(--color-primary)]/50" onClick={fetchNews}>
        <div className="flex flex-col items-center justify-center py-8">
          <Newspaper className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
          <p className="text-[var(--color-text-muted)] mb-2">Notícias</p>
          <p className="text-sm text-[var(--color-primary)]">Clique para carregar</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Notícias</h3>
        </div>
        {useMock && <Badge variant="warning">Demo</Badge>}
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setImages([]);
            }}
            className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
              selectedCategory === cat.id 
                ? "bg-[var(--color-primary)] text-[var(--color-bg)]" 
                : "bg-white/10 text-[var(--color-text-muted)]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
        {images.map((img, index) => (
          <motion.button
            key={img.nasa_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedImage(img)}
            className="w-full p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded bg-white/10 flex-shrink-0 flex items-center justify-center">
                {img.media_type === "video" ? "🎥" : "🖼️"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2">
                  {img.title}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {new Date(img.date_created).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <button onClick={fetchNews} className="w-full mt-3 text-sm text-[var(--color-primary)] hover:underline">
        Atualizar →
      </button>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-2xl w-full mx-4 glass p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-[var(--color-text)]">Notícia</h4>
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-3">
              <Newspaper className="w-16 h-16 text-[var(--color-text-muted)]" />
            </div>
            <h5 className="text-lg font-bold text-[var(--color-text)] mb-2">{selectedImage.title}</h5>
            <p className="text-sm text-[var(--color-text-muted)]">
              {selectedImage.description || "Sem descrição disponível."}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-muted)]">
              <span>{selectedImage.center}</span>
              <span>{new Date(selectedImage.date_created).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}