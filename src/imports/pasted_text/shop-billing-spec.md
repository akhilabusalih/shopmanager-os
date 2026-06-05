SHOP MANAGEMENT & BILLING SOFTWARE

PRODUCT DESIGN SPECIFICATION FOR FIGMA AI

========================================================
PROJECT OVERVIEW
================

Design a complete desktop-style Shop Management & Billing Software application intended for real-world small business usage.

This application is NOT:

* SaaS software
* Analytics dashboard
* Startup admin panel
* Social application

This application IS:

* Billing software
* POS software
* Shop management software
* Customer management software
* Invoice generation system
* Desktop business operating console

The application will be developed using:

* Python
* Streamlit
* SQLite
* HTML invoice templates
* Jinja2 rendering

The design should feel like professional business software rather than a modern web application.

========================================================
TARGET USERS
============

Primary Users:

* Shop owners
* Store managers
* Cashiers
* Office staff

Many users may not be highly technical.

Therefore:

Design must prioritize:

* Readability
* Simplicity
* Obvious workflows
* Fast operation
* Minimal learning curve
* Clear navigation
* Strong visual hierarchy

Avoid:

* Tiny text
* Hidden interactions
* Overly complex navigation
* Trendy UI patterns
* Excessive animations

The user should understand the software within minutes.

========================================================
VISUAL DESIGN PHILOSOPHY
========================

The application should feel similar to:

* POS terminals
* Billing software
* ERP systems
* Industrial software
* Car infotainment systems

The interface should feel:

* Reliable
* Professional
* Fast
* Organized
* Business focused

NOT flashy.

NOT experimental.

NOT futuristic.

========================================================
COLOR SYSTEM
============

Use:

* Light theme
* Neutral background
* White cards
* Soft gray borders
* Dark readable text
* Blue/Indigo primary actions

Status Colors:

Green:
Success

Red:
Delete / Critical

Orange:
Warning

Blue:
Primary actions

Avoid:

* Neon colors
* Heavy gradients
* Low contrast text

========================================================
TYPOGRAPHY
==========

Prioritize readability.

Headings:
Large and bold

Section titles:
Medium and bold

Body text:
Readable

Table content:
Readable without zooming

Do not use tiny SaaS-style typography.

========================================================
APPLICATION FLOW
================

Login
↓
Dashboard
↓
Customers
Billing
Products
Invoice History
Settings

========================================================
LOGIN PAGE
==========

Create a dedicated login screen.

Features:

* Application logo
* Shop Management Software title
* Username field
* Password field
* Login button

Optional:

* Remember Me

The screen should resemble:

Business software startup screen

NOT website login.

========================================================
HOME DASHBOARD
==============

This acts as an application launcher.

NO sidebar navigation.

Layout:

Large module tiles.

Modules:

1. Customers
2. Billing
3. Products
4. Invoice History
5. Settings

Each tile contains:

* Icon
* Module Name
* Short Description

Example:

Customers
Manage customer records

Billing
Create invoices and receipts

Products
Manage inventory and pricing

Invoice History
View previous invoices

Settings
Configure business preferences

Also include:

Recent Invoices Panel

Showing:

* Invoice Number
* Customer
* Date
* Amount

Dashboard should feel like a business operating system.

========================================================
CUSTOMERS MODULE
================

Purpose:

Manage customer database.

Layout:

Customer list occupies most of screen.

Top Bar:

* Search Customer
* Add Customer

Customer Table Columns:

* Customer Name
* Phone Number
* GSTIN

Actions:

View
Edit

When View is clicked:

Right-side slide panel opens.

Shows:

* Customer Name
* Phone Number
* GSTIN
* Address
* State
* State Code

Read-only mode.

When Edit is clicked:

Same panel opens in editable mode.

Add Customer:

Opens empty form panel.

Design should resemble ERP customer management.

========================================================
BILLING MODULE
==============

MOST IMPORTANT SCREEN

Purpose:

Generate invoices and receipts.

Layout:

Split Screen.

LEFT SIDE

Invoice Creation Form

RIGHT SIDE

Live Invoice Preview

========================================================
LEFT BILLING PANEL
==================

Invoice Information

* Invoice Number
* Invoice Date
* Place Of Supply
* Transport Mode
* Vehicle Number
* Supply Date Time

