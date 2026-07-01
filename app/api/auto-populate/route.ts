import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const DISPLAY: Record<string, string> = { Ps: "Psalms" };

function fmt(raw: string | null): string {
  if (!raw) return "";
  return raw.replace(/^(\w+) /, (_, a) => (DISPLAY[a] ?? a) + " ");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date"); // MM/DD/YYYY

  const planPath = join(process.cwd(), "data", "year_reading_plan.json");
  if (!existsSync(planPath)) {
    return NextResponse.json({ error: "No reading plan loaded" }, { status: 404 });
  }

  const plan: Record<string, string | null> = JSON.parse(readFileSync(planPath, "utf8"));

  let base: Date;
  if (dateStr) {
    const [m, d, y] = dateStr.split("/").map(Number);
    base = new Date(y, m - 1, d);
  } else {
    base = new Date();
  }

  // Rewind to the Sunday of the current week
  const sunday = new Date(base);
  sunday.setDate(base.getDate() - base.getDay());

  const dates: string[] = [];
  const reading1: string[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
    reading1.push(fmt(plan[key] ?? null));
  }

  return NextResponse.json({ dates, reading1 });
}
