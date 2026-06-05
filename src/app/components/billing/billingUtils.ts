const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function below1000(n: number): string {
  if (n === 0) return "";
  let s = "";
  if (n >= 100) { s += ONES[Math.floor(n / 100)] + " Hundred "; n %= 100; }
  if (n >= 20) { s += TENS[Math.floor(n / 10)] + " "; n %= 10; }
  if (n > 0) s += ONES[n] + " ";
  return s;
}

export function numberToWords(amount: number): string {
  if (amount === 0) return "Indian Rupees Zero Only";
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let n = rupees;
  let w = "";
  if (n >= 10_000_000) { w += below1000(Math.floor(n / 10_000_000)) + "Crore "; n %= 10_000_000; }
  if (n >= 100_000)    { w += below1000(Math.floor(n / 100_000))    + "Lakh ";  n %= 100_000; }
  if (n >= 1_000)      { w += below1000(Math.floor(n / 1_000))      + "Thousand "; n %= 1_000; }
  w += below1000(n);
  let result = "Indian Rupees " + w.trim();
  if (paise > 0) result += " and " + below1000(paise).trim() + " Paise";
  return result.trim() + " Only";
}

export function fmt(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function nextInvoiceNo(): string {
  const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
  const year = new Date().getFullYear();
  return `INV-${year}-${String(invoices.length + 1).padStart(3, "0")}`;
}

export function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function getShopInfo() {
  const raw = localStorage.getItem("shopmanager_shop_data") || localStorage.getItem("shopmanager_settings");
  const data = raw ? JSON.parse(raw) : {};
  return {
    name: data.shopName || "ShopManager OS Demo",
    owner: data.ownerName || "Shop Owner",
    phone: data.phone || "+91 9876543210",
    gstin: data.gstin || "29AADCB2230M1Z2",
    address: data.address || "123 Market Street, City",
    state: data.state || "Kerala",
    stateCode: data.stateCode || "32",
  };
}
