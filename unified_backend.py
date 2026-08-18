import os
import sys
import time
import datetime
import uuid
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Header, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

# Setup path resolvers to import from project folders
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(BASE_DIR, "intelligence"))
sys.path.append(os.path.join(BASE_DIR, "graph"))
sys.path.append(os.path.join(BASE_DIR, "protection"))

# --- Imports from Members ---
try:
    from pipeline import Member1Pipeline
except ImportError:
    Member1Pipeline = None

# Load prototype/main.py using explicit module specification to avoid collision
import importlib.util
spec = importlib.util.spec_from_file_location("prototype_main", os.path.join(BASE_DIR, "prototype", "main.py"))
member2_main = importlib.util.module_from_spec(spec)
sys.modules["prototype_main"] = member2_main
spec.loader.exec_module(member2_main)

username_similarity = member2_main.username_similarity
semantic_similarity = member2_main.semantic_similarity
behavior_similarity = member2_main.behavior_similarity
temporal_similarity = member2_main.temporal_similarity
financial_correlation = member2_main.financial_correlation
analyze_entities = member2_main.analyze_entities

from graph_engine import IntelligenceGraph
import algorithms
import simulation
from mock_data import populate_mock_data

from risk_engine import RiskEngine
from intelligence_cell import IntelligenceCell
from intelligence_firewall import IntelligenceFirewall
from audit_logger import AuditLogger

