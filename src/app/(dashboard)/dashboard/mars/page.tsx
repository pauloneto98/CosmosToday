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
  RefreshCw,
  Sparkles,
  Lock,
  Globe,
  ArrowRight,
  Eye,
  Info
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
    <div className="space-y-8 relative overflow-hidden pb-12">
      {/* Background Orbit lines to theme the page */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Orbital Circles */}
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] border border-red-500/10 rounded-full animate-[spin_120s_linear_infinite]" />
        <div className="absolute -top-[5%] -right-[5%] w-[350px] h-[350px] border border-dashed border-orange-500/10 rounded-full animate-[spin_80s_linear_infinite]" />
        {/* Glowing planetary blur representing Mars dust */}
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] bg-orange-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header section themed in deep orange/rust */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest font-mono">Planetary Mission</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 font-[family-name:var(--font-display)]">
            <Globe className="w-9 h-9 text-orange-500 animate-spin" style={{ animationDuration: "30s" }} />
            Exploração de Marte & Câmeras Rover
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm max-w-2xl leading-relaxed">
            Navegue pelos desertos ferruginosos e cânions do Planeta Vermelho através da telemetria e imagens científicas reais enviadas pelos robôs exploradores da NASA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="accent" className="bg-red-500/10 text-red-400 border border-red-500/20 py-1.5 px-3 uppercase tracking-wider text-[10px] font-bold">
            Mars Rover Active Feed
          </Badge>
          <div className="flex items-center justify-center w-3 h-3 rounded-full bg-red-500/20">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* Hero planetary Banner with Premium Ornate styling */}
      <section className="relative z-10 w-full h-[360px] rounded-2xl overflow-hidden border border-red-500/20 flex flex-col justify-end p-8 group shadow-[0_0_30px_rgba(239,68,68,0.1)]">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Cinematic view of Mars surface" 
            className="w-full h-full object-cover object-center opacity-65 transition-transform duration-[6000ms] ease-out group-hover:scale-110"
            src="https://images.unsplash.com/photo-1612892483236-42d68a57623d?q=80&w=1200&auto=format&fit=crop"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000008] via-transparent to-transparent" />
          {/* Ornate glowing frame around the hero */}
          <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-red-500/50" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-red-500/50" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-red-500/50" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-red-500/50" />
        </div>
        
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full text-red-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Planeta Vermelho no Radar</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white font-[family-name:var(--font-display)] leading-none tracking-tight">
            Fronteira Marciana
          </h2>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            Consulte dados climáticos diários e explore as galerias científicas de Mastcam, Navcam e Hazcam capturadas diretamente do solo marciano.
          </p>
        </div>
      </section>

      {/* Grid: Telemetry & Specs with custom Mars glow borders */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gale Crater Climate Card */}
        <Card className="relative overflow-hidden p-6 border border-red-500/10 bg-[#0A0A1A]/80 backdrop-blur-xl group hover:border-red-500/30 transition-colors flex flex-col justify-between h-full">
          {/* Inner Glow decorative indicator */}
          <div className="absolute -top-1.5 -left-1.5 w-12 h-12 bg-red-500/20 blur-md rounded-full pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-red-400/80 font-bold tracking-widest uppercase font-mono">Cratera Gale</span>
                <h3 className="text-lg font-bold text-white mt-1">Clima Atmosférico</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-red-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-mono">Temp Máx / Mín</p>
                <p className="text-xl font-bold text-red-400 font-mono mt-1">-5° <span className="text-xs text-white/50">/ -80°C</span></p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-mono">Pressão do Sol</p>
                <p className="text-xl font-bold text-white font-mono mt-1">715 Pa</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 flex items-center justify-between text-xs">
              <div>
                <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-mono">Ventos de Superfície</p>
                <p className="font-semibold text-white mt-0.5">14.2 m/s NE</p>
              </div>
              <Wind className="w-4 h-4 text-orange-400" />
            </div>
          </div>
        </Card>

        {/* Mars Specs Card */}
        <Card className="relative overflow-hidden p-6 border border-orange-500/10 bg-[#0A0A1A]/80 backdrop-blur-xl group hover:border-orange-500/30 transition-colors flex flex-col justify-between h-full">
          <div className="absolute -top-1.5 -left-1.5 w-12 h-12 bg-orange-500/20 blur-md rounded-full pointer-events-none" />

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-orange-400/80 font-bold tracking-widest uppercase font-mono">Física Planetária</span>
                <h3 className="text-lg font-bold text-white mt-1">Dados de Rotação</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-orange-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-mono">Gravidade</p>
                <p className="text-xl font-bold text-white font-mono mt-1">3.71 m/s²</p>
                <p className="text-[8px] text-[var(--color-text-muted)] mt-0.5">(37.9% da Terra)</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-mono">Dia Solar (Sol)</p>
                <p className="text-xl font-bold text-white font-mono mt-1">24h 37m</p>
                <p className="text-[8px] text-[var(--color-text-muted)] mt-0.5">(+39 min vs Terra)</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs text-[var(--color-text-muted)] font-mono">
              <span>Distância Média: 227.9M km</span>
              <span>Órbita: 687 dias</span>
            </div>
          </div>
        </Card>

        {/* Selected Rover Info Card */}
        <Card className="relative overflow-hidden p-6 border border-amber-500/10 bg-[#0A0A1A]/80 backdrop-blur-xl group hover:border-amber-500/30 transition-colors flex flex-col justify-between h-full">
          <div className="absolute -top-1.5 -left-1.5 w-12 h-12 bg-amber-500/20 blur-md rounded-full pointer-events-none" />

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-amber-400/80 font-bold tracking-widest uppercase font-mono">Explorador Atual</span>
                <h3 className="text-lg font-bold text-white mt-1 capitalize">Rover {roverInfo[selectedRover].name}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div className="space-y-2.5 text-sm bg-white/[0.01] border border-white/5 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)] text-xs">Lançamento:</span>
                <span className="text-white font-mono text-xs">{roverInfo[selectedRover].launched}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)] text-xs">Status da Missão:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  roverInfo[selectedRover].status === "active" 
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                    : "bg-gray-500/15 text-gray-400 border border-gray-500/20"
                }`}>
                  {roverInfo[selectedRover].status === "active" ? "Ativo" : "Concluído"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)] text-xs">Câmeras Ativas:</span>
                <span className="text-amber-400 font-mono text-[10px] truncate max-w-[120px]" title={roverInfo[selectedRover].cameras.join(", ")}>
                  {roverInfo[selectedRover].cameras.join(", ")}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Photo Galleries */}
      <section className="relative z-10 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-white/5 pb-5">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white font-[family-name:var(--font-display)] flex items-center gap-2">
              <Camera className="w-6 h-6 text-red-400" />
              Transmissão Científica Recente
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Pesquise nas pastas de armazenamento de telemetria crua capturada na superfície marciana.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-wider">Selecionar Robô:</span>
            <div className="flex flex-wrap bg-white/5 border border-white/5 p-1 rounded-xl">
              {rovers.map((rover) => {
                const isSelected = selectedRover === rover;
                return (
                  <button
                    key={rover}
                    onClick={() => setSelectedRover(rover)}
                    className={`relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                        : "text-[var(--color-text-muted)] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {roverInfo[rover].name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rover gallery content */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-[var(--color-text-muted)] font-mono text-sm animate-pulse">
              Decodificando transmissões digitais do Rover {roverInfo[selectedRover].name} via NASA Deep Space Network...
            </p>
          </div>
        ) : photos.length === 0 ? (
          <Card className="py-20 text-center bg-[#0A0A1A]/80 border border-white/5 backdrop-blur-xl">
            <ImageIcon className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--color-text-muted)] text-sm">Sem fotos de telemetria disponíveis nas últimas 24h terrestres.</p>
            <Button size="sm" variant="ghost" onClick={fetchRoverPhotos} className="mt-4 border border-white/10 hover:border-red-500/30">
              Recarregar Fotos
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.slice(0, 12).map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.01] hover:border-red-500/20 transition-all flex flex-col justify-between shadow-lg"
              >
                {/* Visualizer Image container with sharp gradient borders */}
                <div 
                  className="relative aspect-[4/3] bg-[#05050A] overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img 
                    alt={`Telemetry frame ${photo.id}`}
                    src={photo.img_src}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-black bg-gradient-to-r from-red-500 to-orange-500 py-1.5 px-3 rounded-md shadow">
                      <Eye className="w-3.5 h-3.5" /> Analisar Frame
                    </span>
                  </div>
                  <Badge variant="primary" className="absolute top-3 left-3 bg-black/60 border border-white/10 backdrop-blur-md font-mono text-[9px] tracking-wider py-0.5">
                    Sol Marciano {photo.sol}
                  </Badge>
                </div>

                {/* Card footer description */}
                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#0A0A1A]/20 to-[#0A0A1A]/80 border-t border-white/5">
                  <div className="space-y-1">
                    <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest font-mono">Câmera</span>
                    <h4 className="font-bold text-white text-xs truncate max-w-[200px]" title={photo.camera.full_name}>
                      {photo.camera.full_name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono pt-1">
                      <span>{new Date(photo.earth_date).toLocaleDateString("pt-BR")}</span>
                      <span className="capitalize">Rover: {photo.rover.name}</span>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleSaveFavorite(photo)}
                    disabled={savingId === photo.id}
                    className="w-full border border-white/5 hover:border-red-500/30 text-xs font-semibold py-2"
                  >
                    {savingId === photo.id ? (
                      "Persistindo..."
                    ) : savedSuccess === photo.id ? (
                      "Adicionado ✓"
                    ) : (
                      "Adicionar aos Favoritos"
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Mars Photo modal visualizer */}
      <AnimatePresence>
        {selectedPhoto && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl w-full mx-4 bg-[#0A0A1F]/95 border border-red-500/20 rounded-3xl p-6 relative shadow-[0_0_50px_rgba(239,68,68,0.2)]" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white text-2xl font-bold bg-white/5 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-6 h-6 text-red-500 animate-pulse" />
                <h4 className="text-xl font-bold text-white font-[family-name:var(--font-display)]">Boletim Científico de Marte</h4>
              </div>

              {/* Big High-res image display with custom borders */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center mb-6 border border-white/10 shadow-inner group">
                <img 
                  src={selectedPhoto.img_src}
                  alt="High resolution Mars telemetric frame"
                  className="max-h-full max-w-full object-contain"
                />
                {/* Decorative border corners */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/40" />
                <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/40" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/40" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/40" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="bg-red-500/15 text-red-400 border border-red-500/30 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider">
                    Sol Marciano: {selectedPhoto.sol}
                  </Badge>
                  <span className="text-sm font-semibold text-white/90">{selectedPhoto.camera.full_name}</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-xs font-mono text-[var(--color-text-muted)]">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider">Robô Explorador</p>
                    <p className="text-white font-bold mt-1 capitalize">{selectedPhoto.rover.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider">Data da Captura (Terra)</p>
                    <p className="text-white font-bold mt-1">{new Date(selectedPhoto.earth_date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider">Status da Missão</p>
                    <p className="text-white font-bold mt-1 capitalize">{selectedPhoto.rover.status}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider">Pouso Planetário</p>
                    <p className="text-white font-bold mt-1">{selectedPhoto.rover.landing_date}</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end border-t border-white/5 pt-4 mt-6">
                  <Button variant="ghost" onClick={() => setSelectedPhoto(null)}>
                    Fechar Relatório
                  </Button>
                  <Button variant="primary" onClick={() => handleSaveFavorite(selectedPhoto)} className="bg-gradient-to-r from-red-600 to-orange-600 border-none shadow-[0_0_15px_rgba(239,68,68,0.3)] font-bold text-white">
                    Adicionar aos Favoritos
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
