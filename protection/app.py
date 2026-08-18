from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os

from auth import USERS_DB, authenticate_user, create_access_token, decode_access_token
from risk_engine import RiskEngine
from intelligence_cell import IntelligenceCell
from intelligence_firewall import IntelligenceFirewall
from audit_logger import AuditLogger

app = FastAPI(title="NARCO-TRACE Member 4 Protection Service")

# CORS middleware to allow the UI to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
cell = IntelligenceCell()
firewall = IntelligenceFirewall()
audit = AuditLogger()

# Pydantic schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class RiskEvaluationRequest(BaseModel):
    drug_activity_count: int
    cross_platform_links: int
    network_centrality: float
    financial_transactions_val: float
    historical_cases: int
    active_days: int

class CompilePackageRequest(BaseModel):
    package_id: str
    raw_report_ids: List[str]
    compiled_summary: str
    confidence_rating: float

class OverrideRequest(BaseModel):
    package_id: str
    requested_field: str
    reasoning: str

class ProcessOverrideRequest(BaseModel):
    request_id: str
    approved: bool

# Dependency to verify token and return user payload
def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired or invalid authentication token",
        )
    return payload

@app.post("/auth/login")
def login(req: LoginRequest):
    user = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password"
        )
    token = create_access_token(user)
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.post("/risk/evaluate")
def evaluate_risk(req: RiskEvaluationRequest, user: dict = Depends(get_current_user)):
    res = RiskEngine.calculate_risk(
        drug_activity_count=req.drug_activity_count,
        cross_platform_links=req.cross_platform_links,
        network_centrality=req.network_centrality,
        financial_transactions_val=req.financial_transactions_val,
        historical_cases=req.historical_cases,
        active_days=req.active_days
    )
    audit.log_event(
        username=user["username"],
        role=user["role"],
        action="EVALUATE_RISK",
        resource=f"PRIORITY-{res['priority_score']}",
        status="ALLOWED",
        details=f"Evaluated risk score: {res['priority_score']} ({res['classification']})."
    )
    return res

@app.get("/intelligence/raw-reports")
def list_raw_reports(user: dict = Depends(get_current_user)):
    # Mask raw report details based on investigator role
    reports = cell.list_raw_reports()
    masked_reports = []
    for rep in reports:
        masked = firewall.mask_raw_report_for_role(rep, user["role"])
        masked_reports.append(masked)
        
    audit.log_event(
        username=user["username"],
        role=user["role"],
        action="LIST_RAW_REPORTS",
        resource="RAW_REPORTS",
        status="ALLOWED",
        details=f"Retrieved list of {len(reports)} raw reports."
    )
    return masked_reports

@app.get("/intelligence/packages")
def list_packages(user: dict = Depends(get_current_user)):
    packages = cell.list_packages()
    masked_packages = []
    for pkg in packages:
        # Mask package elements
        masked = firewall.mask_package_for_role(pkg, user["role"], cell.raw_reports)
        masked_packages.append(masked)
        
    audit.log_event(
        username=user["username"],
        role=user["role"],
        action="LIST_PACKAGES",
        resource="PACKAGES",
        status="ALLOWED",
        details=f"Retrieved list of {len(packages)} intelligence packages."
    )
    return masked_packages

@app.post("/intelligence/packages/compile")
def compile_package(req: CompilePackageRequest, user: dict = Depends(get_current_user)):
    if user["role"] not in ["SENIOR_ANALYST", "ADMIN"]:
        audit.log_event(
            username=user["username"],
            role=user["role"],
            action="COMPILE_PACKAGE",
            resource=req.package_id,
            status="BLOCKED",
            details="Attempted to compile package without senior clearance."
        )
        raise HTTPException(status_code=403, detail="Only Senior Analysts and Admins can compile intelligence packages.")
        
    pkg = cell.compile_package(
        package_id=req.package_id,
        raw_report_ids=req.raw_report_ids,
        compiled_summary=req.compiled_summary,
        confidence_rating=req.confidence_rating,
        creator=user["username"]
    )
    
    audit.log_event(
        username=user["username"],
        role=user["role"],
        action="COMPILE_PACKAGE",
        resource=req.package_id,
        status="ALLOWED",
        details=f"Successfully compiled package {req.package_id} with SHA-256: {pkg['package_sha256'][:10]}..."
    )
    return pkg

@app.post("/intelligence/packages/approve/{package_id}")
def approve_package(package_id: str, user: dict = Depends(get_current_user)):
    if user["role"] not in ["SENIOR_ANALYST", "ADMIN"]:
        audit.log_event(
            username=user["username"],
            role=user["role"],
            action="APPROVE_PACKAGE",
            resource=package_id,
            status="BLOCKED",
            details="Attempted to approve package without senior clearance."
        )
        raise HTTPException(status_code=403, detail="Only Senior Analysts and Admins can approve intelligence packages.")
        
    pkg = cell.approve_package(package_id, user["username"])
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
        
    audit.log_event(
        username=user["username"],
        role=user["role"],
        action="APPROVE_PACKAGE",
        resource=package_id,
        status="ALLOWED",
        details=f"Approved package {package_id}."
    )
    return pkg