Customer Information

* Select Customer

Auto fill:

* Address
* GSTIN
* State
* State Code

========================================================
PRODUCT ENTRY SECTION
=====================

Table Columns:

* Product Description
* HSN Code
* Quantity
* Rate
* Taxable Value
* Amount

Actions:

* Add Product Row
* Remove Product Row

GST Section:

* CGST
* SGST
* Grand Total

Amount In Words

========================================================
INVOICE OUTPUT OPTIONS
======================

Support two formats.

A4 GST Invoice

Thermal Receipt

User should be able to switch between:

A4 Preview
Thermal Preview

without recreating invoice.

========================================================
A4 GST INVOICE PREVIEW
======================

Reference:

Attached GST Invoice HTML Template.

The preview should visually match:

* Typography
* Layout
* Professional appearance
* Print orientation

This invoice is used for:

Business customers
GST customers

========================================================
THERMAL RECEIPT PREVIEW
=======================

Reference:

Attached Thermal Receipt Template.

Printer Type:

80mm Thermal Printer

The preview should resemble real POS receipts.

Contains:

* Shop Name
* GSTIN
* Invoice Number
* Customer
* Products
* Taxes
* Grand Total
* Amount In Words

Used for:

Retail customers
Walk-in sales

========================================================
PRODUCTS MODULE
===============

Purpose:

Inventory Management

Top Bar:

* Search Product
* Add Product

Table Columns:

* Product Name
* HSN Code
* Price
* Stock Quantity

Actions:

View
Edit
Delete

Product Detail Panel:

* Product Name
* HSN Code
* Selling Price
* GST Rate
* Current Stock

========================================================
INVOICE HISTORY MODULE
======================

Purpose:

View historical invoices.

Top Bar:

* Search
* Date Range Filter
* Customer Filter

Table Columns:

* Invoice Number
* Customer
* Date
* Amount
* Type

Type:

A4 Invoice
Thermal Receipt

Actions:

* View
* Reprint
* Download PDF

========================================================
SETTINGS MODULE
===============

Settings use left navigation menu.

Sections:

1. Shop Information
2. GST Information
3. Invoice Preferences
4. Print Settings
5. Invoice Templates
6. Branding
7. Payment Information
8. Administrator
9. Backup & Restore
10. Advanced

========================================================
SHOP INFORMATION
================

Fields:

* Business Name
* Owner Name
* Phone Number
* Alternate Phone
* Email
* Address

========================================================
GST INFORMATION
===============

Fields:

* GSTIN
* PAN
* State
* State Code

========================================================
INVOICE PREFERENCES
===================

Fields:

* Invoice Prefix
* Terms And Conditions
* Bank Details

========================================================
PRINT SETTINGS
==============

Fields:

* Default Paper Size
* A4
* Thermal

Options:

* Auto Print
* Ask Before Printing

========================================================
INVOICE TEMPLATE MANAGEMENT
===========================

Allow:

Upload A4 Invoice Template

Preview Template

Restore Default

Upload Thermal Template

Preview Template

Restore Default

This is an important feature.

========================================================
BRANDING
========

Allow:

Upload Company Logo

Upload Signature

Upload Company Stamp

Preview Branding

========================================================
PAYMENT INFORMATION
===================

Fields:

* Bank Name
* Account Number
* IFSC
* UPI ID
* QR Code Upload

========================================================
ADMINISTRATOR
=============

Fields:

* Username
* Change Password

Security Options:

* Require Password On Startup
* Auto Lock Application

Auto Lock Options:

* Never
* 5 Minutes
* 10 Minutes
* 15 Minutes
* 30 Minutes

========================================================
BACKUP & RESTORE
================

Actions:

* Create Backup
* Restore Backup
* Export Customers
* Export Products
* Export Invoices

========================================================
ADVANCED
========

Actions:

* Reset Application Settings
* Restore Default Templates
* System Information

========================================================
DESIGN OBJECTIVE
================

The final application should feel like:

A professional billing terminal used daily by real businesses.

It should feel trustworthy, efficient, easy to learn, and optimized for operational speed.

The user should be able to perform billing, customer management, inventory management, invoice printing, and system configuration without confusion.

The design should prioritize workflow and usability over visual trends.
