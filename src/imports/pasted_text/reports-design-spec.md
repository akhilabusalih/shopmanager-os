REPORTS PAGE DESIGN SPECIFICATION

PURPOSE

The Reports module is the central location for viewing detailed business records, generating printable reports, and exporting business data.

This page is NOT an Analytics page.

Analytics focuses on charts, trends, comparisons, and business insights.

Reports focuses on detailed records, tabular data, filtering, searching, printing, and exporting.

The Reports page should feel like a professional business reporting center used by shop owners, accountants, and administrators.

==================================================
OVERALL LAYOUT
==============

The page should use a two-section structure.

TOP SECTION

Report Category Selection Area

BOTTOM SECTION

Selected Report Content

The page should not show all reports at once.

The user should first select a report category and then view the corresponding report.

==================================================
TOP HEADER
==========

Page Title:

Reports

Subtitle:

Generate, view, print, and export business reports.

Right Side Actions:

* Export
* Print
* Refresh

==================================================
QUICK REPORT CARDS
==================

Directly below the header show summary cards.

These provide a quick overview before opening reports.

Cards:

Total Sales
Total Invoices
Total Customers
Total Products
GST Collected
Average Invoice Value

Each card should show:

* Title
* Value
* Small supporting information

Example:

Total Sales
₹ 2,45,000

Last 30 Days

==================================================
REPORT CATEGORY SECTION
=======================

Display large report category cards.

Categories:

Sales Reports
Customer Reports
Product Reports
Invoice Reports
GST Reports
Export Center

Each card should contain:

Icon
Title
Short Description

Example:

Sales Reports

View sales records by date, customer, and invoice.

==================================================
SALES REPORTS
=============

Purpose:

View detailed sales activity.

Filters:

From Date
To Date

Customer Filter

Invoice Number Filter

Generate Report Button

Result Table:

Invoice Number
Date
Customer
Items
Taxable Amount
GST Amount
Grand Total

Footer Summary:

Total Invoices

Total Taxable Amount

Total GST Collected

Total Revenue

Actions:

Print Report

Export PDF

Export Excel

==================================================
CUSTOMER REPORTS
================

Purpose:

View customer purchasing information.

Filters:

Customer Name

Date Range

Generate Report

Result Table:

Customer Name
Phone Number
Invoices
Total Purchase Amount
Last Purchase Date

Selecting a customer should open:

Customer Purchase Summary

Contents:

Customer Information

Total Purchases

Total Invoices

Average Invoice Value

Last Purchase Date

Purchase History Table

Actions:

Print

Export

==================================================
PRODUCT REPORTS
===============

Purpose:

Analyze product performance.

Filters:

Product Name

Category

Date Range

Generate Report

Result Table:

Product Name

Quantity Sold

Revenue Generated

GST Collected

Last Sold Date

Additional Sections:

Top Selling Products

Slow Moving Products

Recently Added Products

Actions:

Print

Export PDF

Export Excel

==================================================
INVOICE REPORTS
===============

Purpose:

Search and retrieve invoice records.

Filters:

Invoice Number

Customer

Date Range

Invoice Status

Generate Report

Result Table:

Invoice Number

Date

Customer

Taxable Amount

GST Amount

Total Amount

Actions Column:

View Invoice

Download PDF

Print Invoice

Report Summary:

Total Invoices

Total Revenue

==================================================
GST REPORTS
===========

Purpose:

Tax reporting and GST tracking.

Filters:

Date Range

GST Rate

Generate Report

Summary Cards:

Taxable Value

CGST Collected

SGST Collected

IGST Collected

Detailed Table:

GST Rate

Taxable Amount

GST Amount

Number of Invoices

GST Breakdown:

5%

12%

18%

28%

Actions:

Print GST Report

Export GST PDF

Export GST Excel

==================================================
EXPORT CENTER
=============

Purpose:

Provide a centralized export location.

Available Exports:

Customer Database

Product Database

Invoice Database

Sales Report

GST Report

Configuration Backup

Available Formats:

PDF

Excel

CSV

Buttons:

Download

Generate Export

==================================================
TABLE DESIGN
============

All reports should use consistent table layouts.

Requirements:

Sticky Header Row

Sortable Columns

Search Field

Pagination

Row Selection

Export Selected Rows

Print Selected Rows

Tables should prioritize readability over visual effects.

==================================================
REPORT FILTER BAR
=================

Every report should contain a filter section.

Possible Controls:

Date Range

Customer

Product

Invoice Number

GST Rate

Status

Apply Filters

Reset Filters

==================================================
EMPTY STATES
============

If no records exist:

Show friendly message.

Example:

No records found for the selected filters.

Provide:

Clear Filters Button

==================================================
EXPORT BEHAVIOR
===============

Every report should support:

Print

PDF Export

Excel Export

CSV Export

Export options should always be visible within the report view.

==================================================
DESIGN OBJECTIVE
================

The Reports page should function as a business reporting center.

The primary purpose is:

* Viewing records
* Filtering records
* Printing reports
* Exporting reports

Focus on clarity, readability, and business workflows.

Avoid excessive charts, dashboards, or analytics-focused layouts.

The Reports module should feel structured, professional, and useful for day-to-day business operations.
