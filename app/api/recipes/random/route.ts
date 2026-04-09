import { NextResponse } from "next/server";

type MealDBMeal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
};

export async function GET() {
  // Fetch 4 random meals in parallel
  const results = await Promise.allSettled(
    Array.from({ length: 4 }, () =>
      fetch("https://www.themealdb.com/api/json/v1/1/random.php", {
        cache: "no-store",
      }).then((r) => r.json())
    )
  );

  const meals = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<{ meals: MealDBMeal[] }>).value.meals?.[0])
    .filter(Boolean)
    .map((m) => ({
      idMeal: m.idMeal,
      strMeal: m.strMeal,
      strMealThumb: m.strMealThumb,
      strCategory: m.strCategory,
      strArea: m.strArea,
    }));

  return NextResponse.json({ meals });
}
