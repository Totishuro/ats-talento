export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A] flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto text-center">
        {/* Logo and Branding */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/logo.png" alt="Talento Logo" className="w-16 h-16 rounded-2xl" />
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              ATS Talento
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-[#38BDF8] font-semibold mb-4">
            Sistema de Recrutamento e Seleção
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Conectamos empresas aos melhores talentos através de um processo seletivo inteligente e eficiente
          </p>
        </div>

        {/* Value Proposition */}
        <div className="mb-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Como Funciona</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">👤</span>
                <h3 className="text-xl font-bold text-[#38BDF8]">Para Candidatos</h3>
              </div>
              <ul className="space-y-2 text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-[#38BDF8] mt-1">✓</span>
                  <span>Cadastre seu currículo em nosso banco de talentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#38BDF8] mt-1">✓</span>
                  <span>Seja considerado para múltiplas oportunidades automaticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#38BDF8] mt-1">✓</span>
                  <span>Receba contato quando seu perfil combinar com vagas disponíveis</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🏢</span>
                <h3 className="text-xl font-bold text-[#38BDF8]">Para Empresas</h3>
              </div>
              <ul className="space-y-2 text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-[#38BDF8] mt-1">✓</span>
                  <span>Gerencie todo o processo seletivo em uma única plataforma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#38BDF8] mt-1">✓</span>
                  <span>Visualize candidatos em um Kanban intuitivo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#38BDF8] mt-1">✓</span>
                  <span>Automatize comunicações e evite erros no processo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {/* Candidate Button */}
          <a
            href="/candidatar"
            className="group bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#38BDF8] text-white p-10 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-[#38BDF8]/50"
          >
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-3">Cadastre seu Currículo</h2>
            <p className="text-white/90 mb-4">
              Faça parte do nosso banco de talentos e seja considerado para oportunidades incríveis
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-bold">
              <span>Começar agora</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </a>

          {/* Admin Button */}
          <a
            href="/admin"
            className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white hover:border-white text-white hover:text-[#0F172A] p-10 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold mb-3">Acesso Admin</h2>
            <p className="opacity-90 group-hover:opacity-100 mb-4">
              Gerencie vagas, candidatos e todo o processo de recrutamento
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-bold">
              <span>Acessar painel</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-white mb-2">Processo Ágil</h3>
            <p className="text-sm text-white/70">
              Reduza o tempo de contratação com pipelines visuais e automações inteligentes
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="text-lg font-bold text-white mb-2">100% Seguro</h3>
            <p className="text-sm text-white/70">
              Sistema Anti-Gafe e conformidade total com LGPD para proteger dados
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-white mb-2">Analytics Completo</h3>
            <p className="text-sm text-white/70">
              Dashboards executivos com métricas de conversão e performance
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-sm text-white/50">
            © 2026 ATS Talento • Sistema Profissional de Recrutamento e Seleção
          </p>
        </div>
      </div>
    </div>
  );
}
