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

type OrderItem = {
  toyId: string;
  toyName: string;
  colors: string[];
};

type Order = {
  id: string;
  buyer_name: string;
  buyer_contact: string;
  items: OrderItem[];
  total: number;
  notes: string | null;
  is_completed: boolean;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
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
  const [tab, setTab] = useState<"catalog" | "colors" | "orders">("orders");
  const [toys, setToys] = useState<Toy[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
    // Load orders
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
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

  const updateOrderStatus = async (orderId: string, field: "is_completed" | "is_paid", value: boolean) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, [field]: value } : order
      )
    );

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, [field]: value }),
      });

      if (!res.ok) {
        // Revert on failure
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, [field]: !value } : order
          )
        );
        setMessage("❌ Failed to update order");
      }
    } catch (error) {
      console.error("Update order error:", error);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, [field]: !value } : order
        )
      );
      setMessage("❌ Failed to update order");
    }
  };

  const deleteOrder = async (orderId: string, buyerName: string) => {
    if (!confirm(`Delete order from "${buyerName}"? This cannot be undone.`)) return;

    try {
      const res = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setMessage(`Deleted order from "${buyerName}" ✅`);
      } else {
        setMessage("❌ Failed to delete order");
      }
    } catch (error) {
      console.error("Delete order error:", error);
      setMessage("❌ Failed to delete order");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const pendingOrders = orders.filter((o) => !o.is_completed);
  const completedOrders = orders.filter((o) => o.is_completed);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };

  const addNewToy = async () => {
    setMessage("Creating new toy...");
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          toy: {
            id: `toy-${Date.now()}`,
            name: "New Toy",
            description: "Add a description",
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to create toy");

      const data = await res.json();
      setToys((prev) => [data.toy, ...prev]);
      setMessage("New toy added! Edit it below 👇");
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to create toy");
    }
  };

  const deleteToy = async (toyId: string, toyName: string) => {
    if (!confirm(`Delete "${toyName}"? This cannot be undone.`)) return;

    try {
      const res = await fetch("/api/admin/catalog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: toyId }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      setToys((prev) => prev.filter((t) => t.id !== toyId));
      setMessage(`Deleted "${toyName}" ✅`);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to delete toy");
    }
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
          <button
            onClick={() => setTab("orders")}
            className={`rounded-lg px-4 py-2 font-bold ${
              tab === "orders" ? "bg-pink-500 text-white" : "bg-white text-slate-600"
            }`}
          >
            📦 Orders ({orders.length})
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
            <div className="flex justify-between mb-4">
              <button
                onClick={addNewToy}
                className="rounded-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
              >
                + Add New Toy
              </button>
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
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => deleteToy(toy.id, toy.name)}
                          className="text-xs font-bold text-red-400 hover:text-red-600"
                        >
                          🗑️ Delete Toy
                        </button>
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
                    {/* Color picker - click to open color wheel */}
                    <label className="relative cursor-pointer group">
                      <div
                        className="w-14 h-14 rounded-xl shadow-inner ring-2 ring-slate-200 group-hover:ring-pink-400 transition-all"
                        style={{ background: color.hex }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-lg drop-shadow-lg">🎨</span>
                      </div>
                      <input
                        type="color"
                        value={color.hex.startsWith("#") ? color.hex : "#888888"}
                        onChange={(e) => updateColor(i, "hex", e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </label>
                    <div className="flex-1">
                      <input
                        value={color.name}
                        onChange={(e) => updateColor(i, "name", e.target.value)}
                        placeholder="Color name"
                        className="w-full rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold outline-none ring-1 ring-slate-200 focus:ring-pink-400"
                      />
                      <div className="mt-1 text-xs text-slate-400 font-mono px-1">
                        {color.hex}
                      </div>
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

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="mt-4 space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-3xl font-black text-pink-500">
                  ${orders.reduce((sum, o) => sum + (o.total || 0), 0)}
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1">Total Revenue</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-3xl font-black text-green-500">
                  ${orders.filter((o) => o.is_paid).reduce((sum, o) => sum + (o.total || 0), 0)}
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1">Paid</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-3xl font-black text-slate-700">{orders.length}</div>
                <div className="text-xs font-bold text-slate-500 mt-1">Total Orders</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-3xl font-black text-yellow-500">{pendingOrders.length}</div>
                <div className="text-xs font-bold text-slate-500 mt-1">Pending</div>
              </div>
            </div>

            {/* Pending Orders */}
            <div>
              <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                Pending Orders ({pendingOrders.length})
              </h2>
              {pendingOrders.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-slate-400">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="font-semibold">No pending orders!</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onToggleCompleted={(value) => updateOrderStatus(order.id, "is_completed", value)}
                      onTogglePaid={(value) => updateOrderStatus(order.id, "is_paid", value)}
                      onDelete={() => deleteOrder(order.id, order.buyer_name)}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Completed Orders ({completedOrders.length})
                </h2>
                <div className="space-y-3">
                  {completedOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onToggleCompleted={(value) => updateOrderStatus(order.id, "is_completed", value)}
                      onTogglePaid={(value) => updateOrderStatus(order.id, "is_paid", value)}
                      onDelete={() => deleteOrder(order.id, order.buyer_name)}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Order Card Component
function OrderCard({
  order,
  onToggleCompleted,
  onTogglePaid,
  onDelete,
  formatDate,
}: {
  order: Order;
  onToggleCompleted: (value: boolean) => void;
  onTogglePaid: (value: boolean) => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
}) {
  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
        order.is_completed ? "border-green-500 opacity-75" : "border-yellow-400"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Order Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-800">{order.buyer_name}</span>
            <span className="text-xs text-slate-400">{formatDate(order.created_at)}</span>
          </div>
          <a
            href={
              order.buyer_contact.includes("@")
                ? `mailto:${order.buyer_contact}`
                : `tel:${order.buyer_contact}`
            }
            className="text-sm text-pink-500 font-semibold hover:underline"
          >
            {order.buyer_contact}
          </a>

          {/* Items */}
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">Items</div>
            <ul className="space-y-1">
              {order.items.map((item, i) => (
                <li key={i} className="text-sm text-slate-700">
                  <span className="font-semibold">{item.toyName}</span>
                  <span className="text-slate-400"> — {item.colors.join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>

          {order.notes && (
            <div className="mt-2 text-sm text-slate-500 italic">
              📝 {order.notes}
            </div>
          )}
        </div>

        {/* Total & Actions */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-2xl font-black text-pink-500">${order.total}</div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={order.is_completed}
                onChange={(e) => onToggleCompleted(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-slate-300 text-green-500 focus:ring-green-400 cursor-pointer"
              />
              <span
                className={`text-sm font-bold ${
                  order.is_completed ? "text-green-600" : "text-slate-500"
                }`}
              >
                ✅ Completed
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={order.is_paid}
                onChange={(e) => onTogglePaid(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-slate-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
              />
              <span
                className={`text-sm font-bold ${
                  order.is_paid ? "text-blue-600" : "text-slate-500"
                }`}
              >
                💰 Paid
              </span>
            </label>
          </div>

          <button
            onClick={onDelete}
            className="text-xs font-bold text-red-400 hover:text-red-600"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
