<div align="center">

# SQL Sync Studio

**A production-ready ELT pipeline orchestrator for real-time database synchronization**

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)

[Live Demo](https://sql-sync-studio.vercel.app) · [Report Bug](https://github.com/vishwarajkhatpe/sql-sync-studio/issues) · [Request Feature](https://github.com/vishwarajkhatpe/sql-sync-studio/issues)

</div>

---

## Overview

SQL Sync Studio is a multi-tenant **ELT (Extract, Load, Transform)** platform that enables users to securely connect to remote MySQL and PostgreSQL databases, introspect live schemas, execute custom SQL queries, and orchestrate automated background data pipelines — all from a single glassmorphic dashboard. Extracted data is serialized into JSON snapshots and stored in a centralized Data Lake for historical analysis, export, and downstream processing.

### Key Capabilities

- **Secure Multi-Tenant Workspaces** — JWT + Refresh Token authentication, isolated user environments with bcrypt password hashing and automatic token renewal.
- **Dynamic Connection Pooling** — On-the-fly database connections to external MySQL/PostgreSQL instances without server restarts. Full CRUD management for saved connections.
- **Credential Encryption at Rest** — All external database passwords are encrypted using Fernet symmetric encryption (AES-128-CBC) before storage. Decryption occurs only in-memory at runtime.
- **Live Schema Introspection** — Real-time metadata extraction from connected databases, surfacing table catalogs and individual column schemas with a single API call.
- **Custom SQL Console** — Write and execute arbitrary `SELECT` queries against connected databases with instant results rendered in-browser.
- **Column-Level Selection** — Choose exactly which columns to extract from a table, reducing bandwidth and storage for large schemas.
- **Paginated Data Extraction** — Server-side pagination ensures that even tables with millions of rows can be browsed efficiently without crashing the browser.
- **Data Export (CSV / JSON)** — One-click export of extracted data snapshots as downloadable CSV or JSON files.
- **Autonomous Background Sync ("Ghost Worker")** — APScheduler-powered background thread that autonomously discovers active sync rules, connects to external databases, and ingests data on configurable hourly/daily cadences.
- **Incremental Delta Sync** — Only extract new records since the last snapshot (based on `id` column), saving bandwidth and compute.
- **Telemetry & Activity Logging** — Every sync operation (manual or automated) is logged with status, record count, and error details. Viewable in a real-time activity panel.
- **JSON Data Lake Ingestion** — Automatic type sanitization (Decimal, DateTime, Date → JSON-native) and snapshot persistence into a structured JSON column store.
- **User Profile & Password Management** — Dedicated profile page with secure password change functionality.
- **Docker-Ready Deployment** — Dockerfiles for both backend and frontend, plus a `docker-compose.yml` for single-command local orchestration.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│  React 19 + Vite · Tailwind CSS · Glassmorphic UI · Axios          │
│  (JWT Interceptor + Auto Refresh Token Renewal)                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS / REST
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FASTAPI SERVER                               │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  Auth API   │  │  DB Manager  │  │   Sync Pipeline Manager  │   │
│  │  /auth/*    │  │  /databases/*│  │   /sync/*                │   │
│  │  • register │  │  • connect   │  │   • rules CRUD           │   │
│  │  • login    │  │  • list      │  │   • extract (paginated)  │   │
│  │  • refresh  │  │  • delete    │  │   • custom SQL           │   │
│  │  • me       │  │  • tables    │  │   • export (CSV/JSON)    │   │
│  │  • password │  │  • columns   │  │   • logs & history       │   │
│  └──────┬──────┘  └──────┬───────┘  └────────────┬─────────────┘   │
│         │                │                        │                 │
│  ┌──────┴────────────────┴────────────────────────┴──────────┐     │
│  │              Core Services Layer                          │     │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────┐   │     │
│  │  │ Security       │  │ Scheduler      │  │ Deps       │   │     │
│  │  │ • JWT (HS256)  │  │ • APScheduler  │  │ • OAuth2   │   │     │
│  │  │ • Refresh JWT  │  │ • Ghost Worker │  │ • Token    │   │     │
│  │  │ • Fernet AES   │  │ • Auto-Ingest  │  │   Decode   │   │     │
│  │  │ • bcrypt       │  │ • Incremental  │  │            │   │     │
│  │  └────────────────┘  └────────────────┘  └────────────┘   │     │
│  └───────────────────────────────────────────────────────────┘     │
│                              │                                     │
│  ┌───────────────────────────┴───────────────────────────────┐     │
│  │           SQLAlchemy ORM + Dynamic Engine Factory          │     │
│  └───────────────────────────┬───────────────────────────────┘     │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────────┐
│   SYSTEM DATABASE    │          │   EXTERNAL DATABASES     │
│   (MySQL · Aiven)    │          │   MySQL / PostgreSQL     │
│                      │          │   (Client-Owned)         │
│  • users             │          │                          │
│  • database_configs  │          │  Dynamic connections     │
│  • sync_rules        │          │  via runtime engine      │
│  • sync_logs         │          │  factory                 │
│  • extracted_payloads│          │                          │
│    (JSON Data Lake)  │          │                          │
└──────────────────────┘          └──────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------| 
| **Frontend** | React 19, Vite 8, Tailwind CSS 4 | Glassmorphic SPA with animated dashboard, data grids, SQL console, and sync configuration modals |
| **API** | FastAPI 0.136, Uvicorn | High-performance async REST API with auto-generated OpenAPI docs |
| **ORM** | SQLAlchemy 2.0 (DeclarativeBase), PyMySQL, psycopg2 | Multi-database ORM with dynamic engine creation for external connections |
| **Auth** | python-jose (JWT), passlib (bcrypt) | Stateless token authentication with OAuth2 password flow + refresh tokens |
| **Encryption** | cryptography (Fernet) | AES-128-CBC symmetric encryption for credentials at rest |
| **Scheduler** | APScheduler (BackgroundScheduler) | Non-blocking background thread for autonomous data sync with incremental logic |
| **Validation** | Pydantic v2 | Request/response schema validation with automatic serialization |
| **Containerization** | Docker, Docker Compose | Production-ready containerization for both frontend and backend |
| **Hosting** | Vercel (frontend), Render (backend), Aiven (database) | Managed cloud deployment across all tiers |

---

## UI Design

The frontend features a **light glassmorphic** design system built on these principles:

- **Soft Gradient Background** — Multi-color ambient gradient (`violet → pink → emerald`) with floating blur orbs for depth
- **Glassmorphism Panels** — Translucent `backdrop-blur` cards with soft white borders for all major sections
- **Micro-Animations** — Staggered `slideUp`, `slideIn`, `scaleIn`, `fadeIn` transitions on page load and list rendering
- **Gradient Accents** — Violet-to-indigo gradients for primary actions, emerald for success states, amber for warnings
- **Inter Typography** — Professional `Inter` font family with bold uppercase tracking for labels
- **Responsive Layout** — Three-column dashboard with sidebar, schema explorer, and tabbed data view

---

## Project Structure

```
sql-sync-studio/
├── backend/
│   ├── main.py                          # FastAPI app entry point, CORS, lifespan scheduler
│   ├── Dockerfile                       # Backend Docker image (Python 3.11-slim)
│   ├── requirements.txt                 # Python dependencies
│   └── app/
│       ├── api/
│       │   ├── auth.py                  # /auth/register, login, refresh, me, change-password
│       │   ├── db_manager.py            # /databases/ CRUD, tables, columns introspection
│       │   ├── sync_manager.py          # Sync rules, extraction, export, custom SQL, logs
│       │   └── deps.py                  # OAuth2 token dependency & current user resolver
│       ├── core/
│       │   ├── security.py              # JWT, refresh tokens, bcrypt, Fernet encrypt/decrypt
│       │   └── scheduler.py             # APScheduler Ghost Worker with incremental sync
│       ├── crud/
│       │   └── user.py                  # User creation & lookup data access layer
│       ├── db/
│       │   └── database.py              # SQLAlchemy engine, session factory, SSL handling
│       ├── models/
│       │   ├── user.py                  # User table
│       │   ├── db_config.py             # DatabaseConfig table (encrypted credentials)
│       │   ├── sync_rule.py             # SyncRule table (frequency, strategy, columns)
│       │   ├── sync_log.py              # SyncLog table (status, error, timestamps)
│       │   └── extracted_payload.py     # ExtractedPayload table (JSON Data Lake)
│       └── schemas/
│           ├── user.py                  # Pydantic schemas for auth
│           ├── db_config.py             # Pydantic schemas for database configuration
│           ├── sync_rule.py             # Pydantic schemas for sync rules (incl. columns)
│           └── sync_log.py              # Pydantic schemas for sync logs
│
├── frontend/
│   ├── index.html                       # HTML entry point
│   ├── Dockerfile                       # Frontend Docker image (Node 18 → Nginx)
│   ├── package.json                     # Node.js dependencies & scripts
│   ├── vite.config.js                   # Vite build configuration
│   └── src/
│       ├── main.jsx                     # React DOM render root
│       ├── App.jsx                      # Router with protected routes (/profile, /dashboard)
│       ├── index.css                    # Global CSS: glassmorphism, animations, Inter font
│       ├── context/
│       │   └── AuthContext.jsx          # Auth state (login, register, logout, changePassword)
│       ├── components/
│       │   ├── Navbar.jsx               # Glass navbar with gradient logo & profile avatar
│       │   ├── ConnectionSidebar.jsx    # Saved connections list with animated entries
│       │   ├── ConnectionForm.jsx       # Database connection form with toggle engine picker
│       │   ├── SchemaExplorer.jsx       # Table list with sync buttons & animated items
│       │   ├── DataGrid.jsx             # Paginated data table with export controls
│       │   ├── TelemetryPanel.jsx       # Activity log with status indicators
│       │   ├── SyncConfigModal.jsx      # Sync config modal with column picker
│       │   ├── CustomSQL.jsx            # SQL query console with result table
│       │   └── ExportData.jsx           # CSV/JSON export buttons
│       ├── pages/
│       │   ├── Login.jsx                # Glassmorphic login with floating orbs
│       │   ├── Register.jsx             # Registration with emerald theme
│       │   ├── Dashboard.jsx            # Main workspace layout with tab switcher
│       │   └── Profile.jsx              # User profile & password change
│       └── services/
│           └── api.js                   # Axios instance with JWT + refresh token interceptor
│
├── docker-compose.yml                   # Multi-container orchestration
├── .gitignore
└── README.md
```

---

## API Reference

All endpoints (except auth) require a valid `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user account |
| `POST` | `/auth/login` | Authenticate and receive JWT access + refresh tokens |
| `POST` | `/auth/refresh` | Exchange a refresh token for a new access token |
| `GET` | `/auth/me` | Get the current authenticated user's profile |
| `POST` | `/auth/change-password` | Change the authenticated user's password |

### Database Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/databases/test-connection` | Validate external database connectivity (dry run) |
| `POST` | `/databases/connect` | Test, encrypt credentials, and persist a new connection |
| `GET` | `/databases/` | List all saved database connections for the user |
| `GET` | `/databases/{config_id}/tables` | Retrieve table catalog from a connected external database |
| `GET` | `/databases/{config_id}/tables/{table_name}/columns` | Retrieve column names for a specific table |
| `PUT` | `/databases/{config_id}` | Update an existing database connection |
| `DELETE` | `/databases/{config_id}` | Delete a database connection and all associated data (cascade) |

### Sync Pipeline

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sync/{config_id}/rules` | Create or update a sync rule (frequency, strategy, columns) |
| `GET` | `/sync/{config_id}/rules` | List all sync rules for a database configuration |
| `DELETE` | `/sync/{config_id}/rules/{rule_id}` | Delete a sync rule |
| `POST` | `/sync/{config_id}/extract/{table_name}` | Execute paginated data extraction (`?page=1&page_size=100`) |
| `GET` | `/sync/{config_id}/history` | Retrieve the 10 most recent extraction snapshots |
| `GET` | `/sync/{config_id}/logs` | Retrieve detailed sync logs with status and errors |
| `GET` | `/sync/{config_id}/export/{table_name}/{format}` | Export latest snapshot as `csv` or `json` download |
| `POST` | `/sync/{config_id}/custom-sql` | Execute a custom `SELECT` query on the connected database |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API welcome message |
| `GET` | `/health` | Database connectivity health check |

> **Interactive Docs**: Once the backend is running, visit [`http://localhost:8000/docs`](http://localhost:8000/docs) for the auto-generated Swagger UI.

---

## Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **MySQL** 8.0+ (or PostgreSQL 14+) running locally or via a cloud provider

### 1. Clone the Repository

```bash
git clone https://github.com/vishwarajkhatpe/sql-sync-studio.git
cd sql-sync-studio
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Activate virtual environment
# macOS / Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=mysql+pymysql://root:your_password@127.0.0.1:3306/saas_platform
SECRET_KEY=your_jwt_secret_key_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENCRYPTION_KEY=your_32_byte_base64_fernet_key
CORS_ORIGINS=http://localhost:5173,https://sql-sync-studio.vercel.app
```

> **Generate a Fernet key:**
> ```python
> from cryptography.fernet import Fernet
> print(Fernet.generate_key().decode())
> ```

Start the backend server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 4. Docker (Optional)

Spin up the entire stack with a single command:

```bash
docker-compose up -d
```

This builds and starts both the backend (port `8000`) and frontend (port `5173`).

---

## Data Flow

```
  External DB              SQL Sync Studio                    Data Lake
  ──────────              ─────────────────                  ──────────
       │                         │                                │
       │  ◄── Dynamic Connect ───┤                                │
       │       (SQLAlchemy)      │                                │
       │                         │                                │
       │  ── Schema Metadata ──► │                                │
       │     (Tables + Columns)  │                                │
       │                         │                                │
       │  ── SELECT (paginated)► │                                │
       │     (With column filter)│                                │
       │                         │── Sanitize ──► JSON ──► Store ─┤
       │                         │   (Decimal,    Serialize  (extracted_
       │                         │    DateTime)              payloads)
       │                         │                                │
       │                         │── Export ──► CSV / JSON ──► Download
       │                         │                                │
       │  ◄── Custom SQL ────────┤  (Ad-hoc SELECT queries)      │
       │                         │                                │
```

---

## Security

> [!CAUTION]
> This application manages sensitive database credentials. Adhere to the following practices:

| Concern | Implementation |
|---------|---------------|
| **Password Storage** | User passwords are hashed with bcrypt (never stored in plaintext) |
| **Credential Encryption** | External DB passwords are encrypted with Fernet (AES-128-CBC) before persistence |
| **Access Tokens** | JWTs signed with HS256, configurable expiration (default: 30 min) |
| **Refresh Tokens** | Long-lived refresh JWTs (default: 7 days) for seamless session renewal |
| **Auto Token Refresh** | Axios interceptor automatically refreshes expired access tokens using refresh tokens |
| **Tenant Isolation** | All data access endpoints verify `user_id` ownership before returning results |
| **SQL Injection Guard** | Custom SQL console only permits `SELECT` queries (no mutations) |
| **Environment Secrets** | All keys (`SECRET_KEY`, `ENCRYPTION_KEY`) are loaded from environment variables |
| **CORS Hardening** | CORS origins are configured via environment variable, not wildcarded |
| **Cascade Deletion** | Deleting a connection cascades to remove all rules, logs, and snapshots |

### Critical Rules

- **Never** commit `.env` files to version control
- **Never** expose `SECRET_KEY` or `ENCRYPTION_KEY` in client-side code
- If the `ENCRYPTION_KEY` is lost, **all stored database credentials become permanently irrecoverable**
- Rotate the `SECRET_KEY` periodically; existing JWTs will be invalidated upon rotation

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | System database connection string | `mysql+pymysql://root:pass@localhost:3306/saas_platform` |
| `SECRET_KEY` | Yes | JWT signing secret (min 32 characters) | `a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5` |
| `ALGORITHM` | No | JWT algorithm (default: `HS256`) | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Access token TTL in minutes (default: `30`) | `60` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | Refresh token TTL in days (default: `7`) | `14` |
| `ENCRYPTION_KEY` | Yes | Fernet key for credential encryption | *(output of `Fernet.generate_key()`)* |
| `CORS_ORIGINS` | No | Comma-separated allowed origins | `http://localhost:5173,https://app.example.com` |
| `VITE_API_URL` | Yes | Backend API URL for frontend | `http://localhost:8000` |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please ensure your code follows the existing project structure and includes appropriate error handling.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

**Built by [Vishwaraj Khatpe](https://github.com/vishwarajkhatpe)**

</div>