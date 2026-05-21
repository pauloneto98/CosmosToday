"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { getAPOD, mockAPOD, type APOD } from "@/lib/nasa/apod";
import { Calendar, Share2, Download, ExternalLink, Play } from "lucide-react";

export function APODWidget() {
  const [apod, setApod] = useState<APOD | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    fetchAPOD();
  }, []);

  const fetchAPOD = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAPOD();
      setApod(data);
      setUseMock(false);
    } catch (err) {
      setApod(mockAPOD);
      setUseMock(true);
      setError("Usando dados de demonstração");
    } finally {
      setLoading(false);
    }
  };

  if (!apod && loading) {
    return (
      <Card className="col-span-2 row-span-2">
        <Skeleton variant="rectangular" height={300} className="w-full mb-4" />
        <Skeleton variant="text" height={28} className="w-3/4 mb-2" />
        <Skeleton variant="text" height={16} className="w-full mb-1" />
        <Skeleton variant="text" height={16} className="w-2/3" />
      </Card>
    );
  }

  if (!apod) {
    return (
      <Card className="col-span-2 row-span-2 flex items-center justify-center">
        <Button onClick={fetchAPOD}>Carregar APOD</Button>
      </Card>
    );
  }

  const isVideo = apod.media_type === "video";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="col-span-2 row-span-2 overflow-hidden">
          <div className="relative mb-4">
            {useMock && (
              <Badge variant="warning" className="absolute top-2 left-2 z-10">
                Demo Mode
              </Badge>
            )}
            
            {isVideo ? (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={apod.url}
                  className="w-full h-full"
                  allowFullScreen
                  title={apod.title}
                />
              </div>
            ) : (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                <img
                  src={apod.hdurl || apod.url}
                  alt={apod.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="primary">
                <Calendar className="w-3 h-3 mr-1" />
                {apod.date}
              </Badge>
              {apod.copyright && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  © {apod.copyright}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-[var(--color-text)]">
              {apod.title}
            </h3>

            <p className={`text-sm text-[var(--color-text-muted)] ${expanded ? "" : "line-clamp-3"}`}>
              {apod.explanation}
            </p>

            {apod.explanation.length > 200 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                {expanded ? "Ver menos" : "Ler mais"}
              </button>
            )}

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={fetchAPOD}>
                <Download className="w-4 h-4 mr-1" />
                Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowModal(true)}>
                <Share2 className="w-4 h-4 mr-1" />
                Compartilhar
              </Button>
              {isVideo && (
                <a
                  href={apod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir
                </a>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Compartilhar" size="sm">
        <div className="space-y-4">
          <p className="text-[var(--color-text-muted)]">Compartilhe esta foto astronomica:</p>
          <input
            type="text"
            readOnly
            value={window.location.href}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--color-text)]"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="flex-1">
              Copiar Link
            </Button>
            <Button size="sm" variant="primary" className="flex-1">
              Twitter
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}