# --- Initialize Application ---
app = FastAPI(
    title="NARCO-TRACE AI - Unified Platform Backend",
    description="Central gateway routing and executing unified intelligence, graph, correlation, and security queries.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Initialize Single Engines ---
pipeline_engine = Member1Pipeline(use_ml_fallbacks=True) if Member1Pipeline else None
igraph = IntelligenceGraph()
populate_mock_data(igraph)

cell = IntelligenceCell()
firewall = IntelligenceFirewall()
audit = AuditLogger()

# --- Users Database (RBAC) ---
USERS_DB = {
    "LE-8901": {
        "username": "investigator1",
        "name": "Inspector Naveen",
        "role": "INVESTIGATOR",
        "badgeNumber": "LE-8901",
        "password": "password123",
        "clearance_level": "LEVEL_1",
        "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    },
    "LE-8902": {
        "username": "investigator2",
        "name": "Agent J. Miller",
        "role": "INVESTIGATOR",
        "badgeNumber": "LE-8902",
        "password": "password123",
        "clearance_level": "LEVEL_2",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    "LE-8903": {
        "username": "senior_analyst1",
        "name": "Superintendent Sharma",
        "role": "SENIOR_ANALYST",
        "badgeNumber": "LE-8903",
        "password": "password123",
        "clearance_level": "LEVEL_3",
        "avatarUrl": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80"
    },
    "LE-8950": {
        "username": "admin1",
        "name": "System Admin",
        "role": "ADMIN",
        "badgeNumber": "LE-8950",
        "password": "adminpassword",
        "clearance_level": "LEVEL_MAX",
        "avatarUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    }
}

# In-memory session store
SESSIONS = {}

# --- Cases and Evidence In-Memory Database ---
CASES_DB = [
  {
    "id": "CASE-2026-041",
    "title": "Operation DarkWolf Synthetic Traffic",
    "subject": "DarkWolf23",
    "priority": "HIGH",
    "status": "ACTIVE",
    "riskScore": 94,
    "aliases": [
      { "name": "Wolf_23", "platform": "Telegram", "firstSeen": "2026-01-12", "confidence": 96 },
      { "name": "AlphaWolf_Vendor", "platform": "Darknet Market", "firstSeen": "2025-11-04", "confidence": 89 }
    ],
    "wallets": [
      { "address": "0x71C7656EC8ab88c098defB751B7401B5f6d8976F", "blockchain": "Ethereum", "balance": "42.5 ETH", "riskScore": 92 },
      { "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", "blockchain": "Bitcoin", "balance": "3.84 BTC", "riskScore": 95 }
    ],
    "nodeCount": 7,
    "forwardConnectionsCount": 5,
    "backwardConnectionsCount": 2,
    "evidenceIds": ["E-17", "E-21", "E-29"],
    "lastActivity": "2026-08-18 14:10:00",
    "createdAt": "2026-02-10 09:30:00",
    "assignedInvestigator": "Agent J. Miller",
    "summary": "High-priority target orchestrating cross-platform contraband distribution via Telegram relay nodes and multi-sig crypto wallets.",
    "tags": ["Synthetic Narcotic", "Darknet Marketplace", "Multi-chain Wallet", "Cross-Platform"]
  },
  {
    "id": "CASE-2026-042",
    "title": "Financial Dispersal Network - Spectre",
    "subject": "SpectreNode_99",
    "priority": "HIGH",
    "status": "ACTIVE",
    "riskScore": 88,
    "aliases": [
      { "name": "GhostPay_Operator", "platform": "Signal", "firstSeen": "2026-02-01", "confidence": 91 }
    ],
    "wallets": [
      { "address": "0x3F8a91B2cE9a341187421cDe987bA209110B0192", "blockchain": "Ethereum", "balance": "128.1 ETH", "riskScore": 88 }
    ],
    "nodeCount": 14,
    "forwardConnectionsCount": 9,
    "backwardConnectionsCount": 5,
    "evidenceIds": ["E-31", "E-35"],
    "lastActivity": "2026-08-18 11:45:20",
    "createdAt": "2026-03-01 14:00:00",
    "assignedInvestigator": "Agent K. Vance",
    "summary": "Automated tumbling service directing funds through nested decentralized exchanges.",
    "tags": ["Tumbling", "DEX Laundering", "High Volume"]
  },
  {
    "id": "CASE-2026-043",
    "title": "Illicit Import Syndicate - CyberSilk",
    "subject": "SilkRoad_V3_Admin",
    "priority": "MEDIUM",
    "status": "UNDER_REVIEW",
    "riskScore": 72,
    "aliases": [
      { "name": "SilkMaster", "platform": "Tor Forum", "firstSeen": "2025-09-18", "confidence": 84 }
    ],
    "wallets": [
      { "address": "bc1q9v8t7w6x5y4z3a2b1c0d9e8f7g6h5j4k3m2n1", "blockchain": "Bitcoin", "balance": "1.2 BTC", "riskScore": 70 }
    ],
    "nodeCount": 9,
    "forwardConnectionsCount": 6,
    "backwardConnectionsCount": 3,
    "evidenceIds": ["E-12", "E-15"],
    "lastActivity": "2026-08-17 18:22:10",
    "createdAt": "2026-04-12 11:15:00",
    "assignedInvestigator": "Agent J. Miller",
    "summary": "Regional distribution channel identified via encrypted forum messaging metadata.",
    "tags": ["Tor Network", "Forum Admin", "Postal Interception"]
  },
  {
    "id": "CASE-2026-044",
    "title": "Cartel Telemetry Correlation - Viper",
    "subject": "ViperX_Supplier",
    "priority": "HIGH",
    "status": "ACTIVE",
    "riskScore": 91,
    "aliases": [
      { "name": "ViperLogistics", "platform": "Session App", "firstSeen": "2026-01-20", "confidence": 94 }
    ],
    "wallets": [
      { "address": "0x8912A0b34F56E789d123Cde4567890f123456789", "blockchain": "Solana", "balance": "14,200 SOL", "riskScore": 90 }
    ],
    "nodeCount": 18,
    "forwardConnectionsCount": 12,
    "backwardConnectionsCount": 6,
    "evidenceIds": ["E-40", "E-42", "E-45"],
    "lastActivity": "2026-08-18 13:05:40",
    "createdAt": "2026-01-05 08:00:00",
    "assignedInvestigator": "Agent R. Torres",
    "summary": "Wholesale precursor chemical trafficking network operating across encrypted cellular relays.",
    "tags": ["Precursors", "Bulk Supply", "Encrypted Cellular"]
  },
  {
    "id": "CASE-2026-045",
    "title": "Monero Anonymized Transit Channel",
    "subject": "XMR_Shadow",
    "priority": "MEDIUM",
    "status": "UNDER_REVIEW",
    "riskScore": 65,
    "aliases": [
      { "name": "ShadowVault", "platform": "Element", "firstSeen": "2026-05-10", "confidence": 78 }
    ],
    "wallets": [
      { "address": "48edfBa76...xmr8923", "blockchain": "Monero", "balance": "520 XMR", "riskScore": 68 }
    ],
    "nodeCount": 6,
    "forwardConnectionsCount": 4,
    "backwardConnectionsCount": 2,
    "evidenceIds": ["E-50"],
    "lastActivity": "2026-08-16 09:12:00",
    "createdAt": "2026-05-02 16:45:00",
    "assignedInvestigator": "Agent J. Miller",
    "summary": "Privacy coin swap analysis linking peer-to-peer dark market buyers.",
    "tags": ["Monero", "Privacy Coin", "P2P Exchange"]
  }
]

EVIDENCE_DB = [
  {
    "id": "E-17",
    "title": "Dark-Web Vendor Listing Index #892",
    "type": "Dark-Web Listing",
    "relatedCaseId": "CASE-2026-041",
    "relatedEntityId": "node-subject",
    "relatedEntityName": "DarkWolf23",
    "status": "Verified",
    "integrityStatus": "SHA-256 Validated",
    "sha256Hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (DEMO HASH)",
    "timestamp": "2026-02-10 10:14:22 UTC",
    "source": "TOR Onion Archive Collector / Member 1 NLP Pipeline",
    "details": "Encrypted listing text advertising synthetic narcotics packages with PGP key signature attached matching DarkWolf23.",
    "classification": "LAW ENFORCEMENT SENSITIVE"
  },
  {
    "id": "E-21",
    "title": "Telegram Alias Handle Cross-Correlation Log",
    "type": "Telegram Identity",
    "relatedCaseId": "CASE-2026-041",
    "relatedEntityId": "node-wolf-23",
    "relatedEntityName": "Wolf_23",
    "status": "Verified",
    "integrityStatus": "SHA-256 Validated",
    "sha256Hash": "4f8a91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0 (DEMO HASH)",
    "timestamp": "2026-02-12 14:02:18 UTC",
    "source": "Member 2 Entity Resolution Service",
    "details": "Biometric and linguistic matching confidence score of 96% linking darkweb profile DarkWolf23 to Telegram user Wolf_23.",
    "classification": "CONTROLLED ACCESS"
  },
  {
    "id": "E-29",
    "title": "Blockchain Transaction Payload & Multi-sig Log",
    "type": "Wallet Transaction",
    "relatedCaseId": "CASE-2026-041",
    "relatedEntityId": "node-wallet-x",
    "relatedEntityName": "Wallet-X (0x71C7...976F)",
    "status": "Verified",
    "integrityStatus": "SHA-256 Validated",
    "sha256Hash": "8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b (DEMO HASH)",
    "timestamp": "2026-02-15 08:44:00 UTC",
    "source": "Member 3 Blockchain Graph Engine",
    "details": "On-chain transaction trace recording transfer of 14.8 ETH into tumbler address 0x882A...5512.",
    "classification": "LAW ENFORCEMENT SENSITIVE"
  },
  {
    "id": "E-31",
    "title": "DEX Automated Liquidity Pool Deposit",
    "type": "Financial Transfer",
    "relatedCaseId": "CASE-2026-042",
    "relatedEntityId": "node-spectre",
    "relatedEntityName": "SpectreNode_99",
    "status": "Verified",
    "integrityStatus": "SHA-256 Validated",
    "sha256Hash": "11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff (DEMO HASH)",
    "timestamp": "2026-03-01 15:30:11 UTC",
    "source": "Member 3 Blockchain Tracer",
    "details": "High-frequency liquidity provisioning payload detected across 12 decentralized pool contracts.",
    "classification": "LAW ENFORCEMENT SENSITIVE"
  }
]

# Seed sample packages to cell for testing
cell.compile_package(
    package_id="PKG-041",
    raw_report_ids=["RAW-REP-092"],
    compiled_summary="Intelligence points to DarkWolf23 coordinating Heroin supply operations via Telegram bot @dw23_bot. Deliveries centered around Sector 17, Chandigarh. Funds tracked to BTC/LTC wallet cluster.",
    confidence_rating=0.92,
    creator="senior_analyst1"
)

# --- Pydantic Schemas ---
class LoginRequest(BaseModel):
    username: str
    password: str

class TextAnalysisRequest(BaseModel):
    text: str

class CorrelationRequest(BaseModel):
    entity_a_username: str
    entity_b_username: str
    entity_a_text: str = ""
    entity_b_text: str = ""
    entity_a_hours: List[int] = Field(default_factory=list)
    entity_b_hours: List[int] = Field(default_factory=list)
    entity_a_days: List[str] = Field(default_factory=list)
    entity_b_days: List[str] = Field(default_factory=list)
    entity_a_wallets: List[str] = Field(default_factory=list)
    entity_b_wallets: List[str] = Field(default_factory=list)

class AuditCreateRequest(BaseModel):
    action: str
    caseId: str
    details: Optional[str] = ""

# --- Dependency: Current Active User (via headers) ---
def get_user_context(
    role: Optional[str] = Header(None, alias="X-Investigator-Role"),
    name: Optional[str] = Header(None, alias="X-Investigator-Name"),
    badge: Optional[str] = Header(None, alias="X-Investigator-Badge")
) -> Dict[str, Any]:
    # Default to Agent Miller / Investigator if headers are absent
    return {
        "role": role or "INVESTIGATOR",
        "name": name or "Agent J. Miller",
        "badge": badge or "LE-8902"
    }

# --- 1. AUTHENTICATION & SESSION ACCESS ---

@app.post("/api/v1/auth/login")
def login(req: LoginRequest):
    matched_user = None
    for badge, user in USERS_DB.items():
        if user["badgeNumber"] == req.username or user["username"] == req.username:
            if user["password"] == req.password:
                matched_user = user
                break
                
    if not matched_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect badge number/username or password"
        )
        
    token = f"TOKEN-{uuid.uuid4().hex[:16].upper()}"
    SESSIONS[token] = matched_user
    
    # Log audit event
    audit.log_event(
        username=matched_user["username"],
        role=matched_user["role"],
        action="LOGIN",
        resource="N/A",
        status="ALLOWED",
        details=f"Investigator {matched_user['name']} authenticated successfully."
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": f"INV-{matched_user['badgeNumber'].split('-')[1]}",
            "name": matched_user["name"],
            "badgeNumber": matched_user["badgeNumber"],
            "agency": "Narcotics & Cybercrime Division",
            "clearanceLevel": f"LEVEL {matched_user['role']} CLEARANCE",
            "avatarUrl": matched_user["avatarUrl"],
            "role": matched_user["role"]
        }
    }

# --- 2. AUDIT TRAIL LOGGING ---

@app.get("/api/v1/audit")
def get_audit_logs(user: dict = Depends(get_user_context)):
    if user["role"] not in ["ADMIN", "SENIOR_ANALYST"]:
        raise HTTPException(status_code=403, detail="Only Admins or Senior Analysts can access audit trails.")
    
    mapped_logs = []
    for log in audit.list_logs():
        badge = "LE-8902"
        name = "Agent J. Miller"
        for user_badge, u in USERS_DB.items():
            if u["username"] == log["username"]:
                badge = user_badge
                name = u["name"]
                break
                
        mapped_logs.append({
            "id": log["log_id"],
            "timestamp": log["formatted_time"],
            "investigatorId": badge,
            "investigatorName": name,
            "action": log["action"],
            "caseId": log["resource"] if "CASE-" in log["resource"] else "N/A",
            "result": "Success" if log["status"] == "ALLOWED" else ("Denied" if log["status"] == "BLOCKED" else "Warning"),
            "ipAddress": "10.240.18.42",
            "details": log["details"]
        })
    return mapped_logs

@app.post("/api/v1/audit")
def log_audit_event(req: AuditCreateRequest, user: dict = Depends(get_user_context)):
    audit.log_event(
        username=user["badge"],
        role=user["role"],
        action=req.action,
        resource=req.caseId,
        status="ALLOWED",
        details=req.details
    )
    return {"status": "SUCCESS"}

# --- 3. CASES & DOSSIERS MANAGEMENT ---

@app.get("/api/v1/cases")
def list_cases(
    search: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    user: dict = Depends(get_user_context)
):
    results = []
    for case in CASES_DB:
        if search:
            query = search.lower()
            if (query not in case["id"].lower() and
                query not in case["title"].lower() and
                query not in case["subject"].lower()):
                continue
        if priority and priority != "ALL" and case["priority"] != priority:
            continue
        if status and status != "ALL" and case["status"] != status:
            continue
        results.append(case)
    return results

@app.get("/api/v1/cases/{case_id}")
def get_case(case_id: str, user: dict = Depends(get_user_context)):
    case = next((c for c in CASES_DB if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case dossier not found")
    return case

# --- 4. NETWORK & TOPOLOGY GRAPHS (MAPPED FROM MEMBER 3) ---

@app.get("/api/v1/network/{case_id}")
def get_network(case_id: str, user: dict = Depends(get_user_context)):
    with igraph.lock:
        nodes = []
        edges = []
        
        for node_id, attrs in igraph.graph.nodes(data=True):
            ntype = attrs.get("type", "Person").capitalize()
            if ntype == "Actor":
                ntype = "Person"
            elif ntype == "Acct":
                ntype = "Account"
                
            risk = attrs.get("risk_score", 0.0)
            meta = attrs.get("metadata", {})
            platform = meta.get("platform") or meta.get("crypto_type") or "Darknet Router"
            aliases = meta.get("aliases") or [attrs.get("label", node_id)]
            is_subject = node_id == "actor_darkwolf23"
            
            nodes.append({
                "id": node_id,
                "label": attrs.get("label", node_id),
                "type": ntype,
                "platform": platform,
                "riskScore": int(risk),
                "riskLevel": "HIGH" if risk >= 80 else ("MEDIUM" if risk >= 50 else "LOW"),
                "aliases": aliases,
                "connectedWallets": meta.get("wallets") or [],
                "connectionCount": len(list(igraph.graph.neighbors(node_id))) if igraph.graph.has_node(node_id) else 0,
                "evidenceCount": 1 if is_subject else 0,
                "evidenceIds": ["E-17"] if is_subject else [],
                "isSubject": is_subject
            })
            
        for u, v, key, attrs in igraph.graph.edges(keys=True, data=True):
            rel = attrs.get("type", "controls").replace("_", " ").title()
            meta = attrs.get("metadata", {})
            edges.append({
                "id": key,
                "source": u,
                "target": v,
                "relationship": rel,
                "direction": "forward",
                "confidence": float(meta.get("confidence", 0.95)),
                "transactionAmount": meta.get("amount"),
                "timestamp": attrs.get("timestamp")
            })
            
        return {"nodes": nodes, "edges": edges}

# --- 5. EVIDENCE REGISTRY ---

@app.get("/api/v1/evidence")
def list_evidence(caseId: Optional[str] = None, user: dict = Depends(get_user_context)):
    ev_list = []
    for ev in EVIDENCE_DB:
        if caseId and ev["relatedCaseId"] != caseId:
            continue
            
        masked_ev = ev.copy()
        if user["role"] == "INVESTIGATOR":
            masked_ev["details"] = "[MASKED - REQUIRES SENIOR AUTHORIZATION]"
            masked_ev["source"] = "[PROTECTED SOURCE CELL]"
            
        ev_list.append(masked_ev)
    return ev_list

# --- 6. INTELLIGENCE FINDINGS & PACKAGES (MEMBER 4 INTEGRATED) ---

@app.get("/api/v1/intelligence")
def get_intelligence(caseId: Optional[str] = None, user: dict = Depends(get_user_context)):
    findings = [
        {
            "id": "INTEL-901",
            "finding": "Potential cross-platform identity relationship confirmed between DarkWolf23 and Wolf_23",
            "confidence": 91,
            "relatedEntities": ["DarkWolf23", "Wolf_23"],
            "evidenceIds": ["E-17", "E-21"],
            "validationStatus": "Validated",
            "authorizationStatus": "AUTHORIZED" if user["role"] in ["ADMIN", "SENIOR_ANALYST"] else "PENDING_APPROVAL",
            "classification": "CONTROLLED ACCESS",
            "isControlled": True,
            "timestamp": "2026-08-18 13:40:00",
            "summary": "Controlled intelligence output released by Member 4 Firewall. Linguistic analysis shows 91% structural match."
        },
        {
            "id": "INTEL-902",
            "finding": "Automated Wallet-X fund dispersal path detected entering mixer protocol 0x882A...5512",
            "confidence": 98,
            "relatedEntities": ["Wallet-X", "Wallet-Y"],
            "evidenceIds": ["E-29"],
            "validationStatus": "Validated",
            "authorizationStatus": "AUTHORIZED" if user["role"] in ["ADMIN", "SENIOR_ANALYST"] else "PENDING_APPROVAL",
            "classification": "CONTROLLED ACCESS",
            "isControlled": True,
            "timestamp": "2026-08-18 12:15:00",
            "summary": "Blockchain telemetry analysis confirms automated multi-sig splitting mechanism for laundering proceeds."
        }
    ]
    
    if user["role"] in ["ADMIN", "SENIOR_ANALYST"]:
        findings.append({
            "id": "INTEL-RAW-99",
            "finding": "RAW RESTRICTED: Intercepted encrypted session packet handshake metadata",
            "confidence": 64,
            "relatedEntities": ["Raw_IP_Node_44"],
            "evidenceIds": [],
            "validationStatus": "Pending Review",
            "authorizationStatus": "RESTRICTED_ACCESS",
            "classification": "RESTRICTED INTELLIGENCE",
            "isControlled": False,
            "timestamp": "2026-08-18 10:05:00",
            "summary": "Raw signal intelligence snippet. Subject to Member 4 clearance verification before investigator display."
        })
        
    return findings

# --- 7. RISK & INTEL FACTOR ANALYSIS (MEMBER 4 SHAP MODEL) ---

@app.get("/api/v1/risk/{case_id}")
def get_risk_assessment(case_id: str, user: dict = Depends(get_user_context)):
    drug_count, platform_links, network_centrality, fin_val, hist_cases, active_days = (4, 1, 0.45, 1000.0, 1, 90)
    
    if case_id == "CASE-2026-041":
        drug_count, platform_links, network_centrality, fin_val, hist_cases, active_days = (10, 3, 0.85, 7400.0, 2, 180)
    elif case_id == "CASE-2026-042":
        drug_count, platform_links, network_centrality, fin_val, hist_cases, active_days = (2, 4, 0.95, 15000.0, 1, 170)
    elif case_id == "CASE-2026-044":
        drug_count, platform_links, network_centrality, fin_val, hist_cases, active_days = (12, 2, 0.75, 8000.0, 3, 200)
    elif case_id == "CASE-2026-045":
        drug_count, platform_links, network_centrality, fin_val, hist_cases, active_days = (1, 1, 0.35, 1000.0, 0, 60)
        
    res = RiskEngine.calculate_risk(
        drug_activity_count=drug_count,
        cross_platform_links=platform_links,
        network_centrality=network_centrality,
        financial_transactions_val=fin_val,
        historical_cases=hist_cases,
        active_days=active_days
    )
    
    return {
        "caseId": case_id,
        "overallScore": int(res["priority_score"]),
        "maxScore": 100,
        "riskLevel": res["classification"],
        "engineVersion": "NARCO-TRACE Risk Engine v4.2",
        "generatedBy": "Member 4 Backend Risk & Threat Engine",
        "factors": [
            {
                "category": contrib["feature"],
                "points": int(contrib["contribution"]),
                "description": f"Risk coefficient calculated by SHAP model algorithm: +{contrib['contribution']} points."
            }
            for contrib in res["contributions"] if contrib["feature"] != "Base Value"
        ],
        "lastUpdated": "2026-08-18 14:00:00"
    }

# --- 8. REPORTS COMPILING & DOSSIER EXPORT ---

@app.post("/api/v1/reports/{case_id}/generate")
def generate_report(case_id: str, user: dict = Depends(get_user_context)):
    case = next((c for c in CASES_DB if c["id"] == case_id), CASES_DB[0])
    
    key_findings = [
        f"Direct correlation confirmed between Dark Web handle {case['subject']} and corresponding aliases.",
        f"Primary wallets identified: {', '.join(w['address'][:10]+'...' for w in case['wallets'])}.",
        f"Network analysis shows {case['nodeCount']} total connected nodes in the intelligence graph."
    ]
    
    audit.log_event(
        username=user["badge"],
        role=user["role"],
        action="GENERATE_REPORT",
        resource=case_id,
        status="ALLOWED",
        details=f"Generated formal dossier PDF report for case {case_id}."
    )
    
    return {
        "caseId": case["id"],
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "generatedBy": f"{user['name']} (Badge #{user['badge']})",
        "subject": case["subject"],
        "riskScore": case["riskScore"],
        "riskLevel": case["priority"],
        "summary": case["summary"],
        "keyFindings": key_findings,
        "evidenceCount": len(case["evidenceIds"]),
        "networkSummary": f"Analyzed graph of {case['nodeCount']} total connected nodes ({case['forwardConnectionsCount']} forward, {case['backwardConnectionsCount']} backward).",
        "forwardCount": case["forwardConnectionsCount"],
        "backwardCount": case["backwardConnectionsCount"],
        "recommendations": [
            f"Issue international freeze order on wallets associated with {case['subject']}.",
            "Subpoena metadata records for Telegram channel communication.",
            "Escalate dossier to regional interdiction team."
        ]
    }

# --- 9. DASHBOARD SUMMARY STATS ---

@app.get("/api/v1/dashboard")
def get_dashboard_overview(user: dict = Depends(get_user_context)):
    active_cases = [c for c in CASES_DB if c["status"] == "ACTIVE"]
    return {
        "activeCasesCount": len(active_cases),
        "highPriorityCount": len([c for c in CASES_DB if c["priority"] == "HIGH"]),
        "mediumPriorityCount": len([c for c in CASES_DB if c["priority"] == "MEDIUM"]),
        "totalEvidenceCount": len(EVIDENCE_DB),
        "networkAlertsCount": len(audit.detect_anomalies()),
        "recentCases": CASES_DB[:5],
        "recentActivity": get_audit_logs(user)[:5] if user["role"] in ["ADMIN", "SENIOR_ANALYST"] else []
    }

# --- 10. MEMBER 1 NLP NLP ENGINE PASSTHROUGH ---

@app.post("/api/v1/analyze")
def analyze_text(req: TextAnalysisRequest):
    if not pipeline_engine:
        return {"error": "NLP Engine not initialized. Torch is missing."}
    result = pipeline_engine.execute(req.text)
    import json
    return json.loads(result.model_dump_json())

# --- 11. MEMBER 2 CORRELATION ENGINE PASSTHROUGH ---

@app.post("/api/v1/correlation/analyze")
def correlate_profiles(req: CorrelationRequest):
    from main import Entity, Transaction
    
    entity_a = Entity(
        id="A",
        platform="A_Platform",
        username=req.entity_a_username,
        text=req.entity_a_text,
        activity_hours=req.entity_a_hours,
        activity_days=req.entity_a_days,
        post_count=10,
        wallets=req.entity_a_wallets
    )
    
    entity_b = Entity(
        id="B",
        platform="B_Platform",
        username=req.entity_b_username,
        text=req.entity_b_text,
        activity_hours=req.entity_b_hours,
        activity_days=req.entity_b_days,
        post_count=8,
        wallets=req.entity_b_wallets
    )
    
    res = analyze_entities(entity_a, entity_b, [])
    return res

# --- 12. STATIC FILES & FALLBACK SPA ROUTER ---

dist_dir = os.path.join(BASE_DIR, "frontend", "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(dist_dir, "index.html"))

    @app.get("/{catchall:path}")
    async def serve_spa(catchall: str):
        if catchall.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        index_path = os.path.join(dist_dir, "index.html")
        return FileResponse(index_path)
else:
    @app.get("/")
    def root_no_build():
        return {
            "status": "online",
            "message": "NARCO-TRACE Unified Backend is running! React assets not compiled yet. Run 'npm run build' inside frontend."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
