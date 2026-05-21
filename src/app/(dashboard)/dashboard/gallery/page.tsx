"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Image, Grid, Heart, Download, Share2, Trash2, Filter } from "lucide-react";

const mockSavedImages = [
  { id: 1, title: "Nebulosa de Orion", date: "2024-01-15", type: "APOD", thumbnail: "" },
  { id: 2, title: "Pôr do sol em Marte", date: "2024-01-14", type: "Mars", thumbnail: "" },
  { id: 3, title: "Aurora Austral", date: "2024-01-13", type: "Solar", thumbnail: "" },
  { id: 4, title: "Galáxia Andromeda", date: "2024-01-12", type: "APOD", thumbnail: "" },
  { id: 5, title: "Terra ao anoitecer", date: "2024-01-11", type: "EPIC", thumbnail: "" },
  { id: 6, title: "Chuva de meteoros", date: "2024-01-10", type: "APOD", thumbnail: "" },
];

const filterOptions = [
  { id: "all", label: "Todas" },
  { id: "apod", label: "APOD" },
  { id: "mars", label: "Marte" },
  { id: "epic", label: "Terra" },
  { id: "solar", label: "Solar" },
];

export default function GalleryPage() {
  const [filter, setFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<typeof mockSavedImages[0] | null>(null);

  const filteredImages = filter === "all" 
    ? mockSavedImages 
    : mockSavedImages.filter(img => img.type.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text)]">
            Galeria
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Suas fotos salvas do cosmos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4 mr-1" />
            Compartilhar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Filtrar:</span>
        </div>
        <div className="flex gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filter === opt.id
                  ? "bg-[var(--color-primary)] text-[var(--color-bg)]"
                  : "bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20">
          <Image className="w-16 h-16 text-[var(--color-text-muted)] mb-4" />
          <p className="text-[var(--color-text-muted)] mb-2">Nenhuma imagem salva</p>
          <p className="text-sm text-[var(--color-primary)]">
            Clique no ícone de salvar nas fotos do dashboard
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedImage(img)}
            >
              <div className="aspect-square rounded-lg bg-white/5 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-12 h-12 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-sm text-white font-medium truncate">{img.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="default" className="text-[10px]">{img.type}</Badge>
                  <span className="text-[10px] text-white/70">{img.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-3xl w-full mx-4 glass p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-text)]">{selectedImage.title}</h3>
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
              <Image className="w-20 h-20 text-[var(--color-text-muted)]" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="primary">{selectedImage.type}</Badge>
                <span className="text-sm text-[var(--color-text-muted)]">{selectedImage.date}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}