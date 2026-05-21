"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { getLatestMarsPhotos, mockMarsPhotos, roverInfo, type RoverName, type MarsPhoto } from "@/lib/nasa/mars-rover";
import { Moon, Camera, RefreshCw } from "lucide-react";

export function MarsRoverWidget() {
  const [photos, setPhotos] = useState<MarsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [selectedRover, setSelectedRover] = useState<RoverName>("curiosity");
  const [selectedPhoto, setSelectedPhoto] = useState<MarsPhoto | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, [selectedRover]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const data = await getLatestMarsPhotos(selectedRover);
      setPhotos(data.photos.slice(0, 6));
      setUseMock(false);
    } catch {
      setPhotos(mockMarsPhotos);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  const rovers: RoverName[] = ["curiosity", "perseverance", "opportunity", "spirit"];

  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          <Skeleton variant="rectangular" height={100} className="w-full" />
          <Skeleton variant="text" height={24} className="w-1/2" />
        </div>
      </Card>
    );
  }

  if (photos.length === 0) {
    return (
      <Card className="cursor-pointer hover:border-[var(--color-primary)]/50" onClick={fetchPhotos}>
        <div className="flex flex-col items-center justify-center py-8">
          <Moon className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
          <p className="text-[var(--color-text-muted)] mb-2">Marte</p>
          <p className="text-sm text-[var(--color-primary)]">Clique para carregar</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Marte</h3>
        </div>
        {useMock && <Badge variant="warning">Demo</Badge>}
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {rovers.map((rover) => (
          <button
            key={rover}
            onClick={() => {
              setSelectedRover(rover);
              setPhotos([]);
            }}
            className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
              selectedRover === rover 
                ? "bg-[var(--color-primary)] text-[var(--color-bg)]" 
                : "bg-white/10 text-[var(--color-text-muted)]"
            }`}
          >
            {roverInfo[rover].name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.slice(0, 6).map((photo, index) => (
          <motion.button
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square rounded-lg overflow-hidden bg-black/50 group"
          >
            <Moon className="w-6 h-6 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
            <div className="absolute bottom-1 left-1 right-1 text-[8px] text-[var(--color-text-muted)]">
              Sol {photo.sol}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Camera className="w-3 h-3" />
          <span>{roverInfo[selectedRover].status}</span>
        </div>
        <button 
          onClick={fetchPhotos} 
          className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Atualizar
        </button>
      </div>

      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-2xl w-full mx-4 glass p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-[var(--color-text)]">Marte - {selectedPhoto.rover.name}</h4>
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-3">
              <Moon className="w-16 h-16 text-[var(--color-text-muted)]" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="primary">Sol {selectedPhoto.sol}</Badge>
                <span className="text-[var(--color-text-muted)]">{selectedPhoto.camera.full_name}</span>
              </div>
              <p className="text-[var(--color-text-muted)]">
                Terra: {new Date(selectedPhoto.earth_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}