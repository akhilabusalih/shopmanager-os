"""
ShopManager OS — GST Rate Constants

Purpose:
    Defines the valid GST (Goods and Services Tax) rates for India.
    Used for validation across the backend.

Responsibilities:
    - Provide the list of legally valid Indian GST rates
    - Serve as the single reference for GST rate validation

Notes:
    As of the GST Act 2017, Indian GST slabs are:
    - 0%  — Essential goods (food, medicine, etc.)
    - 5%  — Basic necessities
    - 12% — Standard goods
    - 18% — Most goods and services (most common rate)
    - 28% — Luxury goods and services

    GST rate changes are infrequent but do happen.
    If the government adds new rates, update this file and the validator.
"""

# Valid Indian GST rate slabs as percentages
# Source: CGST Act, 2017 and subsequent notifications
VALID_GST_RATES = {0, 5, 12, 18, 28}

# Default GST rate applied when no rate is specified
DEFAULT_GST_RATE = 18

# GST rate labels for display purposes
GST_RATE_LABELS = {
    0: "0% — Exempt",
    5: "5% — Essential Goods",
    12: "12% — Standard Goods",
    18: "18% — General Goods & Services",
    28: "28% — Luxury Goods",
}
