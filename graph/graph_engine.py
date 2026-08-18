import threading
from datetime import datetime, timezone
import networkx as nx
from typing import Dict, List, Any, Optional, Tuple

class IntelligenceGraph:
    """
    A thread-safe wrapper around a NetworkX MultiDiGraph for managing
    NARCO-TRACE intelligence data. Supports dynamic node/edge creation,
    filtering, and Cytoscape.js export.
    """
    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self.lock = threading.RLock()

    def add_node(self, node_id: str, node_type: str, label: str, risk_score: float = 0.0, metadata: Optional[Dict[str, Any]] = None) -> None:
        """
        Adds a node to the intelligence graph.
        """
        with self.lock:
            self.graph.add_node(
                node_id,
                type=node_type,
                label=label,
                risk_score=float(risk_score),
                metadata=metadata or {},
                created_at=datetime.now(timezone.utc).isoformat()
            )

    def add_edge(self, source: str, target: str, edge_type: str, weight: float = 1.0, timestamp: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Adds a directed edge between two nodes. Returns the unique edge key.
        """
        with self.lock:
            # Ensure nodes exist
            if not self.graph.has_node(source):
                self.add_node(source, "unknown", source)
            if not self.graph.has_node(target):
                self.add_node(target, "unknown", target)
                
            edge_key = f"{source}-{target}-{edge_type}-{timestamp or 'static'}"
            self.graph.add_edge(
                source,
                target,
                key=edge_key,
                type=edge_type,
                weight=float(weight),
                timestamp=timestamp or datetime.now(timezone.utc).isoformat(),
                metadata=metadata or {}
            )
            return edge_key

    def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        """
        Returns attributes of a specific node.
        """
        with self.lock:
            if self.graph.has_node(node_id):
                return dict(self.graph.nodes[node_id])
            return None

    def get_nodes(self, node_type: Optional[str] = None, min_risk: float = 0.0) -> Dict[str, Dict[str, Any]]:
        """
        Returns nodes matching filters.
        """
        with self.lock:
            result = {}
            for node_id, attrs in self.graph.nodes(data=True):
                if node_type and attrs.get("type") != node_type:
                    continue
                if attrs.get("risk_score", 0.0) < min_risk:
                    continue
                result[node_id] = attrs
            return result

    def get_edges(self, edge_type: Optional[str] = None, min_weight: float = 0.0) -> List[Dict[str, Any]]:
        """
        Returns edges matching filters.
        """
        with self.lock:
            result = []
            for u, v, key, attrs in self.graph.edges(keys=True, data=True):
                if edge_type and attrs.get("type") != edge_type:
                    continue
                if attrs.get("weight", 1.0) < min_weight:
                    continue
                edge_data = {
                    "source": u,
                    "target": v,
                    "key": key,
                    **attrs
                }
                result.append(edge_data)
            return result

    def remove_node(self, node_id: str) -> bool:
        """
        Removes a node and its associated edges from the graph.
        """
        with self.lock:
            if self.graph.has_node(node_id):
                self.graph.remove_node(node_id)
                return True
            return False

    def clear(self) -> None:
        """
        Clears the entire graph.
        """
        with self.lock:
            self.graph.clear()

    def get_subgraph(self, node_ids: List[str]) -> nx.MultiDiGraph:
        """
        Returns a subgraph containing only the specified nodes and their connecting edges.
        """
        with self.lock:
            valid_nodes = [n for n in node_ids if self.graph.has_node(n)]
            return self.graph.subgraph(valid_nodes).copy()

    def to_cytoscape(self, custom_graph: Optional[nx.MultiDiGraph] = None) -> Dict[str, List[Dict[str, Any]]]:
        """
        Converts the graph (or a custom subgraph) to a Cytoscape.js compatible JSON format.
        """
        with self.lock:
            g = custom_graph if custom_graph is not None else self.graph
            elements = {"nodes": [], "edges": []}
            
            for node_id, attrs in g.nodes(data=True):
                elements["nodes"].append({
                    "data": {
                        "id": node_id,
                        "label": attrs.get("label", node_id),
                        "type": attrs.get("type", "unknown"),
                        "risk_score": attrs.get("risk_score", 0.0),
                        **attrs.get("metadata", {})
                    }
                })
                
            for u, v, key, attrs in g.edges(keys=True, data=True):
                elements["edges"].append({
                    "data": {
                        "id": key,
                        "source": u,
                        "target": v,
                        "type": attrs.get("type", "linked"),
                        "weight": attrs.get("weight", 1.0),
                        "timestamp": attrs.get("timestamp"),
                        **attrs.get("metadata", {})
                    }
                })
                
            return elements
