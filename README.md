<div align="center">

# SQL Sync Studio

**A self-driving ELT pipeline orchestrator for real-time database synchronization**

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org)

[Live Demo](https://sql-sync-studio.vercel.app) · [Report Bug](https://github.com/vishwarajkhatpe/sql-sync-studio/issues) · [Request Feature](https://github.com/vishwarajkhatpe/sql-sync-studio/issues)

</div>

---

## Overview

SQL Sync Studio is a multi-tenant data ingestion and **ELT (Extract, Load, Transform)** platform that enables users to securely connect to remote MySQL and PostgreSQL databases, introspect live schemas, and orchestrate automated background data pipelines — all from a single dashboard. Extracted data is serialized into JSON snapshots and stored in a centralized Data Lake for historical analysis and downstream processing.

### Key Capabilities

- **Secure Multi-Tenant Workspaces** — JWT-authenticated, isolated user environments with bcrypt password hashing and per-session token management.
- **Dynamic Connection Pooling** — On-the-fly database connections to external MySQL/PostgreSQL instances without server restarts. Connections are verified before persistence.
- **Credential Encryption at Rest** — All external database passwords are encrypted using Fernet symmetric encryption (AES-128-CBC) before storage. Decryption occurs only in-memory at runtime.
- **Live Schema Introspection** — Real-time metadata extraction from connected databases, surfacing table catalogs with a single API call.
- **Autonomous Background Sync ("Ghost Worker")** — APScheduler-powered background thread that autonomously discovers active sync rules, connects to external databases, and ingests data on a configurable cadence.
- **JSON Data Lake Ingestion** — Automatic type sanitization (Decimal, DateTime, Date → JSON-native) and snapshot persistence into a structured JSON column store.
- **Telemetry Dashboard** — Real-time sync history, extraction previews, and pipeline activity monitoring through an interactive React UI.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│  React 19 + Vite · Tailwind CSS · Axios (JWT Interceptor)          │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS / REST
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FASTAPI SERVER                               │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  Auth API   │  │  DB Manager  │  │   Sync Pipeline Manager  │   │
│  │  /auth/*    │  │  /databases/*│  │   /sync/*                │   │
│  └──────┬──────┘  └──────┬───────┘  └────────────┬─────────────┘   │
│         │                │                        │                 │
│  ┌──────┴────────────────┴────────────────────────┴──────────┐     │
│  │              Core Services Layer                          │     │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────┐   │     │
│  │  │ Security       │  │ Scheduler      │  │ Deps       │   │     │
│  │  │ • JWT (HS256)  │  │ • APScheduler  │  │ • OAuth2   │   │     │
│  │  │ • Fernet AES   │  │ • Ghost Worker │  │ • Token    │   │     │
│  │  │ • bcrypt       │  │ • Auto-Ingest  │  │   Decode   │   │     │
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
│  • extracted_payloads│          │  factory                 │
│    (JSON Data Lake)  │          │                          │
└──────────────────────┘          └──────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4 | SPA with responsive dashboard, data grids, and sync configuration modals |
| **API** | FastAPI 0.136, Uvicorn | High-performance async REST API with auto-generated OpenAPI docs |
| **ORM** | SQLAlchemy 2.0, PyMySQL, psycopg2 | Multi-database ORM with dynamic engine creation for external connections |
| **Auth** | python-jose (JWT), passlib (bcrypt) | Stateless token authentication with OAuth2 password flow |
| **Encryption** | cryptography (Fernet) | AES-128-CBC symmetric encryption for credentials at rest |
| **Scheduler** | APScheduler (BackgroundScheduler) | Non-blocking background thread for autonomous data sync execution |
| **Validation** | Pydantic v2 | Request/response schema validation with automatic serialization |
| **Hosting** | Vercel (frontend), Render (backend), Aiven (database) | Managed cloud deployment across all tiers |

---

## Project Structure

```
sql-sync-studio/
├── backend/
│   ├── main.py                          # FastAPI application entry point & router registration
│   ├── requirements.txt                 # Python dependencies
│   └── app/
│       ├── api/
│       │   ├── auth.py                  # POST /auth/register, POST /auth/login
│       │   ├── db_manager.py            # POST /databases/connect, GET /databases/{id}/tables
│       │   ├── sync_manager.py          # Sync rules CRUD, extraction engine, history log
│       │   └── deps.py                  # OAuth2 token dependency & current user resolver
│       ├── core/
│       │   ├── security.py              # JWT, bcrypt, Fernet encrypt/decrypt utilities
│       │   └── scheduler.py             # APScheduler Ghost Worker pipeline executor
│       ├── crud/
│       │   └── user.py                  # User creation & lookup data access layer
│       ├── db/
│       │   └── database.py              # SQLAlchemy engine, session factory, SSL handling
│       ├── models/
│       │   ├── user.py                  # User table (id, email, hashed_password, is_active)
│       │   ├── db_config.py             # DatabaseConfig table (connection credentials)
│       │   ├── sync_rule.py             # SyncRule table (frequency, strategy, is_active)
│       │   └── extracted_payload.py     # ExtractedPayload table (JSON data lake snapshots)
│       └── schemas/
│           ├── user.py                  # Pydantic schemas for auth request/response
│           ├── db_config.py             # Pydantic schemas for database configuration
│           └── sync_rule.py             # Pydantic schemas for sync rule management
│
├── frontend/
│   ├── index.html                       # HTML entry point
│   ├── package.json                     # Node.js dependencies & scripts
│   ├── vite.config.js                   # Vite build configuration
│   ├── tailwind.config.js               # Tailwind CSS configuration
│   └── src/
│       ├── main.jsx                     # React DOM render root
│       ├── App.jsx                      # Router setup with protected routes
│       ├── context/
│       │   └── AuthContext.jsx          # Global auth state (login, register, logout, token)
│       ├── pages/
│       │   ├── Login.jsx                # User login form
│       │   ├── Register.jsx             # User registration form
│       │   └── Dashboard.jsx            # Main workspace: connection form, schema scanner,
│       │                                #   data grid, sync config modal, telemetry log
│       └── services/
│           └── api.js                   # Axios instance with JWT interceptor
│
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
| `POST` | `/auth/login` | Authenticate and receive a JWT access token |

### Database Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/databases/test-connection` | Validate external database connectivity (dry run) |
| `POST` | `/databases/connect` | Test, encrypt credentials, and persist a new database configuration |
| `GET` | `/databases/{config_id}/tables` | Retrieve table catalog from a connected external database |

### Sync Pipeline

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sync/{config_id}/rules` | Create or update a sync rule for a specific table |
| `GET` | `/sync/{config_id}/rules` | List all sync rules for a database configuration |
| `POST` | `/sync/{config_id}/extract/{table_name}` | Execute an on-demand data extraction and ingest into the Data Lake |
| `GET` | `/sync/{config_id}/history` | Retrieve the 10 most recent extraction snapshots |

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
ENCRYPTION_KEY=your_32_byte_base64_fernet_key
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
       │     (SHOW TABLES /      │                                │
       │      info_schema)       │                                │
       │                         │                                │
       │  ── SELECT * ────────►  │                                │
       │     (Raw Records)       │                                │
       │                         │── Sanitize ──► JSON ──► Store ─┤
       │                         │   (Decimal,    Serialize  (extracted_
       │                         │    DateTime)              payloads)
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
| **Token Authentication** | JWTs signed with HS256, configurable expiration (default: 30 min) |
| **Tenant Isolation** | All data access endpoints verify `user_id` ownership before returning results |
| **Environment Secrets** | All keys (`SECRET_KEY`, `ENCRYPTION_KEY`) are loaded from environment variables |

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
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Token TTL in minutes (default: `30`) | `60` |
| `ENCRYPTION_KEY` | Yes | Fernet key for credential encryption | *(output of `Fernet.generate_key()`)* |
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