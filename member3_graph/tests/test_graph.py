import pytest
from fastapi.testclient import TestClient
from graph_engine import IntelligenceGraph
from mock_data import populate_mock_data
import algorithms
import simulation
from main import app

client = TestClient(app)

@pytest.fixture
def clean_graph():
    igraph = IntelligenceGraph()
    # Populate with small custom test set
    igraph.add_node("A", "actor", "Supplier A", 90.0, {"substances": ["Heroin"]})
    igraph.add_node("B", "actor", "Distributor B", 60.0, {"substances": ["Heroin"]})
    igraph.add_node("C", "actor", "Peddler C", 40.0, {"substances": ["Heroin"]})
    igraph.add_node("D", "actor", "Supplier D (Alt)", 85.0, {"substances": ["Heroin"]})
    
    # Trace: A -> B -> C (downstream)
    igraph.add_edge("A", "B", "supplies_to", weight=5.0, timestamp="2026-06-01T00:00:00Z")
    igraph.add_edge("B", "C", "supplies_to", weight=3.0, timestamp="2026-07-01T00:00:00Z")
    # Alternate path to D but no supply link yet
    igraph.add_edge("D", "B", "linked_to", weight=1.0, timestamp="2026-05-01T00:00:00Z")
    
    return igraph

def test_graph_basics(clean_graph):
    # Retrieve nodes
    nodes = clean_graph.get_nodes()
    assert len(nodes) == 4
    assert nodes["A"]["label"] == "Supplier A"
    assert nodes["B"]["risk_score"] == 60.0

    # Retrieve edges
    edges = clean_graph.get_edges()
    assert len(edges) == 3
    
    # Remove node
    clean_graph.remove_node("A")
    assert clean_graph.get_node("A") is None
    assert len(clean_graph.get_edges()) == 2 # Edges from/to A should be auto-deleted

def test_forward_backward_tracing(clean_graph):
    # Forward trace from A -> should reach B and C
    ftrace = algorithms.forward_trace(clean_graph, "A")
    ftrace_nodes = {node["data"]["id"] for node in ftrace["nodes"]}
    assert "A" in ftrace_nodes
    assert "B" in ftrace_nodes
    assert "C" in ftrace_nodes
    assert "D" not in ftrace_nodes  # D is not reachable downstream from A

    # Backward trace from C -> should reach B, A, and D (since D -> B exists)
    btrace = algorithms.backward_trace(clean_graph, "C")
    btrace_nodes = {node["data"]["id"] for node in btrace["nodes"]}
    assert "C" in btrace_nodes
    assert "B" in btrace_nodes
    assert "A" in btrace_nodes
    assert "D" in btrace_nodes

def test_metrics_and_communities(clean_graph):
    metrics = algorithms.calculate_metrics(clean_graph)
    assert "A" in metrics
    assert "pagerank" in metrics["A"]
    assert "degree_centrality" in metrics["A"]
    
    partitions = algorithms.detect_communities(clean_graph)
    assert len(partitions) == 4
    assert all(node in partitions for node in ["A", "B", "C", "D"])

def test_simulation_impact(clean_graph):
    # Disrupt node A
    res = simulation.simulate_impact(clean_graph, ["A"])
    metrics = res["metrics"]
    assert metrics["nodes"]["before"] == 4
    assert metrics["nodes"]["after"] == 3
    assert metrics["total_risk_score"]["reduction_percent"] > 0.0

def test_simulation_displacement(clean_graph):
    # Remove A. B was downstream of A.
    # Candidates of same type as A (Supplier D is type actor with Heroin substance focus).
    # Predict displacement of B.
    displacements = simulation.simulate_displacement(clean_graph, ["A"])
    assert len(displacements) > 0
    # The displaced node should be B
    assert displacements[0]["displaced_node"] == "B"
    # The predicted target should be D
    assert displacements[0]["predicted_target"] == "D"
    assert displacements[0]["probability"] > 0.0

def test_temporal_slicing(clean_graph):
    # Slicing at 2026-06-15 -> only edges before this date are included.
    # Edge A->B (2026-06-01) and D->B (2026-05-01) should be in the slice.
    # Edge B->C (2026-07-01) should NOT be in the slice.
    slice_res = simulation.slice_by_time(clean_graph, "2026-06-15T00:00:00Z")
    slice_edge_sources = {e["data"]["source"] for e in slice_res["edges"]}
    assert "A" in slice_edge_sources
    assert "D" in slice_edge_sources
    assert "B" not in slice_edge_sources # Because B->C is June 30 / July 1, excluded.

# --- Integration Tests via FastAPI Client ---

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_api_summary():
    response = client.get("/graph/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_nodes" in data
    assert "highest_risk_entity" in data

def test_api_add_delete_node():
    # Add node
    node_payload = {
        "id": "test_node_xyz",
        "type": "actor",
        "label": "Test Actor XYZ",
        "risk_score": 55.5,
        "metadata": {"test": True}
    }
    response = client.post("/graph/nodes", json=node_payload)
    assert response.status_code == 200
    
    # Retrieve node
    response = client.get("/graph/nodes/test_node_xyz")
    assert response.status_code == 200
    assert response.json()["label"] == "Test Actor XYZ"

    # Delete node
    response = client.delete("/graph/nodes/test_node_xyz")
    assert response.status_code == 200
    
    # Retrieve again (should be 404)
    response = client.get("/graph/nodes/test_node_xyz")
    assert response.status_code == 404

def test_api_disruption_simulation():
    # Target DarkWolf23
    payload = {"target_nodes": ["actor_darkwolf23"]}
    response = client.post("/graph/simulate/disruption", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "impact_analysis" in data
    assert "displacement_predictions" in data
