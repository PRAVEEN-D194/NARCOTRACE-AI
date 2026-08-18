import networkx as nx
import copy
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Set
from graph_engine import IntelligenceGraph
from algorithms import get_simple_undirected_graph

def parse_utc_dt(val: Any) -> datetime:
    if isinstance(val, datetime):
        if val.tzinfo is None:
            return val.replace(tzinfo=timezone.utc)
        return val
    if isinstance(val, str):
        s = val.replace("Z", "+00:00")
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    raise ValueError(f"Cannot parse datetime from: {type(val)}")

def slice_by_time(igraph: IntelligenceGraph, end_time: str, start_time: Optional[str] = None) -> Dict[str, Any]:
    """
    Slices the graph to represent its state at/before a specific timestamp.
    Returns a Cytoscape JSON representation of the temporal slice.
    """
    with igraph.lock:
        sliced = nx.MultiDiGraph()
        
        # Parse filter timestamps
        end_dt = parse_utc_dt(end_time)
        start_dt = parse_utc_dt(start_time) if start_time else None

        # Add edges that fit the time window
        added_nodes = set()
        for u, v, key, attrs in igraph.graph.edges(keys=True, data=True):
            edge_time_str = attrs.get("timestamp")
            if not edge_time_str:
                continue
            
            edge_dt = parse_utc_dt(edge_time_str)
                
            # Perform temporal filter
            if start_dt and edge_dt < start_dt:
                continue
            if edge_dt > end_dt:
                continue
                
            # If valid, add edge and its endpoints
            if not sliced.has_node(u):
                sliced.add_node(u, **igraph.graph.nodes[u])
                added_nodes.add(u)
            if not sliced.has_node(v):
                sliced.add_node(v, **igraph.graph.nodes[v])
                added_nodes.add(v)
                
            sliced.add_edge(u, v, key=key, **attrs)

        # Include nodes that were created within time limits even if they have no active edges yet
        for node, attrs in igraph.graph.nodes(data=True):
            if node in added_nodes:
                continue
            created_str = attrs.get("created_at")
            if created_str:
                created_dt = parse_utc_dt(created_str)
                if start_dt and created_dt < start_dt:
                    continue
                if created_dt <= end_dt:
                    sliced.add_node(node, **attrs)

        return igraph.to_cytoscape(sliced)

def simulate_impact(igraph: IntelligenceGraph, target_nodes: List[str]) -> Dict[str, Any]:
    """
    Simulates the structural impact of arresting/removing target_nodes.
    Computes graph metrics before and after the removal.
    """
    with igraph.lock:
        # Pre-disruption stats
        g_before = get_simple_undirected_graph(igraph)
        nodes_before = len(g_before)
        edges_before = len(g_before.edges)
        
        if nodes_before == 0:
            return {"error": "Graph is empty"}

        # Calculate metrics before
        components_before = nx.number_connected_components(g_before)
        density_before = nx.density(g_before)
        
        try:
            avg_path_before = nx.average_shortest_path_length(g_before)
        except Exception:
            # If disconnected, calculate average path of the largest component
            try:
                largest_cc = max(nx.connected_components(g_before), key=len)
                avg_path_before = nx.average_shortest_path_length(g_before.subgraph(largest_cc))
            except Exception:
                avg_path_before = 0.0

        total_risk_before = sum(attrs.get("risk_score", 0.0) for n, attrs in g_before.nodes(data=True))

        # Post-disruption graph copy
        g_after = copy.deepcopy(g_before)
        for target in target_nodes:
            if g_after.has_node(target):
                g_after.remove_node(target)

        nodes_after = len(g_after)
        edges_after = len(g_after.edges)
        
        components_after = nx.number_connected_components(g_after) if nodes_after > 0 else 0
        density_after = nx.density(g_after) if nodes_after > 0 else 0.0
        
        try:
            avg_path_after = nx.average_shortest_path_length(g_after) if nodes_after > 0 else 0.0
        except Exception:
            try:
                largest_cc = max(nx.connected_components(g_after), key=len)
                avg_path_after = nx.average_shortest_path_length(g_after.subgraph(largest_cc))
            except Exception:
                avg_path_after = 0.0

        total_risk_after = sum(attrs.get("risk_score", 0.0) for n, attrs in g_after.nodes(data=True)) if nodes_after > 0 else 0.0
        risk_reduction = 100 * (1 - (total_risk_after / total_risk_before)) if total_risk_before > 0 else 100.0

        return {
            "disrupted_nodes": target_nodes,
            "metrics": {
                "nodes": {"before": nodes_before, "after": nodes_after, "diff": nodes_after - nodes_before},
                "edges": {"before": edges_before, "after": edges_after, "diff": edges_after - edges_before},
                "connected_components": {"before": components_before, "after": components_after, "diff": components_after - components_before},
                "density": {"before": round(density_before, 4), "after": round(density_after, 4), "diff": round(density_after - density_before, 4)},
                "average_shortest_path": {"before": round(avg_path_before, 2), "after": round(avg_path_after, 2), "diff": round(avg_path_after - avg_path_before, 2)},
                "total_risk_score": {"before": round(total_risk_before, 2), "after": round(total_risk_after, 2), "reduction_percent": round(risk_reduction, 2)}
            }
        }

