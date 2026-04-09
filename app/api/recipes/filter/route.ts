import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("c");
  if (!category) {
    return NextResponse.json({ meals: [] });
  }

  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch category recipes" }, { status: 502 });
  }

  const data = await res.json();
  // filter.php only returns idMeal, strMeal, strMealThumb — attach category for context
  const meals = (data.meals ?? []).slice(0, 20).map((m: { idMeal: string; strMeal: string; strMealThumb: string }) => ({
    idMeal: m.idMeal,
    strMeal: m.strMeal,
    strMealThumb: m.strMealThumb,
    strCategory: category,
    strArea: "",
  }));

  return NextResponse.json({ meals });
}
