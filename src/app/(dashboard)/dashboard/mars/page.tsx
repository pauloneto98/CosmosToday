"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getLatestMarsPhotos, roverInfo, type RoverName, type MarsPhoto } from "@/lib/nasa/mars-rover";
import { 
  Compass, 
  Thermometer, 
  Wind, 
  Gauge, 
  Calendar, 
  Camera, 
  Image as ImageIcon,
  Rocket, 
  Clock, 
  RefreshCw 
} from "lucide-react";
import { saveToFavorites } from "@/app/actions/user";

export default function MarsPage() {
  const [photos, setPhotos] = useState<MarsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRover, setSelectedRover] = useState<RoverName>("curiosity");
  const [selectedPhoto, setSelectedPhoto] = useState<MarsPhoto | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<number | null>(null);

  useEffect(() => {
    fetchRoverPhotos();
  }, [selectedRover]);

  const fetchRoverPhotos = async () => {
    setLoading(true);
    try {
      const res = await getLatestMarsPhotos(selectedRover);
      setPhotos(res.photos || []);
    } catch (error) {
      console.error("❌ Erro ao buscar fotos de Marte:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFavorite = async (photo: MarsPhoto) => {
    setSavingId(photo.id);
    try {
      const res = await saveToFavorites(
        `Marte - Rover ${photo.rover.name} (Sol ${photo.sol})`,
        "image",
        photo.img_src,
        photo.earth_date,
        `Foto capturada pela câmera ${photo.camera.full_name} a bordo do Rover ${photo.rover.name} em Marte durante o Sol ${photo.sol}.`,
        photo.img_src
      );
      if (res.success) {
        setSavedSuccess(photo.id);
        setTimeout(() => setSavedSuccess(null), 3000);
      } else {
        alert(res.error || "Falha ao salvar nos favoritos.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const rovers: RoverName[] = ["curiosity", "perseverance", "opportunity", "spirit"];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Rocket className="w-8 h-8 text-[var(--color-primary)] animate-bounce" />
            Exploração de Marte & Rovers
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Explore a superfície do Planeta Vermelho através das lentes dos robôs da NASA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="py-1 px-3">
            Mars Telemetry Feed
          </Badge>
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
        </div>
      </div>

      {/* Hero / Overview Section */}
      <section className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-end p-6">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Cinematic view of Mars surface" 
            className="w-full h-full object-cover object-center opacity-70"
            src="https://images.unsplash.com/photo-1612892483236-42d68a57623d?q=80&w=1200&auto=format&fit=crop"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-[var(--color-primary)] text-sm">
            <Compass className="w-4 h-4" />
            <span className="font-semibold uppercase tracking-wider">The Red Planet On Display</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Planeta Vermelho</h2>
          <p className="text-white/80 max-w-xl text-sm leading-relaxed">
            Dados e telemetria climática em tempo real da cratera Gale, além do histórico e imagens de câmeras de alta fidelidade como Mastcam e Navcam.
          </p>
        </div>
      </section>

      {/* Grid: Telemetry & Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gale Crater Climate */}
        <Card className="bg-white/5 border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs text-[var(--color-text-muted)] font-bold tracking-widest uppercase">Cratera Gale</span>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
                Clima em Marte
              </h3>
            </div>
            <Thermometer className="w-6 h-6 text-red-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Temp Máx / Mín</p>
              <p className="text-2xl font-bold text-red-400 font-mono mt-0.5">-5° <span className="text-xs text-white/50">/ -80°C</span></p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Pressão</p>
              <p className="text-2xl font-bold text-white font-mono mt-0.5">715 Pa</p>
            </div>
            <div className="col-span-2 border-t border-white/5 pt-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Ventos Atmosféricos</p>
                <p className="text-sm font-medium text-white">14.2 m/s NE</p>
              </div>
              <Wind className="w-4 h-4 text-[var(--color-text-muted)]" />
            </div>
          </div>
        </Card>

        {/* Mars Specs */}
        <Card className="bg-white/5 border border-white/10 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs text-[var(--color-text-muted)] font-bold tracking-widest uppercase">Física Planetária</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Especificações de Marte</h3>
            </div>
            <Gauge className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Gravidade</p>
              <p className="text-xl font-bold text-white font-mono mt-0.5">3.71 m/s²</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">(0.379 da Terra)</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Dia Marciano (Sol)</p>
              <p className="text-xl font-bold text-white font-mono mt-0.5">24h 37m 22s</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">(1.026 dias terrestres)</p>
            </div>
          </div>
        </Card>

        {/* Selected Rover Info */}
        <Card className="bg-white/5 border border-white/10 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs text-[var(--color-text-muted)] font-bold tracking-widest uppercase">Robô Explorador</span>
              <h3 className="text-lg font-bold text-white mt-0.5 capitalize">
                Rover {roverInfo[selectedRover].name}
              </h3>
            </div>
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Lançamento:</span>
              <span className="text-white font-mono">{roverInfo[selectedRover].launched}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Status da Missão:</span>
              <Badge variant={roverInfo[selectedRover].status === "active" ? "primary" : "default"}>
                {roverInfo[selectedRover].status === "active" ? "Ativo" : "Concluído"}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Câmeras Disponíveis:</span>
              <span className="text-white font-mono text-xs truncate max-w-[150px]">
                {roverInfo[selectedRover].cameras.join(", ")}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Photos Gallery */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Últimas Fotos Capturadas</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Imagens capturadas pelos rovers reais da NASA.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)] mr-2">Filtrar por Rover:</span>
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
              {rovers.map((rover) => (
                <button
                  key={rover}
                  onClick={() => setSelectedRover(rover)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedRover === rover
                      ? "bg-[var(--color-primary)] text-black"
                      : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {roverInfo[rover].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-20 text-center text-[var(--color-text-muted)]">
            <div className="col-span-full">
              <RefreshCw className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
              <p>Recebendo sinal e decodificando imagens brutas de Marte...</p>
            </div>
          </div>
        ) : photos.length === 0 ? (
          <Card className="py-20 text-center bg-white/5 border border-white/10">
            <ImageIcon className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 animate-pulse" />
            <p className="text-[var(--color-text-muted)]">Nenhuma foto recente disponível para este Rover.</p>
            <Button size="sm" variant="ghost" onClick={fetchRoverPhotos} className="mt-4">
              Recarregar Fotos
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {photos.slice(0, 12).map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-[var(--color-primary)]/40 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-black overflow-hidden cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                  <img 
                    alt={`Mars rover photo ${photo.id}`}
                    src={photo.img_src}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="bg-[var(--color-primary)]/90 text-black px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                      Visualizar
                    </span>
                  </div>
                  <Badge variant="primary" className="absolute top-2 left-2 backdrop-blur-md bg-black/60">
                    Sol {photo.sol}
                  </Badge>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-white truncate">{photo.camera.full_name}</h4>
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mt-1.5 font-mono">
                      <span>{new Date(photo.earth_date).toLocaleDateString("pt-BR")}</span>
                      <span>Rover: {photo.rover.name}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-white/5 pt-3 mt-3">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleSaveFavorite(photo)}
                      disabled={savingId === photo.id}
                      className="flex-1 border border-white/10"
                    >
                      {savingId === photo.id ? (
                        "Salvando..."
                      ) : savedSuccess === photo.id ? (
                        "Salvo ✓"
                      ) : (
                        "Salvar Favorito"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl w-full mx-4 bg-space-black/95 border border-white/15 rounded-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white text-2xl font-bold bg-white/5 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-[var(--color-primary)]" />
              <h4 className="text-xl font-bold text-white">Marte — Câmera {selectedPhoto.camera.name}</h4>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center mb-4 border border-white/10">
              <img 
                src={selectedPhoto.img_src}
                alt="Mars Surface high-res"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="primary" className="py-1 px-3">Sol Marciano: {selectedPhoto.sol}</Badge>
                <span className="text-sm text-[var(--color-text-muted)] font-medium">{selectedPhoto.camera.full_name}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 text-sm">
                <div>
                  <p className="text-[var(--color-text-muted)] text-xs">Rover Explorador</p>
                  <p className="text-white font-semibold mt-0.5 capitalize">{selectedPhoto.rover.name}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] text-xs">Data da Captura (Terra)</p>
                  <p className="text-white font-semibold mt-0.5">{new Date(selectedPhoto.earth_date).toLocaleDateString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] text-xs">Status do Robô</p>
                  <p className="text-white font-semibold mt-0.5 capitalize">{selectedPhoto.rover.status}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] text-xs">Data de Pouso em Marte</p>
                  <p className="text-white font-semibold mt-0.5">{selectedPhoto.rover.landing_date}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-white/5 pt-4">
                <Button variant="ghost" onClick={() => setSelectedPhoto(null)}>
                  Fechar
                </Button>
                <Button variant="primary" onClick={() => handleSaveFavorite(selectedPhoto)}>
                  Salvar nos Favoritos
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