def simulate_displacement(igraph: IntelligenceGraph, target_nodes: List[str]) -> List[Dict[str, Any]]:
    """
    Predicts network displacement when target_nodes are removed.
    For each displaced downstream buyer/distributor, predicts alternative suppliers
    they are likely to re-route to, based on remaining distance, common neighbors, and drug/platform types.
    """
    predictions = []
    with igraph.lock:
        # Identify nodes that will be removed
        removed_set = set(target_nodes)
        
        # 1. Identify all affected downstream nodes (successors of targets)
        affected_downstream: Set[str] = set()
        for target in target_nodes:
            if igraph.graph.has_node(target):
                affected_downstream.update(igraph.graph.successors(target))
                
        # Remove target nodes from the list of affected (so they don't route to themselves)
        affected_downstream = affected_downstream - removed_set
        
        # 2. Identify candidate alternative nodes of the same type/role as the targets
        # e.g., if target was a supplier, find other suppliers in the network
        target_types = {igraph.graph.nodes[t].get("type") for t in target_nodes if igraph.graph.has_node(t)}
        
        candidates: List[str] = []
        for n, attrs in igraph.graph.nodes(data=True):
            if n not in removed_set and attrs.get("type") in target_types:
                candidates.append(n)
                
        if not candidates or not affected_downstream:
            return []

        # Convert to undirected graph for distance metric calculations
        undirected_g = get_simple_undirected_graph(igraph)
        
        # Create a copy of the graph without the disrupted nodes to calculate remaining distances
        g_rem = copy.deepcopy(undirected_g)
        for t in target_nodes:
            if g_rem.has_node(t):
                g_rem.remove_node(t)

        for down_node in affected_downstream:
            down_attrs = igraph.graph.nodes[down_node]
            down_drugs = set(down_attrs.get("metadata", {}).get("substances", []))
            down_platform = down_attrs.get("metadata", {}).get("platform")

            # Check candidates
            for cand in candidates:
                if cand == down_node:
                    continue
                cand_attrs = igraph.graph.nodes[cand]
                cand_drugs = set(cand_attrs.get("metadata", {}).get("substances", []))
                cand_platform = cand_attrs.get("metadata", {}).get("platform")
                
                # Check remaining topological distance
                try:
                    path_len = nx.shortest_path_length(g_rem, source=down_node, target=cand)
                except Exception:
                    path_len = 999  # Disconnected
                
                # Calculate displacement factors
                common_neighbors = len(list(nx.common_neighbors(undirected_g, down_node, cand)))
                drug_overlap = len(down_drugs.intersection(cand_drugs))
                platform_match = 1.0 if down_platform and down_platform == cand_platform else 0.0
                is_customer = igraph.graph.has_edge(down_node, cand)

                # Formulate a probability score
                # Higher score if closer in remaining graph, has common neighbors, shares substance focus, or shares platform
                score = 0.0
                reasons = []
                
                if is_customer:
                    score -= 0.4  # Penalize re-routing supply to a downstream customer
                
                if path_len < 999:
                    # Near paths in remaining network mean they already have indirect connections
                    dist_weight = max(0, 5 - path_len) * 0.15 # up to 0.75 for 1-hop distance
                    score += dist_weight
                    if path_len <= 2:
                        reasons.append(f"Strong proximity in remaining graph ({path_len} hops)")
                
                if common_neighbors > 0:
                    score += min(0.3, common_neighbors * 0.05)
                    reasons.append(f"Shares {common_neighbors} mutual connection(s)")
                    
                if drug_overlap > 0:
                    score += min(0.2, drug_overlap * 0.1)
                    reasons.append(f"Specializes in matching substances ({', '.join(down_drugs.intersection(cand_drugs))})")
                    
                if platform_match > 0:
                    score += 0.1
                    reasons.append(f"Operates on the same platform ({down_platform})")
                
                # Normalize probability between 0.1 and 0.95
                prob = min(0.95, max(0.05, score))
                
                # Only report significant likelihoods
                if prob > 0.25:
                    predictions.append({
                        "displaced_node": down_node,
                        "displaced_node_label": down_attrs.get("label", down_node),
                        "predicted_target": cand,
                        "predicted_target_label": cand_attrs.get("label", cand),
                        "probability": round(prob, 2),
                        "reasons": reasons
                    })

        # Sort predictions by probability descending
        predictions.sort(key=lambda x: x["probability"], reverse=True)
        return predictions
