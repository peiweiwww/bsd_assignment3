import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    "https://www.themealdb.com/api/json/v1/1/categories.php",
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ categories: data.categories ?? [] });
}
