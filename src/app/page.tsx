// ═══ LANDING PAGE — Mediterranean Premium ═══
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-marble-pattern" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F3F0EA 100%)' }}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#EDE9E0]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🫒</span>
            <span className="font-serif text-xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>De Cuadros</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/menu" className="text-sm font-medium text-[#6B6B6B] hover:text-[#5B7A5E] transition-colors">Carta</Link>
            <Link href="/login" className="btn-olive !py-2 !px-5 !text-sm">Acceder</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#5B7A5E]/10 text-[#5B7A5E] text-xs font-semibold tracking-wider uppercase mb-6 animate-fade-in">
            Fusión Mediterránea · Alguazas
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up" style={{ fontFamily: "'Playfair Display', serif" }}>
            Cocina que <br />
            <span className="italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#5B7A5E' }}>enamora</span>
          </h1>
          <p className="text-lg text-[#6B6B6B] max-w-xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Donde la tradición mediterránea se encuentra con la innovación.
            Cada plato cuenta una historia de sabores auténticos.
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link href="/menu" className="btn-olive">
              🍽️ Ver la Carta
            </Link>
            <Link href="/login" className="btn-outline">
              Entrar al Club
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 stagger">
            {[
              { icon: '🫒', title: 'Mediterráneo', desc: 'Ingredientes frescos del Levante, cocinados con pasión y técnica.' },
              { icon: '🎮', title: 'Experiencia Gamificada', desc: 'Acumula puntos, desbloquea logros y compite con otros foodies.' },
              { icon: '👨‍🍳', title: 'Chef AI', desc: 'Nuestro asistente te recomienda platos según tus gustos y preferencias.' },
            ].map((f, i) => (
              <div key={i} className="card-marble text-center animate-fade-in">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{f.title}</h3>
                <p className="text-sm text-[#6B6B6B]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-[#5B7A5E] text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { n: '4.8', label: 'Google Reviews' },
            { n: '150+', label: 'Platos de Fusión' },
            { n: '2024', label: 'Desde' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{s.n}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Únete a la experiencia
        </h2>
        <p className="text-[#6B6B6B] mb-8 max-w-md mx-auto">
          Regístrate gratis y accede a la ruleta de premios, juegos, y recompensas exclusivas.
        </p>
        <Link href="/register" className="btn-premium">
          🌿 Crear Cuenta Gratis
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EDE9E0] py-10 px-6 text-center text-sm text-[#9A9A9A]">
        <span style={{ fontFamily: "'Playfair Display', serif" }} className="font-bold text-[#2C2C2C]">De Cuadros</span>
        <span className="mx-2">·</span>
        Fusión Mediterránea
        <span className="mx-2">·</span>
        Alguazas, Murcia
      </footer>
    </div>
  )
}
