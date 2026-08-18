import uuid
import time
from typing import Dict, Any, List, Optional

class IntelligenceFirewall:
    def __init__(self):
        # Store for Senior Authorization requests
        self.auth_requests: Dict[str, Dict[str, Any]] = {}
        # Prepopulate one request for demo
        self._load_demo_requests()

    def _load_demo_requests(self):
        req_id = "REQ-5829"
        self.auth_requests[req_id] = {
            "request_id": req_id,
            "investigator": "investigator1",
            "package_id": "PKG-041",
            "requested_field": "source_details",
            "reasoning": "Need to trace the physical drop location IP address to confirm if it belongs to a local cyber cafe in Sector 17.",
            "status": "PENDING", # PENDING, APPROVED, REJECTED
            "approved_by": None,
            "auth_token": None,
            "timestamp": time.time() - 3600
        }

    def mask_package_for_role(self, package: Dict[str, Any], role: str, raw_report_lookup: Dict[str, Dict[str, Any]], has_override: bool = False) -> Dict[str, Any]:
        """
        Masks sensitive raw intelligence details from the package or reports based on the user's role.
        - If role is SENIOR_ANALYST or ADMIN, or has_override is True: no masking.
        - If role is INVESTIGATOR: mask raw sources, analyst notes, and raw collection details.
        """
        # Create a deep-ish copy
        masked_pkg = json_copy(package)
        
        # Masking rules for INVESTIGATOR
        if role == "INVESTIGATOR" and not has_override:
            # Mask sensitive parts of the package summary if it contains raw PII (simulated)
            masked_pkg["is_masked"] = True
            
            # Hide raw_report_ids and sources_provenance detail
            # Investigators only see the package SHA-256 for verification but not raw URL/IP details of source
            if "sources_provenance" in masked_pkg:
                for src in masked_pkg["sources_provenance"]:
                    # Mask specific source types or urls
                    src["source_type"] = "[PROTECTED SOURCE CELL]"
                    
            # If full raw reports are attached, mask them fully
            if "raw_reports" in masked_pkg:
                masked_pkg["raw_reports"] = [] # Investigators don't get raw reports directly
        else:
            masked_pkg["is_masked"] = False
            
        return masked_pkg

    def mask_raw_report_for_role(self, report: Dict[str, Any], role: str, has_override: bool = False) -> Dict[str, Any]:
        """
        Masks sensitive data on a raw report.
        """
        masked = json_copy(report)
        if role == "INVESTIGATOR" and not has_override:
            masked["source_details"] = "[MASKED - REQUIRES SENIOR AUTHORIZATION]"
            masked["analyst_notes"] = "[MASKED - REQUIRES SENIOR AUTHORIZATION]"
            masked["is_masked"] = True
        else:
            masked["is_masked"] = False
        return masked

    def create_authorization_request(self, investigator: str, package_id: str, requested_field: str, reasoning: str) -> Dict[str, Any]:
        req_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
        req = {
            "request_id": req_id,
            "investigator": investigator,
            "package_id": package_id,
            "requested_field": requested_field,
            "reasoning": reasoning,
            "status": "PENDING",
            "approved_by": None,
            "auth_token": None,
            "timestamp": time.time()
        }
        self.auth_requests[req_id] = req
        return req

    def approve_authorization_request(self, request_id: str, approver: str) -> Optional[Dict[str, Any]]:
        if request_id in self.auth_requests:
            req = self.auth_requests[request_id]
            req["status"] = "APPROVED"
            req["approved_by"] = approver
            # Generate a secure override token
            req["auth_token"] = f"OVERRIDE-TOKEN-{uuid.uuid4().hex[:12].upper()}"
            req["approval_timestamp"] = time.time()
            return req
        return None

    def reject_authorization_request(self, request_id: str, rejecter: str) -> Optional[Dict[str, Any]]:
        if request_id in self.auth_requests:
            req = self.auth_requests[request_id]
            req["status"] = "REJECTED"
            req["approved_by"] = rejecter
            req["approval_timestamp"] = time.time()
            return req
        return None

    def verify_override_token(self, token: str, investigator: str) -> bool:
        """
        Checks if a given override token exists, is approved, and belongs to the investigator.
        """
        for req in self.auth_requests.values():
            if req["auth_token"] == token and req["investigator"] == investigator and req["status"] == "APPROVED":
                return True
        return False

    def list_requests(self) -> List[Dict[str, Any]]:
        return list(self.auth_requests.values())


def json_copy(obj: Any) -> Any:
    # Quick utility for deep copy
    import json
    return json.loads(json.dumps(obj))
