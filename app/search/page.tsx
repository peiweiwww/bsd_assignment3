"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
};

type Category = {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
};

type Toast = { id: number; message: string; type: "success" | "error" };

function MealCard({
  meal,
  isSaved,
  isSaving,
  onSave,
}: {
  meal: Meal;
  isSaved: boolean;
  isSaving: boolean;
  onSave: (meal: Meal) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-orange-100 overflow-hidden flex flex-col">
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
          {isSaved ? (
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 text-sm font-semibold py-2 rounded-xl cursor-not-allowed"
            >
              Saved ✓
            </button>
          ) : (
            <button
              onClick={() => onSave(meal)}
              disabled={isSaving}
              className="w-full bg-orange-600 text-white text-sm font-semibold py-2 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save to Favorites"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [randomMeals, setRandomMeals] = useState<Meal[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);

  // Load saved favorites, categories, and random meals on mount
  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        const ids = (data.favorites ?? []).map((f: { meal_id: string }) => f.meal_id);
        setSavedIds(new Set(ids));
      })
      .catch(() => {});

    Promise.all([
      fetch("/api/recipes/categories").then((r) => r.json()),
      fetch("/api/recipes/random").then((r) => r.json()),
    ])
      .then(([catData, randData]) => {
        setCategories(catData.categories ?? []);
        setRandomMeals(randData.meals ?? []);
      })
      .catch(() => {})
      .finally(() => setDiscoverLoading(false));
  }, []);

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
    setActiveCategory(null);
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

  const handleCategoryClick = async (category: string) => {
    setLoading(true);
    setSearched(true);
    setActiveCategory(category);
    setQuery("");
    try {
      const res = await fetch(`/api/recipes/filter?c=${encodeURIComponent(category)}`);
      const data = await res.json();
      setMeals(data.meals ?? []);
    } catch {
      addToast("Failed to load category recipes", "error");
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
        setSavedIds((prev) => new Set(prev).add(meal.idMeal));
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

      {/* Search / category results */}
      {loading && (
        <div className="text-center py-16 text-orange-500 font-medium">Loading recipes...</div>
      )}

      {!loading && searched && meals.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No recipes found. Try a different search.
        </div>
      )}

      {!loading && searched && meals.length > 0 && (
        <>
          {activeCategory && (
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeCategory} recipes
              </h2>
              <button
                onClick={() => { setSearched(false); setMeals([]); setActiveCategory(null); }}
                className="text-sm text-orange-600 hover:underline"
              >
                ← Back to browse
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <MealCard
                key={meal.idMeal}
                meal={meal}
                isSaved={savedIds.has(meal.idMeal)}
                isSaving={saving === meal.idMeal}
                onSave={handleSave}
              />
            ))}
          </div>
        </>
      )}

      {/* Discovery sections — shown before any search */}
      {!searched && (
        <>
          {discoverLoading ? (
            <div className="text-center py-16 text-orange-400 font-medium">
              Loading recipes...
            </div>
          ) : (
            <>
              {/* Categories */}
              {categories.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Browse by Category</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                      <button
                        key={cat.idCategory}
                        onClick={() => handleCategoryClick(cat.strCategory)}
                        className="group bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden hover:shadow-md hover:border-orange-300 transition-all text-left"
                      >
                        <div className="relative h-28 w-full">
                          <Image
                            src={cat.strCategoryThumb}
                            alt={cat.strCategory}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        </div>
                        <div className="px-3 py-2">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {cat.strCategory}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Random recipes */}
              {randomMeals.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Random Picks for You
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {randomMeals.map((meal) => (
                      <MealCard
                        key={meal.idMeal}
                        meal={meal}
                        isSaved={savedIds.has(meal.idMeal)}
                        isSaving={saving === meal.idMeal}
                        onSave={handleSave}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
