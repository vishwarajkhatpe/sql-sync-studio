# 🔄 SQL Sync Studio

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Worker-Python_APScheduler-3776AB?logo=python&logoColor=white)

SQL Sync Studio is a self-driving, highly secure Data Ingestion and ELT (Extract, Load, Transform) pipeline orchestrator. It allows users to securely connect to external MySQL/PostgreSQL databases, extract live schemas, and configure automated background workers to continuously sync relational data into a centralized, JSON-based Data Lake.

## ✨ Core Features

* **Secure Workspace Management:** JWT-based multi-tenant architecture ensuring isolated user environments.
* **Dynamic Connection Pooling:** Connects to external client databases on the fly without restarting the server.
* **Enterprise-Grade Security:** Implements two-way symmetric encryption (Fernet) for all external database credentials at rest.
* **Live Metadata Extraction:** Scans and retrieves live table schemas from connected external databases.
* **The "Ghost Worker" Engine:** Utilizes Python `APScheduler` to run autonomous, non-blocking background data syncs based on user-defined intervals.
* **Automated Data Lake Ingestion:** Dynamically sanitizes complex SQL types (like Decimals and Datetimes) and stores historical snapshots in a JSON NoSQL structure.
* **Responsive Telemetry Dashboard:** Real-time UI to monitor sync logs, view data grids, and track background worker health.

## 🏗️ Architecture & Tech Stack

**Frontend (Client UI)**
* React.js (Vite)
* Tailwind CSS (Responsive Layouts)
* Axios (API Interceptors & JWT Handling)
* Hosted on: **Vercel**

**Backend (API & Orchestrator)**
* FastAPI (High-performance async Python framework)
* SQLAlchemy (ORM & Dynamic Database Routing)
* APScheduler (Background task threading)
* Cryptography (Fernet symmetric encryption)
* Hosted on: **Render**

**Infrastructure (Database)**
* MySQL (Primary system database and JSON Data Lake)
* Hosted on: **Aiven Cloud**

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone [https://github.com/YOUR_USERNAME/sql-sync-studio.git](https://github.com/vishwarajkhatpe/sql-sync-studio.git)
cd sql-sync-studio
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```
#### Create a .env file in the backend directory:

```bash
DATABASE_URL=mysql+pymysql://root:password@127.0.0.1:3306/saas_platform
SECRET_KEY=your_jwt_secret_key
ENCRYPTION_KEY=your_32_byte_fernet_key
```
#### start backend server
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```
Create a .env file in the frontend directory:
```bash
VITE_API_URL=http://localhost:8000
```
Start the frontend server:
```bash
npm run dev
```
## 🔐 Security Notice

This application handles highly sensitive database credentials. Never commit your .env files, SECRET_KEY, or ENCRYPTION_KEY to version control. If the ENCRYPTION_KEY is lost, all stored external database connections will become permanently inaccessible.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.