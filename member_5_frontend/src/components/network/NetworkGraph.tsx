import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Search,
  Maximize2,
  Filter,
} from 'lucide-react';
import { NetworkData, NetworkNode } from '../../types';
import { Button } from '../common/Button';

interface NetworkGraphProps {
  data: NetworkData;
  onSelectNode: (node: NetworkNode | null) => void;
  selectedNodeId?: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  data,
  onSelectNode,
  selectedNodeId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTraceMode, setActiveTraceMode] = useState<'all' | 'forward' | 'backward'>('all');

  // Colors based on EntityType
  const getTypeColor = (type: string, isSubject?: boolean) => {
    if (isSubject) return '#f43f5e'; // Rose pink
    switch (type) {
      case 'Person':
        return '#00f0ff'; // Cyber cyan
      case 'Account':
        return '#8b5cf6'; // Purple
      case 'Wallet':
        return '#f59e0b'; // Amber gold
      case 'Platform':
        return '#3b82f6'; // Blue
      case 'Organization':
        return '#10b981'; // Emerald
      default:
        return '#64748b';
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert data to Cytoscape elements format
    const elements: cytoscape.ElementDefinition[] = [
      ...data.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          riskScore: node.riskScore,
          color: getTypeColor(node.type, node.isSubject),
          isSubject: node.isSubject ? 'true' : 'false',
          rawNode: node,
        },
      })),
      ...data.edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: `${edge.relationship}${edge.transactionAmount ? ` (${edge.transactionAmount})` : ''}`,
          direction: edge.direction,
        },
      })),
    ];

    // Initialize Cytoscape Instance
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            color: '#f8fafc',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '12px',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            width: (node: cytoscape.NodeSingular) => (node.data('isSubject') === 'true' ? 52 : 38),
            height: (node: cytoscape.NodeSingular) => (node.data('isSubject') === 'true' ? 52 : 38),
            'border-width': (node: cytoscape.NodeSingular) => (node.data('isSubject') === 'true' ? 4 : 2),
            'border-color': '#0f172a',
            'shadow-blur': 15,
            'shadow-color': 'data(color)',
            'shadow-opacity': 0.8,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#ffffff',
            'shadow-blur': 25,
            'shadow-color': '#ffffff',
            'shadow-opacity': 1,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#334155',
            'target-arrow-color': '#00f0ff',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            color: '#94a3b8',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '9px',
            'text-background-opacity': 0.85,
            'text-background-color': '#0b111e',
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'arrow-scale': 1.2,
          },
        },
        {
          selector: 'edge.highlighted',
          style: {
            width: 4,
            'line-color': '#00f0ff',
            'target-arrow-color': '#00f0ff',
            color: '#00f0ff',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 4,
            'border-color': '#00f0ff',
            'shadow-blur': 25,
            'shadow-color': '#00f0ff',
          },
        },
        {
          selector: '.faded',
          style: {
            opacity: 0.25,
          },
        },
      ] as any,
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 40,
        spacingFactor: 1.45,
        animate: true,
        animationDuration: 500,
      },
    });

    // Handle node selection event
    cy.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data('rawNode');
      onSelectNode(nodeData);

      // Highlight neighbors
      const selectedNode = evt.target;
      cy.elements().addClass('faded');
      selectedNode.removeClass('faded');
      selectedNode.neighborhood().removeClass('faded');
      selectedNode.connectedEdges().addClass('highlighted');
    });

    // Tap background to clear selection
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        onSelectNode(null);
        cy.elements().removeClass('faded').removeClass('highlighted');
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [data]);

  // Handle selectedNodeId external sync
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    if (selectedNodeId) {
      const nodeEl = cy.getElementById(selectedNodeId);
      if (nodeEl.length > 0) {
        cy.elements().addClass('faded');
        nodeEl.removeClass('faded');
        nodeEl.neighborhood().removeClass('faded');
        nodeEl.connectedEdges().addClass('highlighted');
      }
    }
  }, [selectedNodeId]);

  // Filter / Search function
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cyRef.current || !searchQuery.trim()) return;
    const cy = cyRef.current;
    const match = cy.nodes().filter((n) =>
      n.data('label').toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match.length > 0) {
      cy.animate({
        center: { eles: match },
        zoom: 1.5,
      });
      match.select();
      onSelectNode(match.first().data('rawNode'));
    }
  };

  // Forward Trace algorithm (Subject -> Downstream targets)
  const handleForwardTrace = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    setActiveTraceMode('forward');
    const subject = cy.nodes('[isSubject = "true"]').first();
    if (subject.length === 0) return;

    // Outgoers traversal
    const outgoers = subject.outgoers();
    cy.elements().addClass('faded');
    subject.removeClass('faded');
    outgoers.removeClass('faded');
    outgoers.edges().addClass('highlighted');

    cy.animate({
      fit: { eles: subject.union(outgoers), padding: 50 },
      duration: 500,
    });
  };

  // Backward Trace algorithm (Upstream suppliers -> Subject)
  const handleBackwardTrace = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    setActiveTraceMode('backward');
    const subject = cy.nodes('[isSubject = "true"]').first();
    if (subject.length === 0) return;

    // Incomers traversal
    const incomers = subject.incomers();
    cy.elements().addClass('faded');
    subject.removeClass('faded');
    incomers.removeClass('faded');
    incomers.edges().addClass('highlighted');

    cy.animate({
      fit: { eles: subject.union(incomers), padding: 50 },
      duration: 500,
    });
  };

  // Reset Graph view
  const handleResetGraph = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    setActiveTraceMode('all');
    cy.elements().removeClass('faded').removeClass('highlighted').unselect();
    cy.animate({
      fit: { eles: cy.elements(), padding: 40 },
      duration: 500,
    });
    onSelectNode(null);
  };

  return (
    <div className="relative w-full h-[620px] bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl flex flex-col transition-colors duration-200">
      {/* Network Graph Toolbar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-20">
        {/* Trace Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant={activeTraceMode === 'forward' ? 'primary' : 'outline'}
            size="sm"
            icon={ArrowRight}
            onClick={handleForwardTrace}
          >
            Forward Trace
          </Button>
          <Button
            variant={activeTraceMode === 'backward' ? 'primary' : 'outline'}
            size="sm"
            icon={ArrowLeft}
            onClick={handleBackwardTrace}
          >
            Backward Trace
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetGraph}
          >
            Reset Graph
          </Button>
        </div>

        {/* Search Node */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search node / entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 text-slate-200 placeholder-slate-500 text-xs font-mono rounded border border-slate-800 focus:border-cyan-500 focus:outline-none w-48"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Find
          </Button>
        </form>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
          <button
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
            title="Zoom In"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
            title="Zoom Out"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetGraph}
            title="Fit to View"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend & Status Ribbon */}
      <div className="px-4 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-10">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Subject</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span>Person</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Wallet</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
            <span>Account</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Supplier</span>
          </span>
        </div>
        <div className="flex items-center space-x-1 text-cyan-400">
          <Filter className="w-3 h-3" />
          <span>Interactive Topology View // Member 3 Engine</span>
        </div>
      </div>

      {/* Cytoscape Canvas Container */}
      <div ref={containerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative z-0" />
    </div>
  );
};
