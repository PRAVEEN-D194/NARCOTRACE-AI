# NARCO-TRACE AI: Unified Law Enforcement Intelligence Platform

NARCO-TRACE AI is an integrated, end-to-end intelligence and analysis platform designed for law enforcement agencies to track, correlate, and analyze illicit drug trafficking networks, financial wallets, and suspect behaviors. 

This repository unifies five isolated functional modules (NLP extraction, wallet correlation, network graph routing, risk score modeling, and RBAC security/audit firewalls) into a single-origin, fully working application with a unified FastAPI backend and a responsive Vite React frontend.

---

## 🛠️ Architecture & Unified Components

The platform consolidates five primary intelligence disciplines:

1. **Multilingual NLP Extraction (`intelligence`)**
   - Extracts entities, locations, wallets, and suspect profiles from raw unstructured reports.
   - Built with fallback token regex matching to execute seamlessly in lightweight CPU environments without crashing on PyTorch/Transformers dependencies.

2. **Entity & Wallet Correlation (`prototype`)**
   - Matches identities, correlates phone numbers/usernames, and tracks financial links (BTC, LTC, etc.) using custom similarity metrics.

3. **Network Graph Analysis (`graph`)**
   - Uses NetworkX graphs to trace transactions, run community detection algorithms (Louvain), execute forward/backward lineage tracing, and simulate disruptions of suspect nodes.

4. **Risk Scoring Engine (`protection`)**
   - Models risk using a multi-factor formula and generates SHAP force contributions showing investigators the primary drivers behind a case's threat level.

5. **RBAC Firewall & Auditing (`protection` / `unified_backend.py`)**
   - Enforces real-time role-based access control (RBAC). Automatically masks sensitive evidence details and redacts restricted intelligence signals depending on the investigator's security clearance.
   - Tracks all lookups, exports, and privilege overrides inside a secure audit ledger.

---

## 📁 Repository Directory Structure

```
NARCOTRACE-AI/
├── intelligence/          # Multilingual text NLP and info extraction
├── prototype/             # Entity similarity, finance & behavior correlation
├── graph/                 # Graph networks, community Louvain, and tracing
├── protection/            # Risk scoring, RBAC firewall, and audit logs
├── frontend/              # Vite + React + TS Law Enforcement portal
│   ├── dist/              # Statically compiled production assets
│   └── src/               # React components, services, and routes
├── unified_backend.py     # Main central FastAPI application server
├── .gitignore             # Git ignore configs
└── README.md              # Project documentation
```

---

## 🚀 Setup and Installation

### 1. Prerequisites
- **Python**: Version `3.10` or above
- **Node.js**: Version `18` or above

### 2. Environment Configuration
Create a `.env` file inside the `frontend/` directory (automatically handled by the build script, but for reference):
```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=/api/v1
```

### 3. Install Python Dependencies
Install the required backend modules:
```bash
pip install fastapi uvicorn networkx python-louvain pyjwt
```

### 4. Build the React Frontend
Navigate to the `frontend` folder, install the packages, and run the compilation:
```bash
cd frontend
npm install
npm run build
cd ..
```
The static assets will be compiled into `frontend/dist/`.

### 5. Launch the Unified Backend Server
Start the central FastAPI application from the workspace root:
```bash
python unified_backend.py
```
Uvicorn will spin up the server on **http://localhost:8000** containing both the REST APIs and hosting the compiled React app.

---

## 🛡️ Role-Based Access Control (RBAC) Test Matrix

Log in using the pre-configured badge IDs on the portal login screen to test the dynamic firewall and masking:

| Investigator Badge ID | Password | Clearance Level | UI Capabilities & Masking Behavior |
| :--- | :--- | :--- | :--- |
| **`LE-8902`** | `password123` | **`INVESTIGATOR`** | **Junior Access**: Cannot access the Audit Trails tab. Evidence records are masked as `[MASKED - REQUIRES SENIOR AUTHORIZATION]`. Restricted intelligence findings are hidden. |
| **`LE-8903`** | `password123` | **`SENIOR_ANALYST`** | **Senior Access**: Access to Audit tab enabled. Full access to raw text intelligence packages and unmasked evidence trails. |
| **`LE-8950`** | `adminpassword` | **`ADMIN`** | **System Admin**: Maximum clearance. Full system logs, override reviews, and unmasked analytics across all folders. |

---

## 📄 License
This project is built for secure law enforcement intelligence prototyping. Distribution and utilization conform to divisional clearance protocols.
