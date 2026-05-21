"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cosmosdaily_cookie_consent");
    if (!consent) {
      // Abre o banner após 1.5s para não atrapalhar o primeiro render visual
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cosmosdaily_cookie_consent", "accepted");
    setIsOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cosmosdaily_cookie_consent", "declined");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 p-5 glass border border-white/10 rounded-xl shadow-2xl flex flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)] flex-shrink-0">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">
                Privacidade & LGPD
              </h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                Nós usamos cookies para melhorar sua experiência espacial. Ao aceitar, você concorda com nossa coleta de dados para fins de autenticação segura e planos de assinatura, de acordo com a LGPD.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDecline}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              Recusar
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleAccept}
              className="text-xs bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]/80 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              Aceitar Termos
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
