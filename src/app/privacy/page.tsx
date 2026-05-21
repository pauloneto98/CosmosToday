import Link from "next/link";
import { Orbit, ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#030712] text-gray-300 overflow-y-auto py-16 px-4">
      {/* Background Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl">
              <Orbit className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              Cosmos<span className="text-cyan-400">Daily</span>
            </span>
          </div>
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>

        {/* Document Body */}
        <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white font-display">Política de Privacidade</h1>
          </div>
          <p className="text-sm text-gray-400">Em total conformidade com a Lei Geral de Proteção de Dados (LGPD) • Atualizado em: 20 de maio de 2026</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Informações que Coletamos</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Coletamos apenas os dados essenciais para o funcionamento seguro da plataforma:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
              <li>Nome e e-mail (fornecidos pelo Clerk durante a autenticação).</li>
              <li>Histórico de buscas e itens marcados como favoritos na sua galeria pessoal.</li>
              <li>Dados cadastrais de faturamento (gerenciados com exclusividade e criptografia pelo Stripe).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Finalidade dos Dados</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Seus dados pessoais são utilizados unicamente para identificar sua conta, registrar seus favoritos, habilitar o acesso seguro ao Dashboard e processar sua assinatura de planos recorrentes. Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins publicitários.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Seus Direitos (LGPD)</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Como titular dos dados de acordo com a LGPD brasileira, você tem total controle e direito a:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
              <li>Confirmar a existência do tratamento de seus dados.</li>
              <li>Acessar seus dados pessoais gratuitamente a qualquer momento.</li>
              <li><strong>Direito ao Esquecimento (Exclusão):</strong> Solicitar a remoção permanente e integral de todos os seus dados coletados diretamente no menu de Configurações da plataforma.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Cookies de Navegação</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Utilizamos cookies estritamente necessários para manter a sua sessão de usuário ativa e lembrar suas preferências de consentimento legal. Você pode optar por recusar cookies não essenciais por meio do nosso banner de consentimento.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Segurança dos Dados</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Aplicamos as melhores medidas de segurança da informação (como criptografia HTTPS, autenticação multifator Clerk e tokens JWT) para assegurar que seus dados cósmicos estejam completamente blindados de acessos não autorizados.
            </p>
          </section>
        </div>

        <div className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} CosmosDaily. Todos os direitos reservados.
        </div>
      </div>
    </main>
  );
}
