"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Users, 
  Database, 
  ShieldAlert, 
  Trash2, 
  UserX, 
  UserCheck, 
  Activity, 
  KeyRound, 
  CreditCard 
} from "lucide-react";
import { 
  getAdminUsers, 
  updateAdminUserRole, 
  deleteAdminUserAccount, 
  getAdminMetrics,
  becomeAdmin
} from "@/app/actions/admin";

interface DBUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

export default function AdminPage() {
  const router = useRouter();
  const [usersList, setUsersList] = useState<DBUser[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalFavorites: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<"connected" | "disconnected">("connected");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleBecomeAdmin = async () => {
    setIsUpgrading(true);
    try {
      const res = await becomeAdmin();
      if (res.success) {
        alert("🛡️ Sucesso! Você agora é um Administrador. Carregando dados...");
        setError(null);
        await loadData();
      } else {
        alert(res.error || "Falha ao tornar-se admin.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dbUsers = await getAdminUsers();
      if (!dbUsers || (dbUsers as any).error) {
        setError((dbUsers as any).error || "Acesso negado. Apenas administradores podem ver este painel.");
        setDbStatus("disconnected");
        setLoading(false);
        return;
      }
      setUsersList(dbUsers as any);

      const dbMetrics = await getAdminMetrics();
      setMetrics(dbMetrics);
      setDbStatus("connected");
    } catch (err: any) {
      setError(err.message || "Erro de permissão ou conexão.");
      setDbStatus("disconnected");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setActionInProgress(targetId);
    try {
      const res = await updateAdminUserRole(targetId, newRole);
      if (res.success) {
        setUsersList(prev => prev.map(u => u.id === targetId ? { ...u, role: newRole } : u));
      } else {
        alert(res.error || "Falha ao alterar papel.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteUser = async (targetId: string) => {
    if (!confirm("Tem certeza de que deseja deletar permanentemente este usuário da sua conta Clerk e do Supabase? Esta ação não pode ser desfeita e respeita a LGPD.")) {
      return;
    }
    setActionInProgress(targetId);
    try {
      const res = await deleteAdminUserAccount(targetId);
      if (res.success) {
        setUsersList(prev => prev.filter(u => u.id !== targetId));
        setMetrics(m => ({ ...m, totalUsers: m.totalUsers - 1 }));
      } else {
        alert(res.error || "Falha ao deletar conta.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Activity className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
        <p className="text-[var(--color-text-muted)] animate-pulse">Carregando painel de controle seguro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-20">
        <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5 p-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-500/[0.02] blur-xl pointer-events-none" />
          
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-black text-white mb-2 font-[family-name:var(--font-display)]">Acesso Restrito ao Desenvolvedor</h2>
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">
            O painel administrativo é altamente seguro. Detectamos que seu usuário atual não possui a função de <strong>admin</strong> no banco de dados Supabase.
          </p>

          <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-left mb-6 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">🔬 Ambiente de Testes & Desenvolvimento</h4>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Você pode conceder privilégios de administrador à sua própria conta de teste com um único clique abaixo para homologar o painel completo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleBecomeAdmin} 
              disabled={isUpgrading}
              variant="primary" 
              className="bg-gradient-to-r from-red-600 to-orange-600 border-none font-bold text-white px-6 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
            >
              {isUpgrading ? "Promovendo..." : "Tornar-se Administrador"}
            </Button>
            <Button onClick={() => router.push("/dashboard")} variant="ghost" className="border border-white/10">
              Voltar ao Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-[var(--color-primary)]" />
            Painel Administrativo
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Controle de acesso, segurança robusta e monitoramento em tempo real do banco de dados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={dbStatus === "connected" ? "primary" : "danger"} className="py-1 px-3">
            <Database className="w-3.5 h-3.5 mr-1.5" />
            Supabase: {dbStatus === "connected" ? "Conectado" : "Offline"}
          </Badge>
          <Button size="sm" variant="ghost" onClick={loadData}>
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center justify-between bg-white/5 border border-white/10 hover:border-[var(--color-primary)]/20 transition-all">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Usuários Registrados</p>
            <p className="text-2xl font-bold text-white mt-1 font-mono">{metrics.totalUsers}</p>
          </div>
          <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center text-[var(--color-primary)]">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white/5 border border-white/10 hover:border-[var(--color-primary)]/20 transition-all">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Planos Ativos</p>
            <p className="text-2xl font-bold text-white mt-1 font-mono">{metrics.activeSubscriptions}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white/5 border border-white/10 hover:border-[var(--color-primary)]/20 transition-all">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Itens Salvos (Favoritos)</p>
            <p className="text-2xl font-bold text-white mt-1 font-mono">{metrics.totalFavorites}</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
            <Database className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white/5 border border-white/10 hover:border-[var(--color-primary)]/20 transition-all">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Total Assinantes (Stripe)</p>
            <p className="text-2xl font-bold text-white mt-1 font-mono">{metrics.totalSubscriptions}</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Users Directory Table */}
      <Card className="overflow-hidden bg-white/5 border border-white/10">
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-semibold text-lg text-white">Diretório de Usuários no Supabase</h3>
          <Badge variant="primary" className="font-mono">LGPD Compliance Active</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--color-text-muted)] border-collapse">
            <thead className="bg-white/5 text-xs text-white uppercase font-semibold">
              <tr>
                <th className="p-4 border-b border-white/10">Usuário</th>
                <th className="p-4 border-b border-white/10">Email</th>
                <th className="p-4 border-b border-white/10">ID (Clerk)</th>
                <th className="p-4 border-b border-white/10">Papel</th>
                <th className="p-4 border-b border-white/10">Criado em</th>
                <th className="p-4 border-b border-white/10 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usersList.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-xs font-bold font-mono">
                      {(user.name || user.email).substring(0, 2).toUpperCase()}
                    </div>
                    {user.name || "Sem Nome"}
                  </td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 font-mono text-xs text-white/50">{user.id}</td>
                  <td className="p-4">
                    <Badge variant={user.role === "admin" ? "warning" : "default"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4">{new Date(user.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRoleChange(user.id, user.role)}
                        disabled={actionInProgress === user.id}
                        className="text-[var(--color-primary)] hover:text-white"
                      >
                        {user.role === "admin" ? (
                          <span className="flex items-center gap-1">
                            <UserX className="w-3.5 h-3.5" /> Rebaixar
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" /> Tornar Admin
                          </span>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={actionInProgress === user.id}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
