"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { mockEPICImages, getEPICImageUrl, type EPICImage } from "@/lib/nasa/epic";
import { Globe, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export function EPICWidget() {
  const [images, setImages] = useState<EPICImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [selectedImage, setSelectedImage] = useState<EPICImage | null>(null);
  const [imageType, setImageType] = useState<"natural" | "enhanced" | "aerosol">("natural");

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nasa/epic");
      if (!res.ok) throw new Error("API error");
      const data: EPICImage[] = await res.json();
      setImages(data.slice(0, 6));
      setUseMock(false);
    } catch {
      setImages(mockEPICImages);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          <Skeleton variant="rectangular" height={120} className="w-full" />
          <Skeleton variant="text" height={24} className="w-1/2" />
        </div>
      </Card>
    );
  }

  if (images.length === 0) {
    return (
      <Card className="cursor-pointer hover:border-[var(--color-primary)]/50" onClick={fetchImages}>
        <div className="flex flex-col items-center justify-center py-8">
          <Globe className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
          <p className="text-[var(--color-text-muted)] mb-2">Terra do Espaço</p>
          <p className="text-sm text-[var(--color-primary)]">Clique para carregar</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Terra do Espaço</h3>
        </div>
        {useMock && <Badge variant="warning">Demo</Badge>}
      </div>

      <div className="flex gap-2 mb-4">
        {(["natural", "enhanced", "aerosol"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setImageType(type)}
            className={`px-2 py-1 text-xs rounded ${
              imageType === type 
                ? "bg-[var(--color-primary)] text-[var(--color-bg)]" 
                : "bg-white/10 text-[var(--color-text-muted)]"
            }`}
          >
            {type === "natural" ? "Natural" : type === "enhanced" ? "Enhanced" : "Aerosol"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {images.slice(0, 6).map((img, index) => (
          <motion.button
            key={img.identifier}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedImage(img)}
            className="relative aspect-square rounded-lg overflow-hidden bg-black/50 group"
          >
            <Globe className="w-8 h-8 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
            <div className="absolute bottom-1 left-1 right-1 text-[8px] text-[var(--color-text-muted)] truncate">
              {new Date(img.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </div>
          </motion.button>
        ))}
      </div>

      <button onClick={fetchImages} className="w-full mt-3 text-sm text-[var(--color-primary)] hover:underline">
        Atualizar →
      </button>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-2xl w-full mx-4 glass p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-[var(--color-text)]">Terra do Espaço</h4>
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-3">
              <Globe className="w-16 h-16 text-[var(--color-text-muted)]" />
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              {selectedImage.caption}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-muted)]">
              <span>Lat: {selectedImage.centroid_coordinates.lat.toFixed(2)}°</span>
              <span>Lon: {selectedImage.centroid_coordinates.lon.toFixed(2)}°</span>
              <span>{new Date(selectedImage.date).toLocaleString("pt-BR")}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}