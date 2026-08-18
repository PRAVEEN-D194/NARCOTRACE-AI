import time
import datetime
from typing import Dict, List, Any

class AuditLogger:
    def __init__(self):
        # In-memory audit log list
        self.logs: List[Dict[str, Any]] = []
        # Prepopulate with mock audit trails
        self._load_demo_logs()

    def _load_demo_logs(self):
        base_time = time.time() - 86400  # 1 day ago
        self.log_event(
            username="investigator1",
            role="INVESTIGATOR",
            action="VIEW_PACKAGE",
            resource="PKG-041",
            status="ALLOWED",
            details="Viewed masked package summary.",
            timestamp=base_time
        )
        self.log_event(
            username="investigator1",
            role="INVESTIGATOR",
            action="VIEW_RAW_REPORT",
            resource="RAW-REP-092",
            status="BLOCKED",
            details="Attempted to access unmasked source details without authorization.",
            timestamp=base_time + 60
        )
        self.log_event(
            username="senior_analyst1",
            role="SENIOR_ANALYST",
            action="APPROVE_PACKAGE",
            resource="PKG-041",
            status="ALLOWED",
            details="Approved intelligence package for distribution.",
            timestamp=base_time + 120
        )

    def log_event(
        self,
        username: str,
        role: str,
        action: str,
        resource: str,
        status: str,  # ALLOWED, BLOCKED, OVERRIDDEN
        details: str,
        timestamp: float = None
    ) -> Dict[str, Any]:
        log_entry = {
            "log_id": f"AUDIT-{int(time.time() * 1000)}",
            "timestamp": timestamp or time.time(),
            "formatted_time": datetime.datetime.fromtimestamp(timestamp or time.time()).strftime('%Y-%m-%d %H:%M:%S'),
            "username": username,
            "role": role,
            "action": action,
            "resource": resource,
            "status": status,
            "details": details
        }
        self.logs.append(log_entry)
        return log_entry

    def list_logs(self) -> List[Dict[str, Any]]:
        # Return newest logs first
        return sorted(self.logs, key=lambda x: x["timestamp"], reverse=True)

    def detect_anomalies(self) -> List[Dict[str, Any]]:
        """
        Analyzes log entries for security anomalies:
        1. Off-hours activity (10 PM to 6 AM)
        2. High-frequency queries (5+ package views within 10 seconds by same user)
        3. Successive access blocks (3+ blocks within 1 minute by same user)
        """
        anomalies = []
        user_access_times: Dict[str, List[float]] = {}
        user_blocks: Dict[str, List[float]] = {}

        for log in sorted(self.logs, key=lambda x: x["timestamp"]):
            username = log["username"]
            ts = log["timestamp"]
            
            # 1. Off-hours detection
            dt = datetime.datetime.fromtimestamp(ts)
            if dt.hour >= 22 or dt.hour < 6:
                anomalies.append({
                    "type": "OFF_HOURS_ACCESS",
                    "severity": "MEDIUM",
                    "username": username,
                    "timestamp": ts,
                    "formatted_time": log["formatted_time"],
                    "description": f"User {username} performed action '{log['action']}' during off-hours ({dt.hour:02d}:{dt.minute:02d})."
                })

            # Track for frequency and blocks
            if log["action"] in ["VIEW_PACKAGE", "VIEW_RAW_REPORT"]:
                user_access_times.setdefault(username, []).append(ts)
            if log["status"] == "BLOCKED":
                user_blocks.setdefault(username, []).append(ts)

        # 2. High frequency check
        for username, times in user_access_times.items():
            for i in range(len(times)):
                # Look ahead to see if 5 actions occur within 10 seconds
                window = [t for t in times[i:] if t - times[i] <= 10]
                if len(window) >= 5:
                    anomalies.append({
                        "type": "HIGH_FREQUENCY_ACCESS",
                        "severity": "HIGH",
                        "username": username,
                        "timestamp": window[-1],
                        "formatted_time": datetime.datetime.fromtimestamp(window[-1]).strftime('%Y-%m-%d %H:%M:%S'),
                        "description": f"User {username} made {len(window)} access requests in less than 10 seconds."
                    })
                    break # avoid reporting multiple times for same cluster

        # 3. Successive blocks check
        for username, block_times in user_blocks.items():
            for i in range(len(block_times)):
                window = [t for t in block_times[i:] if t - block_times[i] <= 60]
                if len(window) >= 3:
                    anomalies.append({
                        "type": "REPETITIVE_BLOCKED_ATTEMPTS",
                        "severity": "CRITICAL",
                        "username": username,
                        "timestamp": window[-1],
                        "formatted_time": datetime.datetime.fromtimestamp(window[-1]).strftime('%Y-%m-%d %H:%M:%S'),
                        "description": f"User {username} was blocked {len(window)} times within 60 seconds."
                    })
                    break

        return anomalies
