import type { InvoiceItem, Customer, InvoiceDetails, PaymentMethod } from "./billingTypes";
import { computeItemTotals, computeInvoiceTotals } from "./billingTypes";
import { fmt, numberToWords, getShopInfo } from "./billingUtils";

interface InvoicePreviewThermalProps {
  details: InvoiceDetails;
  customer: Customer | null;
  walkinName: string;
  walkinPhone: string;
  isWalkin: boolean;
  items: InvoiceItem[];
  paymentMethod: PaymentMethod;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  bank: "Bank Transfer",
  credit: "Credit",
};

function Dashes({ char = "-" }: { char?: string }) {
  return (
    <div style={{ letterSpacing: "1px", color: "#555", fontSize: "10px", marginBottom: "6px" }}>
      {"─".repeat(32)}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px", fontWeight: bold ? 700 : 400 }}>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "6px" }}>
        {label}
      </span>
      <span style={{ flexShrink: 0, fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

export function InvoicePreviewThermal({
  details, customer, walkinName, walkinPhone, isWalkin, items, paymentMethod,
}: InvoicePreviewThermalProps) {
  const shop = getShopInfo();
  const totals = computeInvoiceTotals(items);

  const custName = isWalkin ? (walkinName || "Walk-in Customer") : (customer?.name || "—");
  const custPhone = isWalkin ? walkinPhone : customer?.phone;

  const printDate = details.invoiceDate
    ? new Date(details.invoiceDate).toLocaleDateString("en-IN")
    : new Date().toLocaleDateString("en-IN");

  return (
    <div
      style={{
        width: "300px",
        background: "#fff",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "11px",
        lineHeight: 1.5,
        color: "#000",
        padding: "16px 14px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
        margin: "0 auto",
      }}
    >
      {/* Shop header */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {shop.name}
        </div>
        <div style={{ fontSize: "10px", color: "#444", marginTop: 2 }}>{shop.address}</div>
        <div style={{ fontSize: "10px", color: "#444" }}>Ph: {shop.phone}</div>
        <div style={{ fontSize: "10px", color: "#444" }}>GSTIN: {shop.gstin}</div>
      </div>

      <Dashes />

      {/* Invoice info */}
      <div style={{ marginBottom: "6px" }}>
        <Row label="Invoice No" value={details.invoiceNo || "—"} />
        <Row label="Date" value={printDate} />
        {details.placeOfSupply && <Row label="Supply" value={details.placeOfSupply} />}
      </div>

      <Dashes />

      {/* Customer */}
      <div style={{ marginBottom: "6px" }}>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>Customer:</div>
        <div>{custName}</div>
        {custPhone && <div style={{ fontSize: "10px", color: "#555" }}>Ph: {custPhone}</div>}
        {!isWalkin && customer?.gstin && (
          <div style={{ fontSize: "10px", color: "#555" }}>GSTIN: {customer.gstin}</div>
        )}
      </div>

      <Dashes />

      {/* Items */}
      <div style={{ marginBottom: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: "4px", fontSize: "10px" }}>
          <span style={{ flex: 1 }}>ITEM</span>
          <span style={{ width: "32px", textAlign: "center" }}>QTY</span>
          <span style={{ width: "70px", textAlign: "right" }}>AMT</span>
        </div>

        {items.length === 0 ? (
          <div style={{ color: "#aaa", fontSize: "10px" }}>No items</div>
        ) : (
          items.map(item => {
            const t = computeItemTotals(item);
            return (
              <div key={item.id} style={{ marginBottom: "4px" }}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.description || "—"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#444" }}>
                  <span>{fmt(item.rate)} × {item.qty}</span>
                  <span style={{ fontFamily: "monospace" }}>
                    {" ".repeat(4)}
                    <span style={{ display: "inline-block", width: "32px", textAlign: "center" }}>{item.qty}</span>
                    <span style={{ display: "inline-block", width: "70px", textAlign: "right" }}>{fmt(t.amount)}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dashes />

      {/* Totals */}
      <div style={{ marginBottom: "6px" }}>
        <Row label="Taxable Amount" value={fmt(totals.totalTaxable)} />
        <Row label="CGST" value={fmt(totals.totalCGST)} />
        <Row label="SGST" value={fmt(totals.totalSGST)} />
      </div>

      <Dashes char="=" />

      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "13px", marginBottom: "6px" }}>
        <span>TOTAL</span>
        <span style={{ fontFamily: "monospace" }}>{fmt(totals.grandTotal)}</span>
      </div>

      <Dashes char="=" />

      {/* Amount in words */}
      {totals.grandTotal > 0 && (
        <div style={{ fontSize: "10px", color: "#444", marginBottom: "8px", lineHeight: 1.4 }}>
          {numberToWords(totals.grandTotal)}
        </div>
      )}

      <Dashes />

      {/* Payment */}
      <div style={{ marginBottom: "8px" }}>
        <Row label="Payment Mode" value={PAYMENT_LABELS[paymentMethod]} bold />
      </div>

      <Dashes />

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "8px" }}>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>Thank you for your business!</div>
        <div style={{ fontSize: "10px", color: "#666" }}>Visit again · {shop.name}</div>
        <div style={{ fontSize: "9px", color: "#aaa", marginTop: 6 }}>
          ** Computer Generated Receipt **
        </div>
      </div>
    </div>
  );
}
