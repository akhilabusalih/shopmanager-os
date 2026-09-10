export type CustomerMode = "existing" | "walkin";
export type OutputMode = "a4" | "thermal";
export type PaymentMethod = "cash" | "upi" | "bank" | "credit";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  gstin?: string | null;
}

export interface Product {
  id: string;
  name: string;
  hsn: string;
  price: number;
  stock: number;
  unit?: string;
  gstRate?: number;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  gstRate: number;
}

export interface InvoiceDetails {
  invoiceNo: string;
  invoiceDate: string;
  placeOfSupply: string;
  supplyDateTime: string;
  transportMode: string;
  vehicleNumber: string;
}

export function computeItemTotals(item: InvoiceItem) {
  const taxable = item.qty * item.rate;
  const gstAmount = taxable * (item.gstRate / 100);
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  return { taxable, cgst, sgst, amount: taxable + gstAmount };
}

export function computeInvoiceTotals(items: InvoiceItem[]) {
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  for (const item of items) {
    const t = computeItemTotals(item);
    totalTaxable += t.taxable;
    totalCGST += t.cgst;
    totalSGST += t.sgst;
  }
  return { totalTaxable, totalCGST, totalSGST, grandTotal: totalTaxable + totalCGST + totalSGST };
}
