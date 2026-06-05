<div align="center">

<img src="docs/screenshots/logo.png" alt="ShopManager OS Logo" width="96" height="96" />

# ShopManager OS

**Open-source POS & Shop Management Software for Indian Retail Businesses**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

[Features](#-features) · [Screenshots](#-screenshots) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Roadmap](#-roadmap) · [Contributing](#-contributing)

</div>

---

## Overview

**ShopManager OS** is a production-grade, self-hosted **POS system** and **shop management software** purpose-built for Indian retail businesses. It handles the full retail workflow — from product catalog and **GST-compliant invoice generation** (CGST/SGST/IGST) to **inventory management**, **customer management**, **sales analytics**, and **GST reporting** — all from a single, offline-capable desktop application.

Built on a modern async full-stack: a **FastAPI** REST backend with **PostgreSQL** and a **React 18** frontend served by **Vite**, ShopManager OS is designed to run locally on a shop's own hardware, keeping all business data private and fully under the owner's control.

> **Designed for India.** Implements Indian GST rules precisely — CGST/SGST split for intra-state supply, IGST for inter-state, valid HSN codes per line item, GSTIN format validation for all 37 state codes, and `ROUND_HALF_UP` decimal rounding as required by GST invoicing standards.

---

## ✨ Features

### 🧾 GST Billing & Invoice Management
- Create GST-compliant invoices with automatic CGST/SGST (intra-state) and IGST (inter-state) split
- HSN code support per line item with configurable GST rates (0%, 5%, 12%, 18%, 28%)
- Auto-sequential invoice numbering with customizable prefix (e.g., `INV-00001`)
- Invoice templates: **A4** and **80mm thermal printer** formats using Jinja2 HTML rendering
- Invoice cancellation with automatic stock restoration and inventory log entry
- CSV export of invoice history with date range and status filters
- Print-ready HTML rendering served directly from the API (`/invoices/{id}/html`)

### 📦 Inventory Management
- Real-time stock tracking per product with automatic deduction on invoice creation
- Full **inventory audit log** (`INVOICE_CREATED`, `INVOICE_CANCELLED`, `MANUAL_ADJUSTMENT`) with qty before/after
- Low stock threshold configuration per business
- Stock restoration on invoice cancellation (transactional, with log entry)

### 👥 Customer Management
- Customer CRM with name, phone, email, address, city, state, pincode
- **GSTIN validation** — full 15-character format check including regex pattern, PAN structure, and all 37 valid Indian state codes
- Automatic state name resolution from GSTIN state code
- Customer snapshot saved on each invoice (preserves billing record even if customer is later edited)
- Customer purchase history linkage via optional `customer_id` on invoices

### 🛒 Product Catalog
- Product catalog with name, HSN code, price, stock quantity, unit, and default GST rate
- Products link directly into billing — selecting a product auto-fills HSN, rate, and GST rate
- Products survive invoice deletion (soft FK with `SET NULL`)

### 📊 Sales Analytics Dashboard
- Top-level KPI summary: total revenue, invoice count, tax collected, customer count
- **Sales trend** over configurable time periods
- **Top-selling products** by quantity and revenue
- **Top customers** by total spend
- **GST breakdown summary**: total CGST, SGST, IGST, and taxable amounts

### 📋 GST Reports
- Paginated GST transaction register with per-invoice CGST/SGST/IGST breakdown
- **CSV export** of GST report for filing returns

### ⚙️ Application Settings
- Shop profile: business name, owner, address, phone, email
- GST settings: GSTIN, PAN, state, state code
- Invoice settings: prefix, starting number, T&C text, signature, bank details, UPI ID
- Print settings: default output (A4/thermal), thermal paper width, print behavior
- Branding: logo URL, signature image, stamp image
- Security: username, auto-lock timer, startup password requirement

### 💾 Data Backup & Restore
- Full JSON backup of all application data (settings, templates, customers, products, invoices, inventory log)
- One-click restore from a backup file with version validation and atomic transaction rollback on failure
- Compatible backup format versioning (`backup_version: "1.0"`)

### 🔐 Authentication & Security
- JWT Bearer token authentication (HS256, configurable expiry, default 8 hours)
- bcrypt password hashing — plain text passwords are never stored
- First-run onboarding flow: `GET /api/auth/setup-status` → `POST /api/auth/setup`
- Session validation on every app start
- Auto-lock screen with configurable timer
- Password change without requiring logout

### 🔄 Legacy Data Migration
- Import tool for migrating data from a localStorage-based previous version of the application

### 🎨 Frontend Application
- Single-page React application with persistent sidebar navigation
- **Command Palette** (`Ctrl+K` / `Cmd+K`) for keyboard-driven navigation across all modules
- Onboarding wizard for first-time setup
- Lock screen with PIN re-authentication
- Real-time toast notifications (Sonner)
- Responsive layout with `react-router` v7

---

## 📸 Screenshots

> _Screenshots coming soon. See [docs/screenshots/](docs/screenshots/) after first release._

| Dashboard | Billing / POS | Invoice Preview |
|---|---|---|
| _Coming soon_ | _Coming soon_ | _Coming soon_ |

| Inventory | Analytics | GST Reports |
|---|---|---|
| _Coming soon_ | _Coming soon_ | _Coming soon_ |

---

## 🏗️ Architecture

### System Overview

```mermaid
graph TB
    subgraph Frontend["Frontend — React 18 + Vite"]
        UI[React Pages]
        CP[Command Palette]
        Router[React Router v7]
    end

    subgraph Backend["Backend — FastAPI + Python 3.11"]
        API[FastAPI App]
        Auth[Auth Guard / JWT]
        subgraph Modules["Domain Modules"]
            MOD_AUTH[auth]
            MOD_INV[invoices]
            MOD_PROD[products]
            MOD_CUST[customers]
            MOD_STOCK[inventory]
            MOD_ANALYTICS[analytics]
            MOD_REPORTS[reports]
            MOD_TPL[templates]
            MOD_SETTINGS[settings]
            MOD_BACKUP[backup]
            MOD_MIG[migration]
        end
        Shared[Shared — GST Service, GSTIN Validator, Numbering]
    end

    subgraph DB["Data Layer"]
        PG[(PostgreSQL 15+)]
        Alembic[Alembic Migrations]
    end

    Frontend -->|"HTTP REST /api/*"| Backend
    API --> Auth
    Auth --> Modules
    Modules --> Shared
    Modules --> DB
    Alembic --> PG
```

### Module Architecture (Layer Pattern)

Every domain module follows the same strict layering:

```mermaid
graph LR
    R[routes.py\nHTTP handlers] --> C[controller.py\nDI + orchestration]
    C --> S[service.py\nBusiness logic]
    S --> Repo[repository.py\nDB queries]
    Repo --> M[models.py\nSQLAlchemy ORM]
    C --> D[dto.py\nPydantic schemas]
```

```
backend/modules/{module}/
├── routes.py       # FastAPI route definitions and HTTP status codes
├── controller.py   # FastAPI dependency injection and request orchestration
├── service.py      # Business logic, validation, cross-module coordination
├── repository.py   # SQLAlchemy async queries (no business logic here)
├── models.py       # SQLAlchemy ORM model (table definition)
└── dto.py          # Pydantic request/response schemas
```

### Database Schema

```mermaid
erDiagram
    users {
        uuid id PK
        string username
        string password_hash
        datetime created_at
        datetime updated_at
    }
    app_settings {
        uuid id PK
        string key
        jsonb value
        datetime updated_at
    }
    customers {
        uuid id PK
        string name
        string phone
        string email
        text address
        string city
        string state
        string state_code
        string pincode
        string gstin
        datetime created_at
        datetime updated_at
    }
    products {
        uuid id PK
        string name
        string hsn
        float price
        int stock
        string unit
        float gst_rate
        datetime created_at
        datetime updated_at
    }
    invoices {
        uuid id PK
        string invoice_no
        date invoice_date
        string status
        string customer_name
        string customer_phone
        string customer_gstin
        string customer_state
        float subtotal
        float cgst
        float sgst
        float igst
        float total
        string payment_method
        uuid customer_id FK
        datetime created_at
        datetime updated_at
    }
    invoice_items {
        uuid id PK
        uuid invoice_id FK
        uuid product_id FK
        string description
        string hsn
        int qty
        string unit
        float rate
        float gst_rate
        datetime created_at
        datetime updated_at
    }
    inventory_log {
        uuid id PK
        uuid product_id FK
        uuid invoice_id FK
        string change_type
        int qty_before
        int qty_change
        int qty_after
        text note
        datetime created_at
        datetime updated_at
    }
    invoice_templates {
        uuid id PK
        string name
        string template_type
        text content
        bool is_default
        datetime created_at
        datetime updated_at
    }

    invoices ||--o{ invoice_items : "has"
    invoices }o--|| customers : "billed to"
    invoice_items }o--|| products : "references"
    inventory_log }o--|| products : "tracks"
    inventory_log }o--o| invoices : "caused by"
```

---

## 🗂️ Project Structure

```
shopmanager-os/
├── backend/                        # FastAPI Python backend
│   ├── config/
│   │   ├── database.py             # Async SQLAlchemy engine + session factory
│   │   └── settings.py             # Pydantic-settings config (reads .env)
│   ├── migrations/                 # Alembic database migrations
│   │   └── versions/               # Timestamped migration scripts
│   ├── modules/                    # Domain modules (routes/ctrl/service/repo/model/dto)
│   │   ├── analytics/              # KPIs, sales trend, top products/customers, GST summary
│   │   ├── auth/                   # JWT login, setup, session, password change
│   │   ├── backup/                 # JSON backup export and restore
│   │   ├── customers/              # Customer CRM with GSTIN support
│   │   ├── inventory/              # Inventory audit log model
│   │   ├── invoices/               # Invoice create/read/cancel/delete + HTML render
│   │   ├── migration/              # Legacy localStorage data importer
│   │   ├── products/               # Product catalog with stock
│   │   ├── reports/                # GST report with CSV export
│   │   ├── settings/               # App settings (JSONB key-value store)
│   │   └── templates/              # Jinja2 invoice templates (A4 + thermal)
│   ├── shared/
│   │   ├── constants/              # Valid GST rates
│   │   ├── database/               # SQLAlchemy Base, UUID PK mixin, timestamp mixin
│   │   ├── dto/                    # Shared DTOs (pagination)
│   │   ├── exceptions/             # Application exception classes
│   │   ├── middleware/             # JWT auth guard, global error handler
│   │   ├── utils/                  # GSTService, invoice numbering
│   │   └── validators/             # GSTIN validator (pattern + state code)
│   ├── main.py                     # FastAPI app factory — registers all routers
│   ├── alembic.ini                 # Alembic migration configuration
│   ├── .env.example                # Environment variable template
│   └── requirements.txt            # Python dependencies
│
├── src/                            # React 18 + TypeScript frontend
│   ├── app/
│   │   ├── components/             # Shared UI components (Sidebar, Navbar, CommandPalette)
│   │   ├── pages/                  # One file per route
│   │   │   ├── Dashboard.tsx       # App launcher / home
│   │   │   ├── Billing.tsx         # POS / invoice creation
│   │   │   ├── InvoiceHistory.tsx  # Invoice search and management
│   │   │   ├── Products.tsx        # Product catalog management
│   │   │   ├── Customers.tsx       # Customer CRM
│   │   │   ├── Analytics.tsx       # Sales dashboard
│   │   │   ├── Reports.tsx         # GST reports
│   │   │   ├── Settings.tsx        # All application settings
│   │   │   ├── Login.tsx           # Authentication
│   │   │   ├── Onboarding.tsx      # First-run setup wizard
│   │   │   └── LockScreen.tsx      # Auto-lock re-authentication
│   │   ├── Root.tsx                # Layout shell + auth guard + routing
│   │   └── routes.tsx              # React Router browser router definition
│   ├── lib/                        # API client utilities
│   ├── imports/                    # Shared imports / re-exports
│   └── styles/                     # Global CSS
│
├── docs/                           # Documentation and screenshots
├── .gitignore
├── index.html                      # Vite entry point
├── package.json                    # Frontend dependencies (React, MUI, Radix UI, Recharts)
├── vite.config.ts                  # Vite config with API proxy to backend port 8000
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | Frontend build |
| PostgreSQL | 15+ | Primary database |
| pnpm | 8+ | Frontend package manager (`npm i -g pnpm`) |

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/shopmanager-os.git
cd shopmanager-os
```

---

### 2. Backend Setup

#### Create and activate a virtual environment

```bash
# Windows
python -m venv pos_venv
pos_venv\Scripts\activate

# macOS / Linux
python -m venv pos_venv
source pos_venv/bin/activate
```

#### Install Python dependencies

```bash
pip install -r backend/requirements.txt
```

#### Configure environment variables

```bash
# Copy the example file
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your values:

```env
# PostgreSQL connection string
DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/shopmanager

# JWT secret — CHANGE THIS before production
# Generate: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-long-random-secret-key-here

ACCESS_TOKEN_EXPIRE_HOURS=8
ENVIRONMENT=development
APP_VERSION=1.0.0
INVOICE_PREFIX=INV
```

#### Create the PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE shopmanager;"
```

#### Run database migrations

```bash
# From the project root directory
alembic -c backend/alembic.ini upgrade head
```

#### Start the backend API server

```bash
# From the project root directory
uvicorn backend.main:app --reload --port 8000
```

The API will be available at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health check:** http://localhost:8000/api/health

---

### 3. Frontend Setup

#### Install dependencies

```bash
pnpm install
```

#### Start the development server

```bash
pnpm dev
```

The application will open at **http://localhost:5173**

> The Vite dev server is pre-configured to proxy all `/api/*` requests to the backend at `http://127.0.0.1:8000` — no additional CORS configuration is needed for development.

---

### 4. First Run — Onboarding

On first launch, ShopManager OS detects that no operator account exists and automatically redirects to the **Onboarding** wizard. Enter your desired username and password to create the initial operator account and log in automatically.

---

## 🔌 API Reference

All API endpoints are documented interactively at `/docs` (Swagger UI) when the backend is running.

### Authentication

```
GET  /api/auth/setup-status      Check if initial setup is required (public)
POST /api/auth/setup             Create the initial operator account (public, once only)
POST /api/auth/login             Login → returns JWT Bearer token
GET  /api/auth/validate-session  Validate current token (protected)
POST /api/auth/logout            Logout current session (protected)
POST /api/auth/change-password   Change operator password (protected)
```

All protected endpoints require:
```
Authorization: Bearer <token>
```

### Invoices

```
POST   /api/invoices                      Create a new GST invoice
GET    /api/invoices                      List invoices (paginated, filterable)
GET    /api/invoices/next-number          Preview next invoice number
GET    /api/invoices/export               Export invoices to CSV
GET    /api/invoices/{id}                 Get invoice by ID
GET    /api/invoices/{id}/html?template_type=a4      Render invoice as A4 HTML
GET    /api/invoices/{id}/html?template_type=thermal Render invoice as thermal HTML
GET    /api/invoices/{id}/thermal         Render invoice as thermal HTML (shorthand)
POST   /api/invoices/{id}/cancel          Cancel invoice + restore stock
DELETE /api/invoices/{id}                 Hard delete invoice
```

### Products

```
GET    /api/products       List all products
POST   /api/products       Create a product
GET    /api/products/{id}  Get product by ID
PUT    /api/products/{id}  Update a product
DELETE /api/products/{id}  Delete a product
```

### Customers

```
GET    /api/customers       List customers (paginated)
POST   /api/customers       Create a customer
GET    /api/customers/{id}  Get customer by ID
PUT    /api/customers/{id}  Update a customer
DELETE /api/customers/{id}  Delete a customer
```

### Analytics

```
GET /api/analytics/summary        KPI summary (revenue, invoices, tax, customers)
GET /api/analytics/sales-trend    Sales trend over time
GET /api/analytics/top-products   Best-selling products
GET /api/analytics/top-customers  Top customers by spend
GET /api/analytics/gst-summary    GST breakdown (CGST / SGST / IGST totals)
```

### Reports

```
GET /api/reports/gst         Paginated GST transaction register
GET /api/reports/gst/export  Export GST report as CSV
```

### Settings

```
GET  /api/settings   Get application settings (returns defaults if not yet configured)
PUT  /api/settings   Save application settings
```

### Templates

```
GET /api/templates             List invoice templates (optional ?template_type=a4|thermal)
GET /api/templates/{id}        Get template by ID
PUT /api/templates/{id}        Update template HTML content
```

### Backup & Migration

```
GET  /api/backup                        Download full JSON backup
POST /api/backup/restore                Restore from JSON backup (atomic transaction)
POST /api/migrate/import-localstorage   Migrate legacy localStorage data
```

---

## 🧩 Module Descriptions

| Module | Purpose |
|---|---|
| **auth** | JWT authentication, first-run setup, session management, bcrypt password storage |
| **invoices** | Core billing engine — invoice creation, GST calculation, HTML rendering, stock deduction, CSV export |
| **products** | Product catalog with HSN codes, pricing, stock levels, and default GST rates |
| **customers** | Customer CRM with GSTIN validation, state code extraction, and purchase history |
| **inventory** | Immutable audit log of all stock changes — linked to invoices and products |
| **analytics** | Aggregated business intelligence queries: KPIs, trends, top items |
| **reports** | GST-specific transaction register for filing returns, with CSV export |
| **templates** | Jinja2-based HTML invoice templates for A4 and 80mm thermal output, seeded on startup |
| **settings** | JSONB-backed flexible settings store — shop info, GST config, invoice rules, branding |
| **backup** | Full database export/import as structured JSON with version validation |
| **migration** | One-time import tool for migrating from the legacy localStorage-based version |

---

## 🔧 Shared Utilities

### `GSTService` — GST Calculation Engine

Centralizes all Indian GST arithmetic. The only place in the codebase where GST math is performed.

```python
from backend.shared.utils.gst_service import GSTService

# Per line item
totals = GSTService.compute_item_totals(qty=2, rate=500.00, gst_rate=18)
# → ItemGSTTotals(taxable_amt=1000.00, cgst_amt=90.00, sgst_amt=90.00, total_amt=1180.00)

# Invoice total
invoice_totals = GSTService.compute_invoice_totals(items)
```

Uses `Decimal` with `ROUND_HALF_UP` rounding as required by Indian GST invoicing standards.

### `GSTIN Validator`

Full validation of Indian GSTIN format including regex pattern, PAN structure check, and all 37 valid state codes.

```python
from backend.shared.validators.gstin_validator import validate_gstin, get_state_name

validate_gstin("29AADCB2230M1Z2")   # → True
get_state_name("29AADCB2230M1Z2")   # → "Karnataka"
```

---

## 🌱 Environment Variables Reference

All variables are defined in `backend/.env` (copy from `backend/.env.example`):

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | *(required)* | PostgreSQL async connection string |
| `SECRET_KEY` | *(required)* | JWT signing secret — generate with `secrets.token_hex(32)` |
| `ACCESS_TOKEN_EXPIRE_HOURS` | `8` | JWT token validity in hours |
| `ENVIRONMENT` | `development` | `development` or `production` |
| `APP_NAME` | `ShopManager OS` | Application name in logs and API docs |
| `APP_VERSION` | `1.0.0` | API version shown in `/docs` |
| `DEBUG` | `True` | Set `False` in production |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated list of allowed frontend origins |
| `LOG_LEVEL` | `INFO` | `DEBUG` / `INFO` / `WARNING` / `ERROR` |
| `LOG_FILE` | *(empty)* | Log file path — empty means console only |
| `INVOICE_PREFIX` | `INV` | Invoice number prefix (e.g., `INV-00001`) |

---

## 🗺️ Roadmap

### v1.0.0 — Core POS ✅ *(current)*
- [x] GST invoice generation (CGST/SGST/IGST) with A4 and thermal templates
- [x] Product catalog with HSN codes and stock tracking
- [x] Customer CRM with GSTIN validation
- [x] Real-time inventory audit log
- [x] Sales analytics dashboard
- [x] GST report with CSV export
- [x] Full data backup and restore
- [x] JWT authentication with onboarding flow

### v1.1.0 — Multi-User & Roles *(planned)*
- [ ] Role-based access control (RBAC): Admin, Cashier, Manager
- [ ] Multi-operator support with per-user activity log
- [ ] httpOnly cookie session option (XSS hardening)

### v1.2.0 — Reporting Enhancements *(planned)*
- [ ] Excel (`.xlsx`) export for GST reports
- [ ] Profit & loss statement
- [ ] Customer-wise statement of account
- [ ] Day-book / cash book summary

### v1.3.0 — Operational Enhancements *(planned)*
- [ ] Quotation / estimate creation (pre-invoice)
- [ ] Purchase order and supplier management
- [ ] Barcode scanner support for billing
- [ ] Bulk product import via CSV

### v2.0.0 — Cloud & SaaS Edition *(future)*
- [ ] Multi-branch / multi-location support
- [ ] Cloud sync and remote backup
- [ ] Multi-tenant SaaS architecture
- [ ] Mobile companion app (Android)

---

## 🤝 Contributing

Contributions are welcome. Please read through the guidelines below before opening a pull request.

### Development Setup

1. Fork the repository and clone your fork
2. Follow the [Quick Start](#-quick-start) setup instructions
3. Create a feature branch: `git checkout -b feature/your-feature-name`

### Branch Naming Convention

```
feature/short-description    # New feature
fix/short-description        # Bug fix
docs/short-description       # Documentation only
refactor/short-description   # Code refactoring
```

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(invoices): add IGST calculation for inter-state supply
fix(gst): correct rounding for 5% GST rate on small amounts
docs(readme): add environment variable reference table
refactor(auth): extract token validation into shared utility
```

### Module Architecture Contract

Every new backend module **must** follow the layering pattern:
- `routes.py` → HTTP only, no business logic
- `controller.py` → FastAPI dependency injection only
- `service.py` → All business logic
- `repository.py` → All database queries, no business logic
- `models.py` → SQLAlchemy ORM model
- `dto.py` → Pydantic request/response schemas

All models **must** inherit from `Base`, `UUIDPrimaryKeyMixin`, and `TimestampMixin`.

### Pull Request Checklist

- [ ] Code follows the module layer architecture
- [ ] New endpoints are documented in the route docstring
- [ ] Environment variables are added to `.env.example`
- [ ] No secrets, credentials, or `.env` files are committed
- [ ] Alembic migration is created for any schema changes (`alembic revision --autogenerate`)

### Reporting Issues

Please use GitHub Issues. For **security vulnerabilities**, do **not** open a public issue — see [SECURITY.md](SECURITY.md).

---

## 🔒 Security

- Passwords are stored exclusively as **bcrypt hashes** — plain text is never persisted
- All protected API endpoints require a valid **JWT Bearer token**
- The `SECRET_KEY` **must be changed** before production deployment
- Generate a secure key: `python -c "import secrets; print(secrets.token_hex(32))"`
- The `backend/.env` file is listed in `.gitignore` and must never be committed
- For reporting security vulnerabilities, see [SECURITY.md](SECURITY.md)

---

## 📄 License

ShopManager OS is released under the [MIT License](LICENSE).

```
MIT License — Copyright (c) 2026 ShopManager OS Contributors
```

---

## 🙏 Acknowledgements

Built with:

- [FastAPI](https://fastapi.tiangolo.com) — High-performance async Python web framework
- [SQLAlchemy 2.0](https://www.sqlalchemy.org) — Async ORM with PostgreSQL support
- [Alembic](https://alembic.sqlalchemy.org) — Database schema migration tool
- [asyncpg](https://magicstack.github.io/asyncpg/) — Fast PostgreSQL async driver
- [Pydantic v2](https://docs.pydantic.dev) — Data validation and settings management
- [React 18](https://react.dev) — Frontend UI library
- [Vite 6](https://vitejs.dev) — Frontend build tool
- [Tailwind CSS v4](https://tailwindcss.com) — Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com) — Accessible component primitives
- [Recharts](https://recharts.org) — Composable charting library
- [React Router v7](https://reactrouter.com) — Frontend routing

---

<div align="center">

**ShopManager OS** — Built for Indian retail. Open-source forever.

[⭐ Star on GitHub](https://github.com/YOUR_USERNAME/shopmanager-os) · [🐛 Report a Bug](https://github.com/YOUR_USERNAME/shopmanager-os/issues) · [💡 Request a Feature](https://github.com/YOUR_USERNAME/shopmanager-os/issues)

</div>