"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Settings, Bell, Shield, Globe, Moon, Sun, User, CreditCard, Key, AlertOctagon, Trash2, Check, Sparkles } from "lucide-react";
import { getUserSubscription, cancelUserSubscription } from "@/app/actions/user";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("pt-BR");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [plan, setPlan] = useState("Carregando...");
  const [planType, setPlanType] = useState<string>("demo");
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = () => {
    getUserSubscription().then((res) => {
      if (res.success) {
        setPlanType(res.planType);
        if (res.planType === "explorer") {
          setPlan("Explorer — R$ 5,00/mês");
        } else if (res.planType === "family") {
          setPlan("Cosmos VIP — R$ 10,00/mês");
        } else {
          setPlan("Demo Gratuita (Acesso Limitado)");
        }
      } else {
        setPlan("Demo Gratuita (Acesso Limitado)");
        setPlanType("demo");
      }
    });
  };

  const handleCheckout = async (targetPlan: "explorer" | "family") => {
    setLoadingCheckout(targetPlan);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: targetPlan }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        alert("Erro ao iniciar a sessão de pagamento.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de rede ao processar transação.");
    } finally {
      setLoadingCheckout(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Tem certeza que deseja cancelar sua assinatura e retornar para o plano Demo Limitado?")) {
      return;
    }
    setPlan("Cancelando...");
    const res = await cancelUserSubscription();
    if (res.success) {
      loadSubscription();
      alert("Assinatura cancelada com sucesso!");
    } else {
      alert("Erro ao cancelar assinatura.");
      loadSubscription();
    }
  };

  const notifications = [
    { id: "apod", label: "Foto do dia", enabled: true },
    { id: "asteroid", label: "Asteroides próximos", enabled: true },
    { id: "solar", label: "Tempestades solares", enabled: false },
    { id: "launch", label: "Lançamentos", enabled: true },
    { id: "iss", label: "Passagem da ISS", enabled: false },
  ];

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        // Redireciona e faz logout limpo
        await signOut();
        window.location.href = "/?deleted=true";
      } else {
        alert("Falha ao excluir a conta. Tente novamente mais tarde.");
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro de rede ao solicitar exclusão.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text)]">
          Configurações
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Personalize sua experiência no CosmosDaily e gerencie seus dados de privacidade
        </p>
      </div>

      {/* CARD: PERFIL (Clerk integrado) */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Perfil</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <p className="text-[var(--color-text)] font-medium">
                {isLoaded && user ? user.fullName : "Carregando..."}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {isLoaded && user ? user.primaryEmailAddress?.emailAddress : "Carregando..."}
              </p>
            </div>
            {isLoaded && user ? (
              <Badge variant="primary" pulse>Conectado</Badge>
            ) : (
              <Badge variant="warning">Verificando...</Badge>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Seu perfil é autenticado com segurança pela Clerk. Use o menu de usuário no canto superior para editar suas preferências de conta e segurança.
          </p>
        </div>
      </Card>

      {/* CARD: ASSINATURA (Dinâmico e Ornato) */}
      <Card className="relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Assinatura</h2>
        </div>
        
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Plano Ativo</p>
              <p className="text-lg font-bold text-[var(--color-primary)] mt-1 flex items-center gap-2">
                {plan}
                {planType !== "demo" && <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />}
              </p>
            </div>
            {planType !== "demo" && (
              <Badge variant="accent" pulse>Premium Ativo</Badge>
            )}
          </div>
        </div>

        {planType === "demo" ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] mb-3">Escolha um Plano e Desbloqueie Todos os Recursos:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* PLANO EXPLORER */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl relative hover:border-[var(--color-primary)]/30 transition-colors flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-[var(--color-text)] text-sm flex items-center justify-between">
                      Explorer
                      <span className="text-[var(--color-primary)] font-extrabold">R$ 5/mês</span>
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
                      Perfeito para entusiastas que buscam acesso completo a imagens espaciais da NASA em HD e dados de Marte.
                    </p>
                    <ul className="text-[10px] text-[var(--color-text-muted)] space-y-1.5 mt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[var(--color-primary)]" /> Imagens HD ilimitadas</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[var(--color-primary)]" /> Alertas de asteroides em tempo real</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[var(--color-primary)]" /> ISS Tracker Completo</li>
                    </ul>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-4 bg-[var(--color-primary)] text-black font-semibold hover:opacity-90"
                    disabled={loadingCheckout !== null}
                    onClick={() => handleCheckout("explorer")}
                  >
                    {loadingCheckout === "explorer" ? "Processando..." : "Assinar Explorer"}
                  </Button>
                </div>

                {/* PLANO COSMOS VIP */}
                <div className="p-4 bg-gradient-to-b from-[var(--color-accent)]/[0.04] to-transparent border border-white/10 rounded-xl relative hover:border-[var(--color-accent)]/30 transition-colors flex flex-col justify-between">
                  <div className="absolute top-2 right-2">
                    <Badge variant="accent" className="text-[8px] px-1.5 py-0.5">VIP</Badge>
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-text)] text-sm flex items-center justify-between">
                      Cosmos VIP
                      <span className="text-[var(--color-accent)] font-extrabold">R$ 10/mês</span>
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
                      Acesso científico supremo. Unlocks satélites, live ISS oficial, Kp index em tempo real e chave de API pessoal.
                    </p>
                    <ul className="text-[10px] text-[var(--color-text-muted)] space-y-1.5 mt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[var(--color-accent)]" /> Mapa de Satélites 2D/3D</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[var(--color-accent)]" /> Live da ISS integrada no painel</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[var(--color-accent)]" /> Clima solar NOAA e índices Kp</li>
                    </ul>
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="w-full mt-4 bg-[var(--color-accent)] text-white font-semibold hover:opacity-90"
                    disabled={loadingCheckout !== null}
                    onClick={() => handleCheckout("family")}
                  >
                    {loadingCheckout === "family" ? "Processando..." : "Assinar Cosmos VIP"}
                  </Button>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-[var(--color-text-muted)]">
              Sua assinatura está ativa e sendo orquestrada com segurança pelo Stripe.
            </p>
            <Button variant="danger" size="sm" onClick={handleCancel}>
              Cancelar Assinatura
            </Button>
          </div>
        )}
      </Card>

      {/* CARD: NOTIFICAÇÕES */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Notificações</h2>
        </div>
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div key={notif.id} className="flex items-center justify-between py-2">
              <span className="text-[var(--color-text)]">{notif.label}</span>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  notif.enabled ? "bg-[var(--color-primary)]" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    notif.enabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* CARD: IDIOMA E TEMA */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Idioma e Aparência</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-[var(--color-text)]">Idioma</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[var(--color-text)]">Tema</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5"
            >
              {darkMode ? (
                <Moon className="w-4 h-4 text-[var(--color-primary)]" />
              ) : (
                <Sun className="w-4 h-4 text-[var(--color-secondary)]" />
              )}
              <span className="text-sm text-[var(--color-text)]">
                {darkMode ? "Escuro" : "Claro"}
              </span>
            </button>
          </div>
        </div>
      </Card>

      {/* CARD: LGPD & ÁREA DE RISCO (DANGER ZONE) */}
      <Card className="border border-red-500/20 bg-red-500/[0.02] shadow-[0_0_15px_rgba(239,68,68,0.05)]">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-red-500 animate-pulse" />
          <h2 className="text-lg font-semibold text-red-400">Privacidade & LGPD</h2>
        </div>
        <div className="space-y-4">
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 flex gap-3">
            <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-200/80 leading-relaxed">
              <strong>Direito à Exclusão (Esquecimento):</strong> Ao excluir sua conta, todos os seus dados coletados e armazenados (incluindo imagens favoritas na galeria, histórico de buscas e planos de assinatura associados) serão destruídos de forma definitiva do banco de dados local e dos registros do Clerk. Esta operação é irreversível.
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Destruir minha conta</p>
              <p className="text-xs text-[var(--color-text-muted)]">Excluir e apagar todos os meus dados definitivamente.</p>
            </div>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Excluir Conta
            </Button>
          </div>
        </div>
      </Card>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => !isDeleting && setShowDeleteModal(false)} 
        title="Confirmar Exclusão Definitiva"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            Você tem certeza absoluta de que deseja excluir sua conta e remover permanentemente todos os seus dados de nossos servidores? Esta ação é imediata e irreversível.
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              size="sm" 
              variant="danger" 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500"
            >
              {isDeleting ? "Excluindo..." : "Sim, Excluir Tudo"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}