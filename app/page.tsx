import ToyCatalog from "./toy-catalog";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#b7e4ff_0%,#c7b6ff_35%,#e9b8f5_65%,#ffd6f3_100%)] text-slate-800">
      {/* Floating cloud decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float absolute -top-12 left-8 h-36 w-36 rounded-full bg-white/50 blur-2xl" />
        <div className="animate-float-delayed absolute top-24 right-10 h-44 w-44 rounded-full bg-white/40 blur-2xl" />
        <div className="animate-float absolute bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/35 blur-2xl" />
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
    <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
      {/* Left side - Mila's Poster */}
      <div className="relative order-2 lg:order-1">
        <div className="relative mx-auto max-w-sm lg:max-w-none">
          <div className="rounded-[2rem] bg-white/90 p-3 shadow-2xl ring-4 ring-white/80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/poster.png"
              alt="Rainbow Toys by Mila"
              className="w-full rounded-[1.5rem] shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Right side - Simple text */}
      <div className="order-1 text-center lg:order-2 lg:text-left">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-pink-600 via-purple-500 to-sky-500 bg-clip-text text-transparent">
            Rainbow Toys
          </span>{" "}
          <span className="text-pink-600">by Mila</span>
        </h1>

        <p className="mt-4 text-lg font-semibold text-slate-700 sm:text-xl">
          Cute 3D-printed toys made with love! 💖
          <br />
          Pick your toys, choose colors, and we&apos;ll make them for you!
        </p>

        <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/90 px-5 py-3 shadow-lg ring-2 ring-white/80">
          <span className="text-2xl">🏷️</span>
          <span className="text-lg font-black text-pink-600">Pay what you want!</span>
        </div>

        <a
          href="#catalog"
          className="mt-6 block rounded-full bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-4 text-center text-lg font-black text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl sm:inline-block"
        >
          See All Toys 🧸
        </a>
      </div>
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
