import networkx as nx
from typing import Dict, List, Any, Set, Tuple
from graph_engine import IntelligenceGraph

def get_simple_digraph(igraph: IntelligenceGraph) -> nx.DiGraph:
    """
    Helper to convert a MultiDiGraph to a simple DiGraph by aggregating edge weights
    and carrying over node attributes. Useful for centrality and PageRank calculations.
    """
    with igraph.lock:
        simple_g = nx.DiGraph()
        # Copy nodes
        for node, attrs in igraph.graph.nodes(data=True):
            simple_g.add_node(node, **attrs)
        # Aggregate edge weights
        for u, v, attrs in igraph.graph.edges(data=True):
            weight = attrs.get("weight", 1.0)
            if simple_g.has_edge(u, v):
                simple_g[u][v]["weight"] += weight
            else:
                simple_g.add_edge(u, v, weight=weight)
        return simple_g

def get_simple_undirected_graph(igraph: IntelligenceGraph) -> nx.Graph:
    """
    Helper to convert a MultiDiGraph to an undirected simple Graph.
    Useful for community detection algorithms.
    """
    with igraph.lock:
        undirected_g = nx.Graph()
        for node, attrs in igraph.graph.nodes(data=True):
            undirected_g.add_node(node, **attrs)
        for u, v, attrs in igraph.graph.edges(data=True):
            weight = attrs.get("weight", 1.0)
            if undirected_g.has_edge(u, v):
                undirected_g[u][v]["weight"] += weight
            elif undirected_g.has_edge(v, u):
                undirected_g[v][u]["weight"] += weight
            else:
                undirected_g.add_edge(u, v, weight=weight)
        return undirected_g

def forward_trace(igraph: IntelligenceGraph, start_node: str, max_depth: int = 5) -> Dict[str, Any]:
    """
    Traces downstream flow (forward paths) from a starting node.
    Returns a Cytoscape JSON representation of the resulting subgraph.
    """
    with igraph.lock:
        if not igraph.graph.has_node(start_node):
            return {"nodes": [], "edges": []}

        visited_nodes: Set[str] = {start_node}
        queue: List[Tuple[str, int]] = [(start_node, 0)]
        visited_edges: Set[Tuple[str, str, str]] = set()

        while queue:
            curr_node, depth = queue.pop(0)
            if depth >= max_depth:
                continue

            for neighbor in igraph.graph.successors(curr_node):
                # Fetch all edge keys between curr_node and neighbor
                edge_data = igraph.graph.get_edge_data(curr_node, neighbor)
                if edge_data:
                    for key in edge_data.keys():
                        visited_edges.add((curr_node, neighbor, key))
                
                if neighbor not in visited_nodes:
                    visited_nodes.add(neighbor)
                    queue.append((neighbor, depth + 1))

        # Reconstruct subgraph
        subgraph = nx.MultiDiGraph()
        for node in visited_nodes:
            subgraph.add_node(node, **igraph.graph.nodes[node])
        for u, v, key in visited_edges:
            subgraph.add_edge(u, v, key=key, **igraph.graph.get_edge_data(u, v, key))

        return igraph.to_cytoscape(subgraph)

def backward_trace(igraph: IntelligenceGraph, start_node: str, max_depth: int = 5) -> Dict[str, Any]:
    """
    Traces upstream supply chain flow (backward paths) from a starting node.
    Returns a Cytoscape JSON representation of the resulting subgraph.
    """
    with igraph.lock:
        if not igraph.graph.has_node(start_node):
            return {"nodes": [], "edges": []}

        visited_nodes: Set[str] = {start_node}
        queue: List[Tuple[str, int]] = [(start_node, 0)]
        visited_edges: Set[Tuple[str, str, str]] = set()

        while queue:
            curr_node, depth = queue.pop(0)
            if depth >= max_depth:
                continue

            for predecessor in igraph.graph.predecessors(curr_node):
                # Fetch all edge keys between predecessor and curr_node
                edge_data = igraph.graph.get_edge_data(predecessor, curr_node)
                if edge_data:
                    for key in edge_data.keys():
                        visited_edges.add((predecessor, curr_node, key))
                
                if predecessor not in visited_nodes:
                    visited_nodes.add(predecessor)
                    queue.append((predecessor, depth + 1))

        # Reconstruct subgraph
        subgraph = nx.MultiDiGraph()
        for node in visited_nodes:
            subgraph.add_node(node, **igraph.graph.nodes[node])
        for u, v, key in visited_edges:
            subgraph.add_edge(u, v, key=key, **igraph.graph.get_edge_data(u, v, key))

        return igraph.to_cytoscape(subgraph)

def calculate_metrics(igraph: IntelligenceGraph) -> Dict[str, Dict[str, float]]:
    """
    Calculates network metrics for all nodes in the graph.
    Returns degree, betweenness, and PageRank scores.
    """
    with igraph.lock:
        if len(igraph.graph) == 0:
            return {}

        simple_di = get_simple_digraph(igraph)
        
        # Calculate centralities
        degree_cent = nx.degree_centrality(igraph.graph)
        
        # Betweenness centrality can fail if graph is empty or has 1 node, so handle gracefully
        try:
            between_cent = nx.betweenness_centrality(simple_di, weight="weight")
        except Exception:
            between_cent = {node: 0.0 for node in igraph.graph.nodes}
            
        try:
            pagerank_scores = nx.pagerank(simple_di, weight="weight")
        except Exception:
            pagerank_scores = {node: 0.0 for node in igraph.graph.nodes}

        metrics = {}
        for node in igraph.graph.nodes:
            metrics[node] = {
                "degree_centrality": round(degree_cent.get(node, 0.0), 4),
                "betweenness_centrality": round(between_cent.get(node, 0.0), 4),
                "pagerank": round(pagerank_scores.get(node, 0.0), 4)
            }
        return metrics

def detect_communities(igraph: IntelligenceGraph) -> Dict[str, int]:
    """
    Groups nodes into communities using Louvain community detection.
    Falls back to greedy modularity communities if Louvain fails or is unavailable.
    """
    with igraph.lock:
        if len(igraph.graph) == 0:
            return {}

        undirected = get_simple_undirected_graph(igraph)
        
        try:
            import community as community_louvain
            partition = community_louvain.best_partition(undirected, weight="weight")
            return partition
        except Exception:
            # Fallback to greedy modularity
            try:
                from networkx.algorithms import community
                comm_list = community.greedy_modularity_communities(undirected)
                partition = {}
                for idx, comm in enumerate(comm_list):
                    for node in comm:
                        partition[node] = int(idx)
                return partition
            except Exception:
                # If all else fails, everyone is in community 0
                return {node: 0 for node in igraph.graph.nodes}
