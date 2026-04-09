import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorites: data });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { meal_id, meal_name, meal_thumbnail, category, area } = body;

  if (!meal_id || !meal_name) {
    return NextResponse.json({ error: "meal_id and meal_name are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, meal_id, meal_name, meal_thumbnail, category, area })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorite: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meal_id = request.nextUrl.searchParams.get("meal_id");
  if (!meal_id) {
    return NextResponse.json({ error: "meal_id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("meal_id", meal_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