@app.post("/intelligence/packages/reject/{package_id}")
def reject_package(package_id: str, user: dict = Depends(get_current_user)):
    if user["role"] not in ["SENIOR_ANALYST", "ADMIN"]:
        audit.log_event(
            username=user["username"],
            role=user["role"],
            action="REJECT_PACKAGE",
            resource=package_id,
            status="BLOCKED",
            details="Attempted to reject package without senior clearance."
        )
        raise HTTPException(status_code=403, detail="Only Senior Analysts and Admins can reject intelligence packages.")
        
    pkg = cell.reject_package(package_id, user["username"])
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
        
    audit.log_event(
        username=user["username"],
        role=user["role"],
        action="REJECT_PACKAGE",
        resource=package_id,
        status="ALLOWED",
        details=f"Rejected package {package_id}."
    )
    return pkg

@app.get("/intelligence/packages/{package_id}")
def get_package_detail(package_id: str, override_token: Optional[str] = Header(None), user: dict = Depends(get_current_user)):
    pkg = cell.get_package(package_id)
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
        
    # Check if override token is valid for this investigator
    has_override = False
    if override_token:
        has_override = firewall.verify_override_token(override_token, user["username"])
        
    masked = firewall.mask_package_for_role(pkg, user["role"], cell.raw_reports, has_override=has_override)
    
    # Also attach the raw reports to the package details if the role permits or override is active
    raw_reps = []
    for r_id in pkg["raw_report_ids"]:
        if r_id in cell.raw_reports:
            raw_rep = cell.raw_reports[r_id]
            masked_rep = firewall.mask_raw_report_for_role(raw_rep, user["role"], has_override=has_override)
            raw_reps.append(masked_rep)
            
    masked["raw_reports"] = raw_reps
    
    audit_status = "OVERRIDDEN" if has_override else ("ALLOWED" if not masked.get("is_masked", False) else "ALLOWED_MASKED")
    audit.log_event(
        username=user["username"],
        role=user["role"],
        action="VIEW_PACKAGE_DETAIL",
        resource=package_id,
        status=audit_status,
        details=f"Viewed package detail. Override active: {has_override}."
    )
    return masked

@app.post("/firewall/request-override")
def request_override(req: OverrideRequest, user: dict = Depends(get_current_user)):
    res = firewall.create_authorization_request(
        investigator=user["username"],
        package_id=req.package_id,
        requested_field=req.requested_field,
        reasoning=req.reasoning
    )
    audit.log_event(
        username=user["username"],
        role=user["role"],
        action="REQUEST_FIREWALL_OVERRIDE",
        resource=res["request_id"],
        status="ALLOWED",
        details=f"Requested access to field {req.requested_field} on package {req.package_id}."
    )
    return res

@app.get("/firewall/list-overrides")
def list_overrides(user: dict = Depends(get_current_user)):
    return firewall.list_requests()

@app.post("/firewall/process-override")
def process_override(req: ProcessOverrideRequest, user: dict = Depends(get_current_user)):
    if user["role"] not in ["SENIOR_ANALYST", "ADMIN"]:
        audit.log_event(
            username=user["username"],
            role=user["role"],
            action="PROCESS_FIREWALL_OVERRIDE",
            resource=req.request_id,
            status="BLOCKED",
            details="Attempted to process firewall override without senior status."
        )
        raise HTTPException(status_code=403, detail="Only Senior Analysts and Admins can approve firewall override requests.")
        
    if req.approved:
        res = firewall.approve_authorization_request(req.request_id, user["username"])
        action_desc = "Approved"
    else:
        res = firewall.reject_authorization_request(req.request_id, user["username"])
        action_desc = "Rejected"
        
    if not res:
        raise HTTPException(status_code=404, detail="Override request not found")
        
    audit.log_event(
        username=user["username"],
        role=user["role"],
        action="PROCESS_FIREWALL_OVERRIDE",
        resource=req.request_id,
        status="ALLOWED",
        details=f"{action_desc} override request {req.request_id}."
    )
    return res

@app.get("/audit/logs")
def get_audit_logs(user: dict = Depends(get_current_user)):
    if user["role"] not in ["ADMIN", "SENIOR_ANALYST"]:
        raise HTTPException(status_code=403, detail="Only Admins or Senior Analysts can access audit trails.")
    return audit.list_logs()

@app.get("/audit/anomalies")
def get_anomalies(user: dict = Depends(get_current_user)):
    if user["role"] not in ["ADMIN", "SENIOR_ANALYST"]:
        raise HTTPException(status_code=403, detail="Only Admins or Senior Analysts can access anomalies.")
    return audit.detect_anomalies()

# Populate default packages for testing
cell.compile_package(
    package_id="PKG-041",
    raw_report_ids=["RAW-REP-092"],
    compiled_summary="Intelligence points to DarkWolf23 coordinating Heroin supply operations via Telegram bot @dw23_bot. Deliveries centered around Sector 17, Chandigarh. Funds tracked to BTC/LTC wallet cluster.",
    confidence_rating=0.92,
    creator="senior_analyst1"
)

# Bind the current package path to serve the visual dashboard
frontend_path = os.path.dirname(os.path.abspath(__file__))
app.mount("/dashboard", StaticFiles(directory=frontend_path, html=True), name="dashboard")
