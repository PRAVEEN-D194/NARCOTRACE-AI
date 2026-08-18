from typing import Dict, List, Any

class RiskEngine:
    @staticmethod
    def calculate_risk(
        drug_activity_count: int,
        cross_platform_links: int,
        network_centrality: float,  # between 0.0 and 1.0
        financial_transactions_val: float,  # in USD/equivalent
        historical_cases: int,
        active_days: int
    ) -> Dict[str, Any]:
        """
        Calculates a priority score from 0-100 and provides a SHAP-like breakdown of contributions.
        """
        # Feature base value (starting score)
        base_value = 10.0
        
        # Calculate individual feature contributions (SHAP-like force values)
        # 1. Drug Activity (Max +25)
        drug_contrib = min(25.0, drug_activity_count * 2.5)
        
        # 2. Cross-platform Linkage (Max +20)
        linkage_contrib = min(20.0, cross_platform_links * 4.0)
        
        # 3. Network Importance / Centrality (Max +18)
        network_contrib = min(18.0, network_centrality * 18.0)
        
        # 4. Financial Association (Max +15)
        # E.g. $1000+ scales to 15
        financial_contrib = min(15.0, (financial_transactions_val / 500.0))
        
        # 5. Historical Linkage (Max +12)
        history_contrib = min(12.0, historical_cases * 3.0)
        
        # 6. Persistent Activity / Duration (Max +10)
        persistence_contrib = min(10.0, (active_days / 30.0) * 1.5)
        
        # Sum the values
        total_score = base_value + drug_contrib + linkage_contrib + network_contrib + financial_contrib + history_contrib + persistence_contrib
        total_score = min(100.0, max(0.0, total_score))
        
        # Format contributions (simulating SHAP force model values)
        contributions = [
            {"feature": "Base Value", "contribution": round(base_value, 2)},
            {"feature": "Drug Activity Evidence", "contribution": round(drug_contrib, 2)},
            {"feature": "Cross-Platform Linkage", "contribution": round(linkage_contrib, 2)},
            {"feature": "Network Centrality Importance", "contribution": round(network_contrib, 2)},
            {"feature": "Financial Association Value", "contribution": round(financial_contrib, 2)},
            {"feature": "Historical Criminal Linkage", "contribution": round(history_contrib, 2)},
            {"feature": "Persistence of Online Activity", "contribution": round(persistence_contrib, 2)}
        ]
        
        # Risk classification
        if total_score >= 80:
            classification = "CRITICAL"
        elif total_score >= 60:
            classification = "HIGH"
        elif total_score >= 40:
            classification = "MEDIUM"
        else:
            classification = "LOW"
            
        return {
            "priority_score": round(total_score, 1),
            "classification": classification,
            "base_value": base_value,
            "contributions": contributions,
            "raw_metrics": {
                "drug_activity_count": drug_activity_count,
                "cross_platform_links": cross_platform_links,
                "network_centrality": network_centrality,
                "financial_transactions_val": financial_transactions_val,
                "historical_cases": historical_cases,
                "active_days": active_days
            }
        }
