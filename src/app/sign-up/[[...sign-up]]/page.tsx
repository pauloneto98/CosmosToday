import { SignUp } from "@clerk/nextjs";
import { Orbit } from "lucide-react";

export default function SignUpPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#030712] flex items-center justify-center overflow-hidden py-12 px-4">
      {/* Efeitos Cósmicos de Fundo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Estrelas Fictícias de Fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">
        {/* Logotipo CosmosDaily */}
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Orbit className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-display">
            Cosmos<span className="text-cyan-400">Daily</span>
          </span>
        </div>

        {/* Container Glassmorphic */}
        <div className="glass p-1 border border-white/10 rounded-2xl shadow-2xl relative group overflow-hidden">
          <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none" />
          <div className="relative bg-[#090d16]/90 rounded-[15px]">
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "shadow-none bg-transparent border-0",
                  card: "bg-transparent border-0 shadow-none p-6",
                  headerTitle: "text-white font-display text-xl font-bold",
                  headerSubtitle: "text-gray-400 text-sm",
                  socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors",
                  socialButtonsBlockButtonText: "text-white font-medium",
                  dividerLine: "bg-white/10",
                  dividerText: "text-gray-400 text-xs",
                  formFieldLabel: "text-gray-300 text-xs font-semibold uppercase tracking-wider",
                  formFieldInput: "bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all",
                  formButtonPrimary: "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-2.5 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all border-0",
                  footerActionText: "text-gray-400 text-xs",
                  footerActionLink: "text-cyan-400 hover:text-cyan-300 font-semibold hover:underline",
                  identityPreviewText: "text-white",
                  userButtonPopoverActionButtonText: "text-white"
                }
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
