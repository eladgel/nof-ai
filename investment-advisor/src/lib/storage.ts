"use client";
import { InvestmentData } from "@/types";

const STORAGE_KEY = "investmentData";

export function saveInvestmentData(data: InvestmentData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save investment data:", error);
  }
}

export function loadInvestmentData(): InvestmentData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Failed to load investment data:", error);
    return null;
  }
}

export function clearInvestmentData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear investment data:", error);
  }
}


