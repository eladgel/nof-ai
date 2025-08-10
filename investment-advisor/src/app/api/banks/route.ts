import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { parseBankData } from "@/lib/bank-data";
import type { BankCommission, BankJsonData } from "@/types";

export async function GET() {
  const dataDir = path.join(process.cwd(), "data", "banks");
  let results: BankCommission[] = [];

  try {
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    const entries = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const id = path.basename(file, ".json");
          const raw = await fs.readFile(path.join(dataDir, file), "utf-8");
          const json = JSON.parse(raw) as BankJsonData;
          return parseBankData(json, id);
        } catch {
          return null;
        }
      })
    );
    results = entries.filter(Boolean) as BankCommission[];
  } catch {
    results = [];
  }

  return NextResponse.json(results, { status: 200 });
}


