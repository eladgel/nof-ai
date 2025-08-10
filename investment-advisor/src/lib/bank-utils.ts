import { ISRAELI_BANKS } from "@/consts/banks";

export function isIsraeliBank(code: string): boolean {
  return ISRAELI_BANKS.some((b) => b.code === code);
}

export function getLogoSrc(id: string): string {
  const code = id.padStart(4, "0");
  return `https://market.tase.co.il/assets/img/tase_members/heb/00${code}.png`;
}


