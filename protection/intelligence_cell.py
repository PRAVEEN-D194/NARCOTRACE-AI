import hashlib
import json
import time
from typing import Dict, List, Any, Optional

class IntelligenceCell:
    def __init__(self):
        # In-memory database of raw reports and compiled packages
        self.raw_reports: Dict[str, Dict[str, Any]] = {}
        self.packages: Dict[str, Dict[str, Any]] = {}
        
        # Populate with some demonstration data
        self._load_demo_data()

    def _load_demo_data(self):
        # Demo raw report from Member 1 & 2
        report_id = "RAW-REP-092"
        raw_content = {
            "source_type": "Dark-Web Forum + Telegram",
            "source_details": "Forum: OnionMarket (onion v3 url), Telegram Channel: @darkwolf_delivery_bot",
            "raw_text": "Heroin supply available in Chandigarh sector 17. Contact @dw23_bot. Payment to wallet 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
            "detected_slang": "chitta, powder, stuff",
            "extracted_entities": {
                "usernames": ["DarkWolf23", "Wolf_23", "DW23"],
                "drug_types": ["Heroin"],
                "locations": ["Sector 17, Chandigarh"],
                "crypto_wallets": ["3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"]
            },
            "confidence_score": 0.89,
            "analyst_notes": "Highly confident linkage based on matching profile avatars and overlapping publication times."
        }
        self.add_raw_report(report_id, raw_content)

    def calculate_sha256(self, data: Any) -> str:
        """
        Calculates SHA-256 hash of a serializable object to establish digital provenance.
        """
        if isinstance(data, dict):
            data_copy = data.copy()
            if "package_sha256" in data_copy:
                data_copy["package_sha256"] = ""
            serialized = json.dumps(data_copy, sort_keys=True, default=str)
        else:
            serialized = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode('utf-8')).hexdigest()


    def add_raw_report(self, report_id: str, content: Dict[str, Any]) -> str:
        content["timestamp"] = time.time()
        content["sha256_provenance"] = self.calculate_sha256(content)
        self.raw_reports[report_id] = content
        return content["sha256_provenance"]

    def compile_package(
        self,
        package_id: str,
        raw_report_ids: List[str],
        compiled_summary: str,
        confidence_rating: float,
        creator: str
    ) -> Dict[str, Any]:
        """
        Compiles raw intelligence report(s) into a structured package for review.
        """
        sources_provenance = []
        underlying_entities = {"usernames": set(), "drug_types": set(), "locations": set(), "crypto_wallets": set()}
        
        for r_id in raw_report_ids:
            if r_id in self.raw_reports:
                rep = self.raw_reports[r_id]
                sources_provenance.append({
                    "raw_report_id": r_id,
                    "sha256": rep["sha256_provenance"],
                    "source_type": rep["source_type"]
                })
                # Merge entities
                ents = rep.get("extracted_entities", {})
                for key in underlying_entities:
                    if key in ents:
                        underlying_entities[key].update(ents[key])

        # Convert sets to list
        for key in underlying_entities:
            underlying_entities[key] = list(underlying_entities[key])

        package = {
            "package_id": package_id,
            "raw_report_ids": raw_report_ids,
            "sources_provenance": sources_provenance,
            "compiled_summary": compiled_summary,
            "entities": underlying_entities,
            "confidence_rating": confidence_rating,
            "status": "PENDING_REVIEW",  # PENDING_REVIEW, APPROVED, REJECTED
            "approved_by": None,
            "approval_timestamp": None,
            "created_by": creator,
            "created_timestamp": time.time(),
            "package_sha256": ""
        }
        
        package["package_sha256"] = self.calculate_sha256(package)
        self.packages[package_id] = package
        return package

    def approve_package(self, package_id: str, approver: str) -> Optional[Dict[str, Any]]:
        """
        Approves a package inside the Intelligence Cell.
        """
        if package_id in self.packages:
            pkg = self.packages[package_id]
            pkg["status"] = "APPROVED"
            pkg["approved_by"] = approver
            pkg["approval_timestamp"] = time.time()
            # Recalculate hash with approval state
            pkg["package_sha256"] = self.calculate_sha256(pkg)
            return pkg
        return None

    def reject_package(self, package_id: str, reviewer: str) -> Optional[Dict[str, Any]]:
        """
        Rejects a package in the Intelligence Cell.
        """
        if package_id in self.packages:
            pkg = self.packages[package_id]
            pkg["status"] = "REJECTED"
            pkg["approved_by"] = reviewer
            pkg["approval_timestamp"] = time.time()
            pkg["package_sha256"] = self.calculate_sha256(pkg)
            return pkg
        return None

    def get_package(self, package_id: str) -> Optional[Dict[str, Any]]:
        return self.packages.get(package_id)

    def list_packages(self) -> List[Dict[str, Any]]:
        return list(self.packages.values())

    def list_raw_reports(self) -> List[Dict[str, Any]]:
        # Return format suited for listing
        return [{"report_id": k, **v} for k, v in self.raw_reports.items()]
