import { BankCommission } from "@/types";

export function calculateTradingFee(
  bank: BankCommission,
  amount: number,
  type: "israeli" | "foreign"
): number {
  if (amount === 0) return 0;

  if (type === "israeli") {
    if (bank.israeliStocksRate === 0) return 0;
    let fee = (amount * bank.israeliStocksRate) / 100;
    if (bank.israeliStocksMin > 0) fee = Math.max(fee, bank.israeliStocksMin);
    if (bank.israeliStocksMax > 0) fee = Math.min(fee, bank.israeliStocksMax);
    return fee;
  } else {
    if (bank.foreignStocksRate === 0) return 0;
    let fee = (amount * bank.foreignStocksRate) / 100;
    if (bank.foreignStocksMin > 0) fee = Math.max(fee, bank.foreignStocksMin * 3.8);
    if (bank.foreignStocksMax > 0) fee = Math.min(fee, bank.foreignStocksMax * 3.8);
    return fee;
  }
}

export function calculateManagementFee(
  bank: BankCommission,
  israeliAmount: number,
  foreignAmount: number
): number {
  const israeliFee = typeof bank.managementFeeIsraeli === "number"
    ? bank.managementFeeIsraeli > 10
      ? bank.managementFeeIsraeli * 12
      : (israeliAmount * bank.managementFeeIsraeli * 4) / 100
    : 0;

  const foreignFee = typeof bank.managementFeeForeign === "number"
    ? bank.managementFeeForeign > 10
      ? bank.managementFeeForeign * 12
      : (foreignAmount * bank.managementFeeForeign * 4) / 100
    : 0;

  return israeliFee + foreignFee;
}

export function calculateTotalFee(
  bank: BankCommission,
  israeliAmount: number,
  foreignAmount: number
): number {
  const israeliFee = calculateTradingFee(bank, israeliAmount, "israeli");
  const foreignFee = calculateTradingFee(bank, foreignAmount, "foreign");
  const managementFee = calculateManagementFee(bank, israeliAmount, foreignAmount);

  return israeliFee + foreignFee + managementFee;
}


