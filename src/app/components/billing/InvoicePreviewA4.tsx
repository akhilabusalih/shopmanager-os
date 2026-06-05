import type { InvoiceItem, Customer, InvoiceDetails } from "./billingTypes";
import { computeItemTotals, computeInvoiceTotals } from "./billingTypes";
import { fmt, numberToWords, getShopInfo } from "./billingUtils";

interface InvoicePreviewA4Props {
  details: InvoiceDetails;
  customer: Customer | null;
  walkinName: string;
  walkinPhone: string;
  isWalkin: boolean;
  items: InvoiceItem[];
}

const MIN_ROWS = 6;

export function InvoicePreviewA4({
  details, customer, walkinName, walkinPhone, isWalkin, items,
}: InvoicePreviewA4Props) {
  const shop = getShopInfo();
  const totals = computeInvoiceTotals(items);

  const billTo = isWalkin
    ? { name: walkinName || "Walk-in Customer", phone: walkinPhone, gstin: "", address: "", state: "", stateCode: "" }
    : customer
    ? { name: customer.name, phone: customer.phone, gstin: customer.gstin, address: customer.address, state: customer.state, stateCode: customer.stateCode }
    : { name: "", phone: "", gstin: "", address: "", state: "", stateCode: "" };

  const paddedItems = [
    ...items,
    ...Array(Math.max(0, MIN_ROWS - items.length)).fill(null),
  ];

  return (
    <div
      className="bg-white text-black"
      style={{
        width: "100%",
        maxWidth: "720px",
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        lineHeight: 1.4,
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: "2px solid #000", padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Seller info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {shop.name}
            </div>
            <div style={{ marginTop: 3 }}>{shop.address}</div>
            <div>Ph: {shop.phone}</div>
            <div style={{ marginTop: 4 }}>
              <strong>GSTIN:</strong> {shop.gstin}
            </div>
          </div>

          {/* Invoice title + details */}
          <div style={{ textAlign: "right", minWidth: "220px" }}>
            <div style={{
              fontSize: "16px", fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.1em", borderBottom: "2px solid #000",
              paddingBottom: "4px", marginBottom: "8px",
            }}>
              Tax Invoice
            </div>
            <table style={{ marginLeft: "auto", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Invoice No", details.invoiceNo || "—"],
                  ["Date", details.invoiceDate ? new Date(details.invoiceDate).toLocaleDateString("en-IN") : "—"],
                  ["Place of Supply", details.placeOfSupply || "—"],
                  ...(details.transportMode ? [["Transport", details.transportMode]] : []),
                  ...(details.vehicleNumber ? [["Vehicle No", details.vehicleNumber]] : []),
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ textAlign: "right", paddingRight: "6px", color: "#555" }}>{k}:</td>
                    <td style={{ fontWeight: 600 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ borderBottom: "1px solid #000", padding: "8px 16px" }}>
        <div style={{ fontWeight: 700, marginBottom: 4, fontSize: "10px", textTransform: "uppercase", color: "#444" }}>
          Billed To
        </div>
        <div style={{ fontWeight: 700, fontSize: "12px" }}>{billTo.name || <span style={{ color: "#aaa" }}>Customer Name</span>}</div>
        {billTo.address && <div>{billTo.address}</div>}
        {billTo.state && <div>State: {billTo.state}{billTo.stateCode ? ` (${billTo.stateCode})` : ""}</div>}
        {billTo.phone && <div>Ph: {billTo.phone}</div>}
        {billTo.gstin && <div><strong>GSTIN:</strong> {billTo.gstin}</div>}
      </div>

      {/* Items table */}
      <table style={{ width: "100%", borderCollapse: "collapse", borderBottom: "1px solid #000" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #000", background: "#f5f5f5" }}>
            {[
              { label: "S.N.", w: "32px", align: "center" },
              { label: "Description of Goods / Services", w: "auto", align: "left" },
              { label: "HSN/SAC", w: "80px", align: "center" },
              { label: "Qty", w: "44px", align: "center" },
              { label: "Rate", w: "70px", align: "right" },
              { label: "GST%", w: "48px", align: "center" },
              { label: "Taxable", w: "76px", align: "right" },
              { label: "Amount", w: "76px", align: "right" },
            ].map(col => (
              <th
                key={col.label}
                style={{
                  width: col.w,
                  textAlign: col.align as any,
                  padding: "5px 6px",
                  fontWeight: 700,
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  borderRight: "1px solid #ccc",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paddedItems.map((item, idx) => {
            const t = item ? computeItemTotals(item) : null;
            return (
              <tr key={item?.id ?? `empty-${idx}`} style={{ borderBottom: "1px solid #ddd", minHeight: "22px" }}>
                <td style={{ padding: "4px 6px", textAlign: "center", borderRight: "1px solid #ddd", color: item ? "#000" : "transparent" }}>
                  {idx + 1}
                </td>
                <td style={{ padding: "4px 6px", borderRight: "1px solid #ddd" }}>
                  {item?.description || " "}
                </td>
                <td style={{ padding: "4px 6px", textAlign: "center", borderRight: "1px solid #ddd", fontFamily: "monospace" }}>
                  {item?.hsn || " "}
                </td>
                <td style={{ padding: "4px 6px", textAlign: "center", borderRight: "1px solid #ddd" }}>
                  {item ? item.qty : " "}
                </td>
                <td style={{ padding: "4px 6px", textAlign: "right", borderRight: "1px solid #ddd" }}>
                  {t ? fmt(item!.rate) : " "}
                </td>
                <td style={{ padding: "4px 6px", textAlign: "center", borderRight: "1px solid #ddd" }}>
                  {item ? `${item.gstRate}%` : " "}
                </td>
                <td style={{ padding: "4px 6px", textAlign: "right", borderRight: "1px solid #ddd" }}>
                  {t ? fmt(t.taxable) : " "}
                </td>
                <td style={{ padding: "4px 6px", textAlign: "right" }}>
                  {t ? fmt(t.amount) : " "}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary section */}
      <div style={{ display: "flex", borderBottom: "1px solid #000" }}>
        {/* Amount in words */}
        <div style={{ flex: 1, padding: "8px 12px", borderRight: "1px solid #000" }}>
          <div style={{ fontWeight: 700, marginBottom: 3, fontSize: "10px" }}>Total Amount In Words:</div>
          <div style={{ fontStyle: "italic", textTransform: "uppercase", fontSize: "10px", lineHeight: 1.5 }}>
            {totals.grandTotal > 0 ? numberToWords(totals.grandTotal) : "—"}
          </div>
        </div>

        {/* Tax summary */}
        <div style={{ minWidth: "220px" }}>
          {[
            { label: "Taxable Amount", val: totals.totalTaxable, bold: false },
            { label: `CGST`, val: totals.totalCGST, bold: false },
            { label: `SGST`, val: totals.totalSGST, bold: false },
            { label: "Grand Total", val: totals.grandTotal, bold: true },
          ].map(({ label, val, bold }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "4px 10px",
                borderBottom: "1px solid #ddd",
                fontWeight: bold ? 800 : 400,
                fontSize: bold ? "12px" : "11px",
                background: bold ? "#f5f5f5" : "transparent",
              }}
            >
              <span>{label}</span>
              <span style={{ fontFamily: "monospace" }}>{fmt(val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px" }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: "10px" }}>Terms &amp; Conditions:</div>
          <ol style={{ paddingLeft: "14px", margin: 0, color: "#444", fontSize: "10px" }}>
            <li>Goods once sold will not be taken back or exchanged.</li>
            <li>Interest @18% p.a. will be charged if payment is delayed.</li>
            <li>Subject to local jurisdiction only.</li>
          </ol>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, marginBottom: "32px" }}>For {shop.name}</div>
          <div style={{ borderTop: "1px solid #000", paddingTop: "4px", paddingLeft: "16px", paddingRight: "16px" }}>
            Authorized Signatory
          </div>
        </div>
      </div>

      {/* Computer generated notice */}
      <div style={{ textAlign: "center", padding: "4px 0 8px", color: "#888", fontSize: "9px", borderTop: "1px solid #eee" }}>
        This is a computer generated invoice.
      </div>
    </div>
  );
}
