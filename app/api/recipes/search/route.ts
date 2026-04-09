import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ meals: [] });
  }

  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ meals: data.meals ?? [] });
}
