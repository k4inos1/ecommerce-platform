/**
 * Profit Calculator — based on ecommerce-product-pro skill framework
 * Calculates net margin, ROI and validates against the 30% minimum threshold
 */

export interface ProfitInput {
  sellingPrice: number;
  supplierCost: number;
  shippingCost?: number;
  paymentFeePercent?: number; // Stripe: ~2.9% + $0.30
  otherCosts?: number;
}

export interface ProfitResult {
  revenue: number;
  costs: {
    supplier: number;
    shipping: number;
    paymentFee: number;
    other: number;
    total: number;
  };
  profit: number;
  marginPercent: number;
  roi: number;
  isViable: boolean; // >= 30% margin per skill requirement
  recommendation: string;
}

export function calculateProfit(input: ProfitInput): ProfitResult {
  const { sellingPrice, supplierCost } = input;
  const shipping = input.shippingCost ?? sellingPrice * 0.05;
  const paymentFeePercent = input.paymentFeePercent ?? 2.9;
  const paymentFee = (sellingPrice * paymentFeePercent) / 100 + 0.30;
  const other = input.otherCosts ?? 0;

  const totalCosts = supplierCost + shipping + paymentFee + other;
  const profit = sellingPrice - totalCosts;
  const marginPercent = (profit / sellingPrice) * 100;
  const roi = (profit / supplierCost) * 100;
  const isViable = marginPercent >= 30;

  let recommendation = '';
  if (marginPercent >= 50) recommendation = '🟢 Excelente margen — producto altamente rentable';
  else if (marginPercent >= 40) recommendation = '🟢 Buen margen — producto rentable';
  else if (marginPercent >= 30) recommendation = '🟡 Margen aceptable — cumple el mínimo del 30%';
  else if (marginPercent >= 20) recommendation = '🟠 Margen bajo — considera ajustar el precio de venta';
  else recommendation = '🔴 Margen insuficiente — no viable según los criterios del skill';

  return {
    revenue: sellingPrice,
    costs: {
      supplier: supplierCost,
      shipping: Math.round(shipping * 100) / 100,
      paymentFee: Math.round(paymentFee * 100) / 100,
      other,
      total: Math.round(totalCosts * 100) / 100,
    },
    profit: Math.round(profit * 100) / 100,
    marginPercent: Math.round(marginPercent * 10) / 10,
    roi: Math.round(roi * 10) / 10,
    isViable,
    recommendation,
  };
}
