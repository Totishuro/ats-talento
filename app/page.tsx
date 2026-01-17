export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b1b2f] flex items-center justify-center px-4">
      <div className="max-w-5xl mx-auto text-center">
        {/* Logo integrada ao fundo */}
        <div className="mb-12">
          <img
            src="/logo.png"
            alt="Talento"
            className="h-48 w-auto mx-auto"
          />
        </div>

        {/* Frase Motivacional */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Conectando Estrelas. <br />
            Construindo Constelações.
          </h1>
          <p className="text-xl md:text-2xl text-[#b8c5d6] font-light italic">
            Onde talentos brilhantes encontram oportunidades estelares ✨
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Candidato */}
          <a
            href="/vagas"
            className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white hover:border-white text-white hover:text-[#0b1b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold mb-2">Encontre sua Estrela</h2>
            <p className="text-sm opacity-90 group-hover:opacity-100">
              Descubra oportunidades que fazem você brilhar
            </p>
          </a>

          {/* Admin */}
          <a
            href="/admin"
            className="group bg-[#b8c5d6]/20 backdrop-blur-sm border-2 border-[#b8c5d6]/30 hover:bg-[#b8c5d6] hover:border-[#b8c5d6] text-white hover:text-[#0b1b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">Encontre Talentos</h2>
            <p className="text-sm opacity-90 group-hover:opacity-100">
              Descubra as estrelas para sua empresa
            </p>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <p className="text-sm text-[#b8c5d6]/70">
            © 2026 Talento • Transformando Carreiras • Impulsionando Empresas
          </p>
        </div>
      </div>
    </div>
  );
}
