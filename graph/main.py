from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional

from graph_engine import IntelligenceGraph
from mock_data import populate_mock_data
import algorithms
import simulation

app = FastAPI(
    title="NARCO-TRACE Member 3 — Intelligence Graph & Network Reconstruction API",
    description="Backend graph engine powering supply chain tracing, community detection, network displacement, and impact simulations.",
    version="1.0.0"
)

# Enable CORS for cross-origin frontend integration (Member 5 React UI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon prototype ease of integration
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core thread-safe graph instance
igraph = IntelligenceGraph()

# Initialize with mock seed data on start
populate_mock_data(igraph)

# --- Pydantic Schemas for API Requests ---

class NodeCreate(BaseModel):
    id: str = Field(..., description="Unique identifier for the node")
    type: str = Field(..., description="Node category: actor, account, wallet, listing, substance, forum")
    label: str = Field(..., description="Display label for the node")
    risk_score: float = Field(0.0, ge=0.0, le=100.0, description="Risk assessment score (0-100)")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Key-value pairs for additional attributes")

class EdgeCreate(BaseModel):
    source: str = Field(..., description="ID of source node")
    target: str = Field(..., description="ID of target node")
    type: str = Field(..., description="Edge category: supplies_to, transacted_with, controls_wallet, operates, posted, mentions")
    weight: float = Field(1.0, description="Weight/strength of connection")
    timestamp: Optional[str] = Field(default=None, description="ISO 8601 timestamp of when edge occurred")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional context or evidence properties")

class DisruptionRequest(BaseModel):
    target_nodes: List[str] = Field(..., description="List of node IDs proposed for removal or arrest")

# --- Routes ---

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "NARCO-TRACE Member 3 - Intelligence Graph & Network Reconstruction",
        "endpoints_docs": "/docs"
    }

@app.post("/graph/reset", summary="Reset graph to default mock scenario")
def reset_graph():
    populate_mock_data(igraph)
    return {"message": "Graph successfully re-populated with mock drug-ring intelligence scenario"}

@app.get("/graph/summary", summary="Retrieve basic graph structural metrics")
def get_summary():
    with igraph.lock:
        num_nodes = len(igraph.graph)
        num_edges = len(igraph.graph.edges)
        
        type_breakdown = {}
        max_risk_node = None
        max_risk = -1.0
        
        for n, attrs in igraph.graph.nodes(data=True):
            ntype = attrs.get("type", "unknown")
            type_breakdown[ntype] = type_breakdown.get(ntype, 0) + 1
            risk = attrs.get("risk_score", 0.0)
            if risk > max_risk:
                max_risk = risk
                max_risk_node = {"id": n, "label": attrs.get("label"), "type": ntype, "risk": risk}
                
        return {
            "total_nodes": num_nodes,
            "total_edges": num_edges,
            "node_type_distribution": type_breakdown,
            "highest_risk_entity": max_risk_node
        }

@app.get("/graph/cytoscape", summary="Export complete graph in Cytoscape.js format")
def get_cytoscape():
    return igraph.to_cytoscape()

@app.get("/graph/nodes", summary="Query all nodes with optional filtering")
def get_nodes(
    type: Optional[str] = None, 
    min_risk: float = Query(0.0, ge=0.0, le=100.0)
):
    return igraph.get_nodes(node_type=type, min_risk=min_risk)

@app.get("/graph/nodes/{node_id}", summary="Get properties of a specific node")
def get_node(node_id: str):
    node = igraph.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found in the graph.")
    return node

@app.get("/graph/edges", summary="Query edges with optional filtering")
def get_edges(
    type: Optional[str] = None,
    min_weight: float = 0.0
):
    return igraph.get_edges(edge_type=type, min_weight=min_weight)

@app.post("/graph/nodes", summary="Dynamically add a new node to the graph")
def create_node(node: NodeCreate):
    igraph.add_node(
        node_id=node.id,
        node_type=node.type,
        label=node.label,
        risk_score=node.risk_score,
        metadata=node.metadata
    )
    return {"message": f"Node '{node.id}' successfully added/updated."}

@app.post("/graph/edges", summary="Dynamically add a new edge to the graph")
def create_edge(edge: EdgeCreate):
    with igraph.lock:
        if not igraph.graph.has_node(edge.source):
            raise HTTPException(status_code=400, detail=f"Source node '{edge.source}' does not exist.")
        if not igraph.graph.has_node(edge.target):
            raise HTTPException(status_code=400, detail=f"Target node '{edge.target}' does not exist.")
            
        edge_key = igraph.add_edge(
            source=edge.source,
            target=edge.target,
            edge_type=edge.type,
            weight=edge.weight,
            timestamp=edge.timestamp,
            metadata=edge.metadata
        )
        return {"message": "Edge successfully created", "edge_key": edge_key}

@app.delete("/graph/nodes/{node_id}", summary="Dynamically remove a node and its connections")
def delete_node(node_id: str):
    removed = igraph.remove_node(node_id)
    if not removed:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")
    return {"message": f"Node '{node_id}' and all adjacent connections successfully removed."}

@app.get("/graph/trace/forward", summary="Downstream distribution supply chain path reconstruction")
def trace_forward(
    node_id: str = Query(..., description="Target node ID to trace forward from"),
    max_depth: int = Query(5, ge=1, le=10, description="Max traversal depth")
):
    if not igraph.get_node(node_id):
        raise HTTPException(status_code=404, detail=f"Start node '{node_id}' not found.")
    return algorithms.forward_trace(igraph, node_id, max_depth)

@app.get("/graph/trace/backward", summary="Upstream supply chain source path reconstruction")
def trace_backward(
    node_id: str = Query(..., description="Target node ID to trace backward from"),
    max_depth: int = Query(5, ge=1, le=10, description="Max traversal depth")
):
    if not igraph.get_node(node_id):
        raise HTTPException(status_code=404, detail=f"Start node '{node_id}' not found.")
    return algorithms.backward_trace(igraph, node_id, max_depth)

@app.get("/graph/metrics", summary="Calculate global node centrality and PageRank metrics")
def get_metrics():
    return algorithms.calculate_metrics(igraph)

@app.get("/graph/communities", summary="Detect cellular drug ring partitions (Louvain)")
def get_communities():
    return algorithms.detect_communities(igraph)

@app.post("/graph/simulate/disruption", summary="Simulate node disruption impact & displacement")
def simulate_disruption(payload: DisruptionRequest):
    # Validate targets
    for target in payload.target_nodes:
        if not igraph.get_node(target):
            raise HTTPException(status_code=404, detail=f"Disruption target node '{target}' not found.")
            
    impact = simulation.simulate_impact(igraph, payload.target_nodes)
    displacement = simulation.simulate_displacement(igraph, payload.target_nodes)
    
    return {
        "impact_analysis": impact,
        "displacement_predictions": displacement
    }

@app.get("/graph/timeline", summary="Slice the graph by end timestamp (historical evolution)")
def get_timeline(
    end_time: str = Query(..., description="ISO 8601 end timestamp (e.g. 2026-07-01T12:00:00Z)"),
    start_time: Optional[str] = Query(None, description="Optional ISO 8601 start timestamp")
):
    return simulation.slice_by_time(igraph, end_time, start_time)
