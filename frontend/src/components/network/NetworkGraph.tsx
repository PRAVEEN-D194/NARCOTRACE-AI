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

  // Color mapping per entity type
  const getTypeColor = (type: string, isSubject?: boolean) => {
    if (isSubject) return '#EF4444'; // Red/Rose for primary subject
    switch (type) {
      case 'Person':
        return '#3B82F6'; // Blue
      case 'Account':
        return '#8B5CF6'; // Purple
      case 'Wallet':
        return '#F59E0B'; // Amber
      case 'Platform':
        return '#06B6D4'; // Cyan
      case 'Organization':
        return '#10B981'; // Emerald
      default:
        return '#64748B';
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
            color: '#F8FAFC',
            'font-family': 'Inter, system-ui, sans-serif',
            'font-size': '12px',
            'font-weight': '600',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            width: (node: cytoscape.NodeSingular) => (node.data('isSubject') === 'true' ? 48 : 36),
            height: (node: cytoscape.NodeSingular) => (node.data('isSubject') === 'true' ? 48 : 36),
            'border-width': (node: cytoscape.NodeSingular) => (node.data('isSubject') === 'true' ? 3 : 2),
            'border-color': '#0F172A',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#FFFFFF',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#334155',
            'target-arrow-color': '#3B82F6',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            color: '#94A3B8',
            'font-family': 'Inter, system-ui, sans-serif',
            'font-size': '10px',
            'text-background-opacity': 0.9,
            'text-background-color': '#070C16',
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'arrow-scale': 1.1,
          },
        },
        {
          selector: 'edge.highlighted',
          style: {
            width: 3.5,
            'line-color': '#3B82F6',
            'target-arrow-color': '#3B82F6',
            color: '#60A5FA',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 4,
            'border-color': '#3B82F6',
          },
        },
        {
          selector: '.faded',
          style: {
            opacity: 0.2,
          },
        },
      ] as any,
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 50,
        spacingFactor: 1.35,
        animate: true,
        animationDuration: 400,
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
        zoom: 1.4,
      });
      match.select();
      onSelectNode(match.first().data('rawNode'));
    }
  };

  // Forward Trace algorithm
  const handleForwardTrace = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    setActiveTraceMode('forward');
    const subject = cy.nodes('[isSubject = "true"]').first();
    if (subject.length === 0) return;

    const outgoers = subject.outgoers();
    cy.elements().addClass('faded');
    subject.removeClass('faded');
    outgoers.removeClass('faded');
    outgoers.edges().addClass('highlighted');

    cy.animate({
      fit: { eles: subject.union(outgoers), padding: 60 },
      duration: 400,
    });
  };

  // Backward Trace algorithm
  const handleBackwardTrace = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    setActiveTraceMode('backward');
    const subject = cy.nodes('[isSubject = "true"]').first();
    if (subject.length === 0) return;

    const incomers = subject.incomers();
    cy.elements().addClass('faded');
    subject.removeClass('faded');
    incomers.removeClass('faded');
    incomers.edges().addClass('highlighted');

    cy.animate({
      fit: { eles: subject.union(incomers), padding: 60 },
      duration: 400,
    });
  };

  // Reset View
  const handleResetGraph = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    setActiveTraceMode('all');
    cy.elements().removeClass('faded').removeClass('highlighted').unselect();
    cy.animate({
      fit: { eles: cy.elements(), padding: 50 },
      duration: 400,
    });
    onSelectNode(null);
  };

  return (
    <div className="relative w-full h-[680px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col transition-colors duration-150 font-sans">
      {/* Network Graph Controls Bar */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-20">
        {/* Trace Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant={activeTraceMode === 'forward' ? 'primary' : 'secondary'}
            size="sm"
            icon={ArrowRight}
            onClick={handleForwardTrace}
          >
            Forward Trace
          </Button>
          <Button
            variant={activeTraceMode === 'backward' ? 'primary' : 'secondary'}
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
            Reset View
          </Button>
        </div>

        {/* Search Entity Form */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search Entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 text-slate-200 placeholder-slate-500 text-xs rounded-lg border border-slate-800 focus:border-blue-500 focus:outline-none w-48 font-sans"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Find
          </Button>
        </form>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
          <button
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.25)}
            title="Zoom In"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
            title="Zoom Out"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetGraph}
            title="Reset View"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Legend Ribbon */}
      <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-xs font-sans text-slate-400 relative z-10">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-400 font-semibold uppercase text-[11px]">Legend:</span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span>Subject</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Person</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            <span>Account</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Wallet</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
            <span>Platform</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Supplier</span>
          </span>
        </div>
      </div>

      {/* Cytoscape Canvas Container */}
      <div ref={containerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative z-0" />
    </div>
  );
};
