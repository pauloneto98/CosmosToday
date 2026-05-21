import Link from "next/link";
import { Orbit, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-white font-display">Termos de Uso</h1>
          <p className="text-sm text-gray-400">Última atualização: 20 de maio de 2026</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Aceitação dos Termos</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Ao acessar e utilizar o CosmosDaily, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve acessar o serviço.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Uso do Serviço</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Nosso serviço fornece dados e imagens em tempo real utilizando as APIs abertas da NASA. O uso destas informações é destinado a fins educacionais, pessoais e de desenvolvimento de projetos, respeitando as políticas da NASA.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Cadastro e Segurança</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Para acessar os recursos do Dashboard, o usuário deve se cadastrar via Clerk. Você é inteiramente responsável por manter o sigilo de suas informações de acesso e por todas as atividades que ocorrerem em sua conta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Planos e Assinaturas (Stripe)</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              As assinaturas pagas do CosmosDaily são processadas de forma segura e criptografada via Stripe. O faturamento é recorrente e você pode cancelar sua assinatura a qualquer momento na aba de Configurações do seu painel de controle.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Propriedade Intelectual</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              As mídias apresentadas no aplicativo (como as fotos da Foto Astronômica do Dia APOD) são de propriedade de seus respectivos criadores e da NASA. Respeitamos todos os direitos autorais e copyright atribuídos na plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">6. Alterações nos Termos</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Reservamos o direito de modificar estes Termos de Uso a qualquer momento. Modificações entrarão em vigor imediatamente após sua publicação no site. Seu uso continuado da plataforma constitui aceitação dos novos termos.
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
