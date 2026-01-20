import ToyCatalog from "./toy-catalog";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-300 via-purple-300 via-50% to-pink-300 animate-gradient text-slate-800">
      {/* Floating cloud decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float absolute -top-12 left-8 h-36 w-36 rounded-full bg-white/50 blur-2xl" />
        <div className="animate-float-delayed absolute top-24 right-10 h-44 w-44 rounded-full bg-white/40 blur-2xl" />
        <div className="animate-float absolute bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/35 blur-2xl" />
        
        {/* Twinkling stars */}
        <div className="animate-twinkle absolute top-16 left-[15%] text-2xl">✨</div>
        <div className="animate-twinkle-delayed absolute top-32 right-[20%] text-xl">⭐</div>
        <div className="animate-twinkle-slow absolute top-48 left-[25%] text-lg">✨</div>
        <div className="animate-twinkle absolute top-20 right-[35%] text-2xl">💫</div>
        <div className="animate-twinkle-delayed absolute top-60 right-[15%] text-xl">⭐</div>
        <div className="animate-twinkle-slow absolute bottom-40 right-[25%] text-2xl">✨</div>
        <div className="animate-twinkle absolute bottom-32 left-[10%] text-xl">💖</div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Hero />

        <section className="mt-10">
          <ToyCatalog />
        </section>

        <Footer />
      </div>
    </main>
  );
}

function Hero() {
  return (
    <section className="flex items-center justify-center gap-4 sm:gap-8">
      {/* Left scroll arrow */}
      <a
        href="#catalog"
        className="hidden sm:flex flex-col items-center gap-2 animate-bounce-arrow"
      >
        <span className="text-sm font-bold text-white drop-shadow-lg [writing-mode:vertical-rl] rotate-180">
          scroll down
        </span>
        <span className="text-3xl drop-shadow-lg">👇</span>
      </a>

      {/* Poster */}
      <div className="relative mx-auto max-w-md">
          <div className="rounded-[2rem] bg-white/90 p-3 shadow-2xl ring-4 ring-white/80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/poster.png"
              alt="Rainbow Toys by Mila"
              className="w-full rounded-[1.5rem] shadow-lg"
            />
        </div>
      </div>

      {/* Right scroll arrow */}
      <a
        href="#catalog"
        className="hidden sm:flex flex-col items-center gap-2 animate-bounce-arrow"
      >
        <span className="text-sm font-bold text-white drop-shadow-lg [writing-mode:vertical-rl]">
          scroll down
        </span>
        <span className="text-3xl drop-shadow-lg">👇</span>
      </a>

      {/* Mobile scroll indicator (centered below poster) */}
        <a
          href="#catalog"
        className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce-arrow z-10"
        >
        <span className="text-xs font-bold text-white drop-shadow-lg bg-pink-500/80 px-3 py-1 rounded-full">
          scroll down
        </span>
        <span className="text-2xl drop-shadow-lg">👇</span>
        </a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-12 rounded-[2rem] bg-white/85 p-6 text-center shadow-xl ring-2 ring-white/80">
      <div className="text-lg font-black text-slate-700">
        🌈 Rainbow Toys by Mila
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-500">
        Made with love in our home 💖
      </div>
    </footer>
  );
}
