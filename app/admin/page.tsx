"use client";

import { useEffect, useState } from "react";

type Toy = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sourceUrl?: string;
  difficulty?: string;
  printTimeHours?: number;
  tags?: string[];
};

type Color = {
  id: string;
  name: string;
  hex: string;
  inStock: boolean;
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Check if already logged in
  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setIsLoggedIn(d.loggedIn))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async () => {
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setIsLoggedIn(true);
    } else {
      setError("Wrong password");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 grid place-items-center">
        <div className="text-xl font-bold text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 grid place-items-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl">
          <div className="text-center">
            <div className="text-4xl">🔐</div>
            <h1 className="mt-4 text-2xl font-black text-slate-800">Admin Login</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="mt-6 w-full rounded-xl bg-slate-50 px-4 py-3 font-semibold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-pink-400"
          />
          {error && <div className="mt-2 text-sm font-bold text-red-500">{error}</div>}
          <button
            onClick={handleLogin}
            className="mt-4 w-full rounded-xl bg-pink-500 py-3 font-bold text-white hover:bg-pink-600"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [tab, setTab] = useState<"catalog" | "colors">("catalog");
  const [toys, setToys] = useState<Toy[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Load catalog
    fetch("/api/admin/catalog")
      .then((r) => r.json())
      .then((d) => setToys(d.toys || []));
    // Load colors
    fetch("/api/admin/colors")
      .then((r) => r.json())
      .then((d) => setColors(d.colors || []));
  }, []);

  const saveCatalog = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toys }),
      });
      if (res.ok) setMessage("Catalog saved! ✅");
      else setMessage("Error saving catalog");
    } finally {
      setSaving(false);
    }
  };

  const saveColors = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/colors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors }),
      });
      if (res.ok) setMessage("Colors saved! ✅");
      else setMessage("Error saving colors");
    } finally {
      setSaving(false);
    }
  };

  const updateToy = (index: number, field: keyof Toy, value: string) => {
    setToys((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleImageUpload = async (index: number, toyId: string, file?: File) => {
    if (!file) return;
    
    setMessage(`Uploading image for ${toys[index].name}...`);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("toyId", toyId);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      
      // Update the toy with the new image URL
      setToys((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], imageUrl: data.imageUrl };
        return updated;
      });
      
      setMessage(`Image uploaded! Don't forget to Save Catalog 💾`);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("❌ Failed to upload image");
    }
  };

  const toggleColorStock = (index: number) => {
    setColors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], inStock: !updated[index].inStock };
      return updated;
    });
  };

  const updateColor = (index: number, field: keyof Color, value: string) => {
    setColors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addColor = () => {
    const id = `color-${Date.now()}`;
    setColors((prev) => [...prev, { id, name: "New Color", hex: "#888888", inStock: true }]);
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌈</span>
            <span className="text-xl font-black text-slate-800">Admin Panel</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto max-w-6xl px-4 mt-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("catalog")}
            className={`rounded-lg px-4 py-2 font-bold ${
              tab === "catalog" ? "bg-pink-500 text-white" : "bg-white text-slate-600"
            }`}
          >
            🧸 Catalog ({toys.length})
          </button>
          <button
            onClick={() => setTab("colors")}
            className={`rounded-lg px-4 py-2 font-bold ${
              tab === "colors" ? "bg-pink-500 text-white" : "bg-white text-slate-600"
            }`}
          >
            🎨 Colors ({colors.length})
          </button>
        </div>

        {message && (
          <div className="mt-4 rounded-lg bg-green-100 px-4 py-2 font-bold text-green-700">
            {message}
          </div>
        )}

        {/* Catalog Tab */}
        {tab === "catalog" && (
          <div className="mt-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={saveCatalog}
                disabled={saving}
                className="rounded-lg bg-green-500 px-6 py-2 font-bold text-white hover:bg-green-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Catalog"}
              </button>
            </div>

            <div className="space-y-4">
              {toys.map((toy, i) => (
                <div key={toy.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex gap-4">
                    {/* Image preview + upload */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden">
                        {toy.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={toy.imageUrl} alt={toy.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-2xl">🌈</div>
                        )}
                      </div>
                      <label className="mt-2 block cursor-pointer rounded-lg bg-blue-500 px-3 py-1.5 text-center text-xs font-bold text-white hover:bg-blue-600">
                        📷 Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(i, toy.id, e.target.files?.[0])}
                        />
                      </label>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="text-xs font-bold text-slate-500">Name</label>
                        <input
                          value={toy.name}
                          onChange={(e) => updateToy(i, "name", e.target.value)}
                          className="w-full rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold outline-none ring-1 ring-slate-200 focus:ring-pink-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">Image URL</label>
                        <input
                          value={toy.imageUrl || ""}
                          onChange={(e) => updateToy(i, "imageUrl", e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold outline-none ring-1 ring-slate-200 focus:ring-pink-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">Description</label>
                        <input
                          value={toy.description || ""}
                          onChange={(e) => updateToy(i, "description", e.target.value)}
                          className="w-full rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold outline-none ring-1 ring-slate-200 focus:ring-pink-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {tab === "colors" && (
          <div className="mt-4">
            <div className="flex justify-between mb-4">
              <button
                onClick={addColor}
                className="rounded-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
              >
                + Add Color
              </button>
              <button
                onClick={saveColors}
                disabled={saving}
                className="rounded-lg bg-green-500 px-6 py-2 font-bold text-white hover:bg-green-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Colors"}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {colors.map((color, i) => (
                <div key={color.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    {/* Color preview */}
                    <div
                      className="w-12 h-12 rounded-lg shadow-inner"
                      style={{ background: color.hex }}
                    />
                    <div className="flex-1">
                      <input
                        value={color.name}
                        onChange={(e) => updateColor(i, "name", e.target.value)}
                        className="w-full rounded-lg bg-slate-50 px-2 py-1 text-sm font-bold outline-none ring-1 ring-slate-200 focus:ring-pink-400"
                      />
                      <input
                        value={color.hex}
                        onChange={(e) => updateColor(i, "hex", e.target.value)}
                        className="mt-1 w-full rounded-lg bg-slate-50 px-2 py-1 text-xs font-mono outline-none ring-1 ring-slate-200 focus:ring-pink-400"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => toggleColorStock(i)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        color.inStock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {color.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                    </button>
                    <button
                      onClick={() => removeColor(i)}
                      className="text-xs font-bold text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
