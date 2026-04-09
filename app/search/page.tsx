"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
};

type Toast = { id: number; message: string; type: "success" | "error" };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/recipes/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setMeals(data.meals ?? []);
    } catch {
      addToast("Failed to search recipes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (meal: Meal) => {
    setSaving(meal.idMeal);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_id: meal.idMeal,
          meal_name: meal.strMeal,
          meal_thumbnail: meal.strMealThumb,
          category: meal.strCategory,
          area: meal.strArea,
        }),
      });
      if (res.status === 201) {
        addToast(`"${meal.strMeal}" saved to favorites!`, "success");
      } else {
        const data = await res.json();
        addToast(data.error ?? "Could not save recipe", "error");
      }
    } catch {
      addToast("Failed to save recipe", "error");
    } finally {
      setSaving(null);
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

      <h1 className="text-3xl font-bold text-orange-700 mb-6">Search Recipes</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name (e.g. chicken, pasta...)"
          className="flex-1 px-4 py-3 rounded-xl border border-orange-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading && (
        <div className="text-center py-16 text-orange-500 font-medium">Loading recipes...</div>
      )}

      {!loading && searched && meals.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No recipes found for &quot;{query}&quot;. Try a different search.
        </div>
      )}

      {!loading && meals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <div
              key={meal.idMeal}
              className="bg-white rounded-2xl shadow-md border border-orange-100 overflow-hidden flex flex-col"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h2 className="font-semibold text-gray-900 text-lg leading-snug mb-1">
                  {meal.strMeal}
                </h2>
                <div className="flex gap-2 flex-wrap mb-4">
                  {meal.strCategory && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      {meal.strCategory}
                    </span>
                  )}
                  {meal.strArea && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {meal.strArea}
                    </span>
                  )}
                </div>
                <div className="mt-auto">
                  <button
                    onClick={() => handleSave(meal)}
                    disabled={saving === meal.idMeal}
                    className="w-full bg-orange-600 text-white text-sm font-semibold py-2 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
                  >
                    {saving === meal.idMeal ? "Saving..." : "Save to Favorites"}
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
