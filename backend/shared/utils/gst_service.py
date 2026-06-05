"""
ShopManager OS — GST Calculation Service

Purpose:
    Centralizes all GST (Goods and Services Tax) calculations for India.
    This is the ONLY place in the entire backend where GST math is performed.

Responsibilities:
    - Calculate taxable amount, CGST, SGST, and total for individual line items
    - Aggregate invoice-level GST totals from all line items
    - Validate GST rates
    - Round amounts correctly (2 decimal places, as required by Indian GST rules)

Dependencies:
    - backend.shared.constants.gst_rates

Usage:
    from backend.shared.utils.gst_service import GSTService

    # Calculate per-line item
    totals = GSTService.compute_item_totals(qty=2, rate=500.00, gst_rate=18)
    # Returns: ItemGSTTotals(taxable_amt=1000.00, cgst_amt=90.00, sgst_amt=90.00, total_amt=1180.00)

    # Calculate invoice totals
    invoice_totals = GSTService.compute_invoice_totals(items)

Notes:
    CGST and SGST Philosophy:
    - For intra-state supply (seller and buyer in same state): CGST + SGST applies.
    - Each is exactly HALF of the total GST amount.
    - Example: 18% GST = 9% CGST + 9% SGST

    IGST Philosophy (future):
    - For inter-state supply: IGST applies (full GST rate).
    - V1 assumes all sales are intra-state (CGST + SGST only).

    Rounding Rules:
    - Per GST rules, amounts are rounded to 2 decimal places.
    - We use Python's built-in round() which uses banker's rounding.
    - This is acceptable for business invoicing purposes.

    WHY centralize here?
    - Prevents different modules from having slightly different formulas.
    - Makes testing easier (single place to verify math).
    - Future GST rule changes only require changes in this file.
"""

from decimal import Decimal, ROUND_HALF_UP
from dataclasses import dataclass
from typing import List

from backend.shared.constants.gst_rates import VALID_GST_RATES


@dataclass
class ItemGSTTotals:
    """
    Holds computed GST totals for a single invoice line item.

    All amounts are in Indian Rupees (INR), rounded to 2 decimal places.
    """
    taxable_amt: float   # qty × rate (before GST)
    cgst_amt: float      # Half of total GST (for intra-state supply)
    sgst_amt: float      # Half of total GST (for intra-state supply)
    total_amt: float     # taxable_amt + cgst_amt + sgst_amt


@dataclass
class InvoiceGSTTotals:
    """
    Holds aggregated GST totals for an entire invoice.

    All amounts are in Indian Rupees (INR), rounded to 2 decimal places.
    """
    total_taxable: float  # Sum of all line item taxable amounts
    total_cgst: float     # Sum of all line item CGST amounts
    total_sgst: float     # Sum of all line item SGST amounts
    grand_total: float    # total_taxable + total_cgst + total_sgst


def _round_inr(amount: float) -> float:
    """
    Rounds a monetary amount to 2 decimal places using ROUND_HALF_UP.

    WHY ROUND_HALF_UP instead of Python's default banker's rounding?
    - Indian GST invoices conventionally use standard rounding (0.5 rounds up).
    - Using Decimal with ROUND_HALF_UP ensures consistent results.
    - Banker's rounding can cause unexpected results (e.g., 0.5 → 0 instead of 1).

    @param amount: The amount to round.
    @returns float: Amount rounded to 2 decimal places.
    """
    return float(Decimal(str(amount)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


class GSTService:
    """
    Static service class for all GST calculations.

    All methods are static — no instance needed.
    """

    @staticmethod
    def validate_gst_rate(gst_rate: float) -> None:
        """
        Validates that the provided GST rate is a legally valid Indian GST rate.

        Valid rates as of 2024: 0%, 5%, 12%, 18%, 28%

        @param gst_rate: The GST rate to validate (e.g., 18 for 18%)
        @raises ValueError: If the rate is not a valid GST rate.
        """
        if gst_rate not in VALID_GST_RATES:
            raise ValueError(
                f"Invalid GST rate: {gst_rate}%. "
                f"Valid rates are: {', '.join(str(r) + '%' for r in VALID_GST_RATES)}"
            )

    @staticmethod
    def compute_item_totals(qty: float, rate: float, gst_rate: float) -> ItemGSTTotals:
        """
        Calculates GST amounts for a single invoice line item.

        Formula:
            taxable_amt = qty × rate
            gst_amount  = taxable_amt × (gst_rate / 100)
            cgst_amt    = gst_amount / 2   (half for CGST)
            sgst_amt    = gst_amount / 2   (half for SGST)
            total_amt   = taxable_amt + gst_amount

        WHY split GST into CGST and SGST?
            Indian GST law requires intra-state invoices to show CGST and SGST
            separately. Each is exactly half of the total GST.

        @param qty: Quantity sold (can be fractional, e.g., 1.5 kg)
        @param rate: Price per unit in INR (before GST)
        @param gst_rate: GST rate as a percentage (e.g., 18 for 18%)
        @returns ItemGSTTotals: Computed amounts for this line item
        """
        # Step 1: Calculate taxable amount (value before GST)
        taxable_amt = qty * rate

        # Step 2: Calculate total GST on this line item
        # Example: 1000 × (18/100) = 180
        gst_amount = taxable_amt * (gst_rate / 100)

        # Step 3: Split GST equally between CGST and SGST
        # Example: 180 / 2 = 90 CGST + 90 SGST
        cgst_amt = gst_amount / 2
        sgst_amt = gst_amount / 2

        # Step 4: Total amount including GST
        total_amt = taxable_amt + gst_amount

        # Step 5: Round all amounts to 2 decimal places
        return ItemGSTTotals(
            taxable_amt=_round_inr(taxable_amt),
            cgst_amt=_round_inr(cgst_amt),
            sgst_amt=_round_inr(sgst_amt),
            total_amt=_round_inr(total_amt),
        )

    @staticmethod
    def compute_invoice_totals(item_totals: List[ItemGSTTotals]) -> InvoiceGSTTotals:
        """
        Aggregates GST totals from all line items into invoice-level totals.

        WHY aggregate at invoice level?
        - GST returns and reports use invoice-level totals.
        - Avoids rounding discrepancies from summing pre-rounded individual items.

        @param item_totals: List of computed totals for each line item.
        @returns InvoiceGSTTotals: Aggregated totals for the entire invoice.
        """
        total_taxable = sum(item.taxable_amt for item in item_totals)
        total_cgst = sum(item.cgst_amt for item in item_totals)
        total_sgst = sum(item.sgst_amt for item in item_totals)
        grand_total = total_taxable + total_cgst + total_sgst

        return InvoiceGSTTotals(
            total_taxable=_round_inr(total_taxable),
            total_cgst=_round_inr(total_cgst),
            total_sgst=_round_inr(total_sgst),
            grand_total=_round_inr(grand_total),
        )
