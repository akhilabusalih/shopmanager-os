Design a complete UI/UX system for a desktop-style Shop Management & Billing Software application intended for small business/shop owners.

IMPORTANT:
This is NOT a SaaS analytics dashboard or startup admin panel.

The application should feel like:

* ERP software
* POS terminal software
* billing/invoicing desktop software
* business operating console
* professional accounting application

The software is primarily used by older/non-technical shop operators.

Therefore the UI must prioritize:

* readability
* clarity
* obvious navigation
* workflow simplicity
* medium-sized interface elements
* low cognitive load
* strong visibility
* operational efficiency

Avoid:

* flashy startup aesthetics
* social media design patterns
* excessive gradients
* tiny typography
* ultra-minimal interfaces
* hidden navigation
* overly dense enterprise layouts
* analytics-heavy dashboards

The software should feel:

* calm
* professional
* reliable
* approachable
* business-oriented
* operationally efficient

---

## OVERALL APPLICATION CONCEPT

This application is a modular business operating system.

Navigation should feel similar to:

* modern car infotainment systems
* POS machine launchers
* desktop software launchers
* operating-system style tile interfaces

The application should NOT use:

* sidebar-heavy layouts
* web-style navigation systems

Instead:
The application opens into a launcher/dashboard containing large module tiles.

Each tile opens a dedicated module page.

The software should feel more like an installed business application rather than a normal website.

---

## VISUAL STYLE

Design Style:

* Modern professional ERP/POS system
* Clean business software
* Medium-density layout
* Compact but breathable spacing
* Subtle depth/shadows
* Rounded corners
* Strong visual hierarchy

Typography:

* Clear sans-serif fonts
* Medium-large readability
* Bold section titles
* High contrast
* No ultra-thin typography

Typography Sizing:

* Main headings: medium-large
* Section titles: clear and bold
* Table text: readable without zooming
* Labels: obvious and understandable

Spacing:

* Efficient usage of screen space
* Avoid excessive empty whitespace
* Avoid clutter
* Balance readability and information density

---

## COLOR SYSTEM

The UI should use a professional and highly readable color palette.

Recommended:

* soft neutral background
* white or slightly tinted panels/cards
* dark slate text
* blue/indigo accent colors
* subtle borders
* strong readability contrast

Avoid:

* neon colors
* flashy gradients
* cyberpunk aesthetics
* low-contrast gray-on-gray UI

The application should feel:

* trustworthy
* clean
* stable
* calm
* productivity-oriented

---

## TARGET USER EXPERIENCE

The user should instantly understand:

* where to click
* what each module does
* what each button performs

Every interaction should feel:

* obvious
* predictable
* intuitive

Buttons and modules should include:

* icon
* title
* short descriptive subtitle

Example:
👥 Customers
Manage customer records

NOT icon-only interfaces.

Avoid requiring the user to “learn” the interface.

The interface should feel approachable even to users with limited technical experience.

---

## APPLICATION FLOW

The application flow is:

1. Login Page
2. Main Launcher Dashboard
3. Individual Modules

Modules:

* Customers
* Billing
* Products
* Invoice History
* Settings

---

## LOGIN PAGE

Design a professional but minimal login screen.

Requirements:

* centered login card
* business software feel
* calm and clean interface
* medium-sized form fields
* clear labels
* remember/login button
* optional logo area

The login screen should resemble:

* POS terminal login
* ERP software login
* professional desktop software startup screen

NOT:

* social media login
* startup landing page
* modern SaaS onboarding

---

## MAIN DASHBOARD / HOME SCREEN

The home screen acts as a module launcher.

NO sidebar navigation.

Layout:

* centered or balanced dashboard
* large clickable module tiles/cards
* recent invoice section
* optional small business metrics
* clear module grouping

Modules:

1. Customers
2. Billing
3. Products
4. Invoice History
5. Settings

Each module tile should contain:

* icon
* module name
* short description
* hover interaction
* clear clickability

The dashboard should resemble:

* infotainment launcher systems
* ERP launchers
* operating system tile interfaces

NOT analytics dashboards.

---

## CUSTOMERS MODULE

Design a customer management interface using split-panel architecture.

DEFAULT STATE:

* full-width customer table/list

WHEN USER CLICKS VIEW OR EDIT:

* right-side customer detail panel opens

Layout:
LEFT SIDE:

* customer list
* search bar
* add customer button
* action buttons/icons

RIGHT SIDE:

* customer details panel
* editable customer form

Customer Fields:

* Customer Name
* Phone Number
* Address
* State
* State Code
* GSTIN

Interactions:

* Add Customer opens empty form panel
* View opens read-only panel
* Edit opens editable panel

Design Goals:

* compact but readable table
* obvious actions
* professional ERP feel
* efficient customer workflow

The page should resemble:

* CRM software
* ERP customer management
* billing customer records

---

## BILLING MODULE

This is the core module of the application.

Design a professional invoice generation interface.

The layout should use:
SPLIT SCREEN DESIGN

LEFT SIDE:
Invoice creation workflow

RIGHT SIDE:
Live invoice preview

The right-side invoice preview should visually resemble a real printable GST invoice.

IMPORTANT:
The invoice preview is powered by an HTML invoice template.
The provided invoice template should strongly influence:

* typography
* spacing
* professionalism
* layout structure
* print-oriented design language

The invoice preview must feel:

* accounting-grade
* professional
* printable
* document-oriented

---

## BILLING FORM FEATURES

The left-side billing form should include:

Invoice Information:

* Invoice Number
* Invoice Date
* Place of Supply
* Transportation Mode
* Vehicle Number
* Supply Date & Time

Customer Selection:

* Select existing customer
* Auto-fill customer information

Product Entry Table:
Columns:

* Product Description
* HSN Code
* Quantity
* Rate
* Taxable Value
* Amount

Billing Features:

* Add product row
* Remove row
* GST calculation
* CGST
* SGST
* Invoice total
* Total in words

Buttons:

* Save Invoice
* Print Invoice
* Generate PDF

The billing screen should resemble:

* GST billing software
* accounting software
* ERP invoicing systems

---

## PRODUCTS MODULE

Design a products/inventory management page.

Features:

* products table
* stock quantity
* pricing
* HSN codes
* add/edit/delete products

Possible layout:

* table-based inventory management
* optional side detail panel

The module should resemble:

* inventory management software
* POS inventory systems

---

## INVOICE HISTORY MODULE

Design an invoice history management page.

Features:

* searchable invoice list
* filters
* date range
* customer search
* invoice reopening
* print/reprint functionality

The interface should resemble:

* accounting ledger systems
* ERP invoice history modules

---

## SETTINGS MODULE

Design a structured settings page.

Sections:

* Shop Information
* GST Information
* Invoice Preferences
* Terms & Conditions
* Signature Settings
* Print Settings

The settings UI should feel:

* organized
* easy to understand
* configuration-oriented
* professional

---

## RESPONSIVE BEHAVIOR

The application is primarily optimized for:

* desktop usage
* laptop usage

The interface should maximize screen usage efficiently.

Avoid:

* excessive margins
* wasted whitespace
* oversized accessibility layouts

Use:

* medium-sized interface density
* efficient but readable spacing

---

## IMPORTANT UX GOALS

The application should feel:

* intuitive
* efficient
* professional
* approachable
* workflow-oriented

The user should never feel overwhelmed.

Every module should communicate:

* what it does
* what actions are available
* what the next step is

The software should feel like:

* a reliable business tool
* a professional billing system
* a desktop operational application

NOT:

* a startup SaaS website
* a social platform
* an analytics dashboard

---

## REFERENCE CONTEXT

An HTML invoice template is provided separately.

The entire design system should visually align with:

* that invoice template
* its typography
* spacing
* professionalism
* accounting-document feel

The UI system should feel cohesive with the invoice design language.
