"""
ShopManager OS — GSTIN Validator

Purpose:
    Validates Indian GSTIN (Goods and Services Tax Identification Number) format.
    Used across customer creation and invoice generation.

Responsibilities:
    - Validate GSTIN structure and format
    - Extract state code from GSTIN
    - Validate PAN embedded in GSTIN

GSTIN Format (15 characters):
    Position  1-2  : State Code (01–37, numeric)
    Position  3-12 : PAN Number (10 characters: AAAAA9999A format)
    Position    13 : Entity Number (1–9 or A–Z)
    Position    14 : Always "Z"
    Position    15 : Check digit (0–9 or A–Z)

    Example: 29AADCB2230M1Z2
        - State Code: 29 (Karnataka)
        - PAN: AADCB2230M
        - Entity: 1
        - Z: always Z
        - Check: 2

Usage:
    from backend.shared.validators.gstin_validator import validate_gstin, extract_state_code

    is_valid = validate_gstin("29AADCB2230M1Z2")  # → True
    state_code = extract_state_code("29AADCB2230M1Z2")  # → "29"
"""

import re
from typing import Optional

# GSTIN regex pattern
# Breaking it down:
# [0-9]{2}    → State code (2 digits, 01–37)
# [A-Z]{5}    → First 5 chars of PAN (letters)
# [0-9]{4}    → Middle 4 chars of PAN (digits)
# [A-Z]{1}    → Last char of PAN (letter)
# [1-9A-Z]{1} → Entity number (1–9 or A–Z)
# Z           → Always the letter Z
# [0-9A-Z]{1} → Check digit (0–9 or A–Z)
GSTIN_PATTERN = re.compile(
    r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
)

# Valid Indian state codes as of 2024
VALID_STATE_CODES = {
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
    "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
    "31", "32", "33", "34", "35", "36", "37",
}

STATE_CODE_NAMES = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
    "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
    "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
    "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
    "16": "Tripura", "17": "Meghalaya", "18": "Assam",
    "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
    "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
    "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra",
    "28": "Andhra Pradesh (old)", "29": "Karnataka", "30": "Goa",
    "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
    "34": "Puducherry", "35": "Andaman & Nicobar Islands", "36": "Telangana",
    "37": "Andhra Pradesh",
}


def validate_gstin(gstin: str) -> bool:
    """
    Validates that a GSTIN string matches the correct format.

    Checks:
    1. Length is exactly 15 characters
    2. Matches the GSTIN regex pattern
    3. State code is a valid Indian state code

    @param gstin: The GSTIN string to validate (uppercase, no spaces)
    @returns bool: True if valid, False if invalid
    """
    if not gstin or not isinstance(gstin, str):
        return False

    # Normalize to uppercase and strip whitespace
    gstin = gstin.strip().upper()

    # Check length
    if len(gstin) != 15:
        return False

    # Check format against regex
    if not GSTIN_PATTERN.match(gstin):
        return False

    # Check state code is valid
    state_code = gstin[:2]
    if state_code not in VALID_STATE_CODES:
        return False

    return True


def extract_state_code(gstin: str) -> Optional[str]:
    """
    Extracts the 2-digit state code from a GSTIN.

    @param gstin: A valid GSTIN string
    @returns str: The 2-digit state code, or None if GSTIN is invalid
    """
    if not validate_gstin(gstin):
        return None
    return gstin[:2].strip().upper()


def get_state_name(gstin: str) -> Optional[str]:
    """
    Returns the state name corresponding to the state code in a GSTIN.

    @param gstin: A valid GSTIN string
    @returns str: The state name, or None if not found
    """
    state_code = extract_state_code(gstin)
    if not state_code:
        return None
    return STATE_CODE_NAMES.get(state_code)
