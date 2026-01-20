"use client";

import { useEffect, useMemo, useState } from "react";

type Toy = {
  id: string;
  name: string;
  imageUrl?: string;
  sourceUrl?: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  printTimeHours?: number;
  tags?: string[];
};

type CartItem = {
  toy: Toy;
  colors: string[];
};

const PRICE = 5; // $5 per toy

type ColorOption = {
  id: string;
  name: string;
  hex: string;
  inStock?: boolean;
};

export default function ToyCatalog() {
  const [toys, setToys] = useState<Toy[]>([]);
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeToy, setActiveToy] = useState<Toy | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [catalogRes, colorsRes] = await Promise.all([
          fetch("/api/catalog", { cache: "no-store" }),
          fetch("/api/admin/colors", { cache: "no-store" }),
        ]);
        const catalogData = (await catalogRes.json()) as { toys: Toy[] };
        const colorsData = (await colorsRes.json()) as { colors: ColorOption[] };
        setToys(catalogData.toys ?? []);
        // Only show in-stock colors
        setColors((colorsData.colors ?? []).filter((c) => c.inStock !== false));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return toys;
    return toys.filter((t) =>
      (t.name + " " + (t.tags ?? []).join(" ")).toLowerCase().includes(q)
    );
  }, [toys, query]);

  const addToCart = (toy: Toy, colors: string[]) => {
    setCart((prev) => [...prev, { toy, colors }]);
    setActiveToy(null);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const total = cart.length * PRICE;

  return (
    <>
      <div id="catalog" className="scroll-mt-4 rounded-[2rem] bg-white/85 p-4 shadow-xl ring-2 ring-white/80 sm:p-6">
        {/* Header with search and cart */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-2xl font-black">
            🧸 Pick Your Toys
          </div>

          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-full bg-white/95 px-4 py-2 text-sm font-semibold shadow-md ring-1 ring-slate-200 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400 sm:w-48"
            />
            <button
              onClick={() => setShowCart(true)}
              className="relative rounded-full bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-2 font-bold text-white shadow-md transition-all hover:scale-105"
            >
              🛒 {cart.length > 0 && <span>${total}</span>}
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-yellow-400 text-xs font-black text-slate-800">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Toy grid */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl bg-white/70 p-8 text-center">
              <div className="text-4xl animate-bounce">🧸</div>
              <div className="mt-2 font-bold text-slate-600">Loading toys...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-white/70 p-8 text-center">
              <div className="text-4xl">🔍</div>
              <div className="mt-2 font-bold text-slate-600">No toys found</div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((toy) => (
                <ToyCard key={toy.id} toy={toy} onSelect={() => setActiveToy(toy)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Color picker modal */}
      {activeToy && (
        <ColorPickerModal
          toy={activeToy}
          colors={colors}
          onClose={() => setActiveToy(null)}
          onAdd={addToCart}
        />
      )}

      {/* Cart modal */}
      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onClearCart={() => setCart([])}
        />
      )}
    </>
  );
}

function ToyCard({ toy, onSelect }: { toy: Toy; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="group rounded-2xl bg-white/90 p-3 text-left shadow-md ring-1 ring-white/80 transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image */}
      <div className="overflow-hidden rounded-xl bg-gradient-to-b from-sky-50 to-pink-50">
        {toy.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={toy.imageUrl}
            alt={toy.name}
            className="h-32 w-full object-cover sm:h-40"
          />
        ) : (
          <div className="grid h-32 place-items-center text-4xl sm:h-40">🌈</div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <div className="font-bold text-slate-800 leading-tight">{toy.name}</div>
          <div className="mt-1 text-lg font-black text-pink-600">${PRICE}</div>
        </div>
        <div className="rounded-full bg-pink-100 px-3 py-1 text-sm font-bold text-pink-700">
          + Add
        </div>
      </div>
    </button>
  );
}

function ColorPickerModal({
  toy,
  colors,
  onClose,
  onAdd,
}: {
  toy: Toy;
  colors: ColorOption[];
  onClose: () => void;
  onAdd: (toy: Toy, colors: string[]) => void;
}) {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const toggleColor = (colorId: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorId)
        ? prev.filter((c) => c !== colorId)
        : [...prev, colorId]
    );
  };

  const handleAdd = () => {
    if (selectedColors.length === 0) {
      // Default to first color if nothing selected
      const firstColor = colors[0]?.name || "Rainbow";
      onAdd(toy, [firstColor]);
    } else {
      const colorNames = selectedColors.map(
        (id) => colors.find((c) => c.id === id)?.name ?? id
      );
      onAdd(toy, colorNames);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toy info */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-xl bg-gradient-to-b from-sky-50 to-pink-50">
            {toy.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={toy.imageUrl} alt={toy.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-3xl">🌈</div>
            )}
          </div>
          <div>
            <div className="text-xl font-black text-slate-800">{toy.name}</div>
            <div className="text-2xl font-black text-pink-600">${PRICE}</div>
          </div>
        </div>

        {/* Color picker */}
        <div className="mt-6">
          <div className="font-bold text-slate-700">Pick color(s):</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = selectedColors.includes(color.id);
              const isLight = ["white", "yellow"].includes(color.id) || color.hex.toLowerCase() === "#f8fafc";
              return (
                <button
                  key={color.id}
                  onClick={() => toggleColor(color.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-all ${
                    isSelected
                      ? "ring-4 ring-pink-400 scale-105"
                      : "ring-1 ring-slate-200"
                  }`}
                  style={{
                    background: color.hex,
                    color: isLight ? "#334155" : "#fff",
                  }}
                >
                  {color.name}
                  {isSelected && " ✓"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-slate-100 py-3 font-bold text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 py-3 font-bold text-white"
          >
            Add to Cart 🛒
          </button>
        </div>
      </div>
    </div>
  );
}

function CartModal({
  cart,
  onClose,
  onRemove,
  onClearCart,
}: {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (index: number) => void;
  onClearCart: () => void;
}) {
  const [buyerName, setBuyerName] = useState("");
  const [error, setError] = useState("");

  const total = cart.length * PRICE;
  
  // Matt's phone from env (set in Vercel)
  const mattPhone = process.env.NEXT_PUBLIC_MATT_PHONE || "";

  // Build SMS message
  const buildSmsMessage = () => {
    const itemsList = cart
      .map((item) => `• ${item.toy.name} (${item.colors.join(", ")})`)
      .join("\n");
    return `Hi Matt! 🌈\n\nNew Rainbow Toys order from ${buyerName || "a customer"}:\n\n${itemsList}\n\nTotal: $${total}`;
  };

  const handleTextMatt = () => {
    if (!buyerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty!");
      return;
    }
    
    const smsBody = encodeURIComponent(buildSmsMessage());
    const smsLink = `sms:${mattPhone}?body=${smsBody}`;
    
    // Open SMS app
    window.location.href = smsLink;
    
    // Clear cart after a short delay
    setTimeout(() => {
      onClearCart();
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-2xl font-black text-slate-800">🛒 Your Cart</div>

        {cart.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center">
            <div className="text-4xl">🧸</div>
            <div className="mt-2 font-bold text-slate-600">Cart is empty</div>
            <button
              onClick={onClose}
              className="mt-4 rounded-full bg-pink-500 px-6 py-2 font-bold text-white"
            >
              Browse Toys
            </button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="mt-4 space-y-3">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="h-14 w-14 overflow-hidden rounded-lg bg-white">
                    {item.toy.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.toy.imageUrl} alt={item.toy.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-2xl">🌈</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 leading-tight">{item.toy.name}</div>
                    <div className="text-sm text-slate-600">{item.colors.join(", ")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-pink-600">${PRICE}</div>
                    <button
                      onClick={() => onRemove(i)}
                      className="text-xs font-bold text-slate-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-pink-50 p-4">
              <div className="font-bold text-slate-700">Total ({cart.length} toys)</div>
              <div className="text-2xl font-black text-pink-600">${total}</div>
            </div>

            {/* Order form */}
            <div className="mt-6">
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl bg-slate-50 px-4 py-3 font-semibold outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {error && (
              <div className="mt-3 rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            {/* Submit - opens SMS */}
            <button
              onClick={handleTextMatt}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-green-500 to-green-600 py-4 text-lg font-black text-white shadow-lg"
            >
              📱 Text Matt The Order
            </button>

            <button
              onClick={onClose}
              className="mt-3 w-full rounded-full bg-slate-100 py-3 font-bold text-slate-600"
            >
              Keep Shopping
            </button>
          </>
        )}
      </div>
    </div>
  );
}
