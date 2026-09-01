// app/api/games/[id]/edit-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGameEditData } from "@/lib/db/queries/games";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getGameEditData(id);
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(data);
}
