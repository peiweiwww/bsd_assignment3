"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Favorite } from "@/lib/supabase";

type Toast = { id: number; message: string; type: "success" | "error" };

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => setFavorites(data.favorites ?? []))
      .catch(() => addToast("Failed to load favorites", "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  const handleRemove = async (meal_id: string, meal_name: string) => {
    setRemoving(meal_id);
    try {
      const res = await fetch(`/api/favorites?meal_id=${encodeURIComponent(meal_id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.meal_id !== meal_id));
        addToast(`"${meal_name}" removed from favorites`, "success");
      } else {
        addToast("Failed to remove recipe", "error");
      }
    } catch {
      addToast("Failed to remove recipe", "error");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
              t.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-bold text-orange-700 mb-6">My Favorites</h1>

      {loading && (
        <div className="text-center py-16 text-orange-500 font-medium">Loading favorites...</div>
      )}

      {!loading && favorites.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-gray-500 text-lg mb-6">No saved recipes yet.</p>
          <Link
            href="/search"
            className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-orange-700 transition-colors"
          >
            Search Recipes
          </Link>
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="bg-white rounded-2xl shadow-md border border-orange-100 overflow-hidden flex flex-col"
            >
              {fav.meal_thumbnail && (
                <div className="relative h-48 w-full">
                  <Image
                    src={fav.meal_thumbnail}
                    alt={fav.meal_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <h2 className="font-semibold text-gray-900 text-lg leading-snug mb-1">
                  {fav.meal_name}
                </h2>
                <div className="flex gap-2 flex-wrap mb-4">
                  {fav.category && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      {fav.category}
                    </span>
                  )}
                  {fav.area && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {fav.area}
                    </span>
                  )}
                </div>
                <div className="mt-auto">
                  <button
                    onClick={() => handleRemove(fav.meal_id, fav.meal_name)}
                    disabled={removing === fav.meal_id}
                    className="w-full border border-red-300 text-red-600 text-sm font-semibold py-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    {removing === fav.meal_id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
