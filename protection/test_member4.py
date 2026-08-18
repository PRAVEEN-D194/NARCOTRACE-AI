import unittest
import time
from auth import USERS_DB, authenticate_user, create_access_token, decode_access_token
from risk_engine import RiskEngine
from intelligence_cell import IntelligenceCell
from intelligence_firewall import IntelligenceFirewall
from audit_logger import AuditLogger

class TestMember4(unittest.TestCase):
    def setUp(self):
        self.cell = IntelligenceCell()
        self.firewall = IntelligenceFirewall()
        self.audit = AuditLogger()

    def test_rbac_auth(self):
        # Authenticate valid investigator
        user = authenticate_user("investigator1", "password123")
        self.assertIsNotNone(user)
        self.assertEqual(user["role"], "INVESTIGATOR")

        # Check token generation and decoding
        token = create_access_token(user)
        decoded = decode_access_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["username"], "investigator1")
        self.assertEqual(decoded["role"], "INVESTIGATOR")

        # Invalid auth
        invalid = authenticate_user("investigator1", "wrongpassword")
        self.assertIsNone(invalid)


    def test_risk_engine(self):
        # Calculate critical risk profile
        res = RiskEngine.calculate_risk(
            drug_activity_count=10,
            cross_platform_links=4,
            network_centrality=0.85,
            financial_transactions_val=2500,
            historical_cases=3,
            active_days=90
        )
        self.assertGreaterEqual(res["priority_score"], 80)
        self.assertEqual(res["classification"], "CRITICAL")
        
        # Verify SHAP contributions sum to total
        total_from_contribs = sum(c["contribution"] for c in res["contributions"])
        self.assertAlmostEqual(res["priority_score"], total_from_contribs, places=1)

    def test_intelligence_cell_and_provenance(self):
        # Verify raw reports have SHA-256 provenance hash
        reports = self.cell.list_raw_reports()
        self.assertTrue(len(reports) > 0)
        first_rep = reports[0]
        self.assertIn("sha256_provenance", first_rep)
        self.assertEqual(len(first_rep["sha256_provenance"]), 64)  # Hex representation length of SHA-256

        # Compile Package
        pkg = self.cell.compile_package(
            package_id="PKG-TEST",
            raw_report_ids=["RAW-REP-092"],
            compiled_summary="Test Summary content",
            confidence_rating=0.9,
            creator="senior_analyst1"
        )
        self.assertEqual(pkg["status"], "PENDING_REVIEW")
        self.assertEqual(pkg["package_sha256"], self.cell.calculate_sha256(pkg))

        # Approve Package
        approved = self.cell.approve_package("PKG-TEST", "senior_analyst1")
        self.assertEqual(approved["status"], "APPROVED")

    def test_intelligence_firewall_masking(self):
        pkg = self.cell.compile_package(
            package_id="PKG-TEST",
            raw_report_ids=["RAW-REP-092"],
            compiled_summary="Test Summary content",
            confidence_rating=0.9,
            creator="senior_analyst1"
        )

        # Masking for INVESTIGATOR role without override
        masked = self.firewall.mask_package_for_role(pkg, "INVESTIGATOR", self.cell.raw_reports, has_override=False)
        self.assertTrue(masked["is_masked"])
        for src in masked["sources_provenance"]:
            self.assertEqual(src["source_type"], "[PROTECTED SOURCE CELL]")

        # Masking for SENIOR_ANALYST role
        unmasked = self.firewall.mask_package_for_role(pkg, "SENIOR_ANALYST", self.cell.raw_reports, has_override=False)
        self.assertFalse(unmasked["is_masked"])

        # Override creation and verification
        req = self.firewall.create_authorization_request("investigator1", "PKG-TEST", "source_details", "For trial trace")
        self.assertEqual(req["status"], "PENDING")

        # Approve and retrieve token
        req_approved = self.firewall.approve_authorization_request(req["request_id"], "senior_analyst1")
        token = req_approved["auth_token"]
        self.assertIsNotNone(token)
        self.assertTrue(self.firewall.verify_override_token(token, "investigator1"))

        # Verify override unmasks fields for Investigator
        masked_with_override = self.firewall.mask_package_for_role(pkg, "INVESTIGATOR", self.cell.raw_reports, has_override=True)
        self.assertFalse(masked_with_override["is_masked"])

    def test_audit_anomalies(self):
        # Register logs
        self.audit.log_event("investigator1", "INVESTIGATOR", "VIEW_PACKAGE", "PKG-041", "ALLOWED", "Accessing")
        
        # Test Off-Hours Access Anomaly detection
        off_hours_ts = time.mktime(time.strptime("2026-08-18 23:30:00", "%Y-%m-%d %H:%M:%S"))
        self.audit.log_event("investigator1", "INVESTIGATOR", "VIEW_PACKAGE", "PKG-041", "ALLOWED", "Late access", timestamp=off_hours_ts)
        
        anomalies = self.audit.detect_anomalies()
        anomaly_types = [a["type"] for a in anomalies]
        self.assertIn("OFF_HOURS_ACCESS", anomaly_types)

if __name__ == "__main__":
    unittest.main()
