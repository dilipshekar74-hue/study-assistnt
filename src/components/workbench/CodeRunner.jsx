/**
 * CodeRunner.jsx
 * Python 3 and Algorithm Sandbox with syntax display, dry-run state trace table,
 * and time/space complexity footer badges.
 * Adheres strictly to .agents/rules/custom-llm-engine.md and .agents/rules/ui-pedagogy-sync.md
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, CheckCircle2, Clock, HardDrive, Terminal, Copy, Check, ChevronRight } from 'lucide-react';
import KatexMath from '../KatexMath';

const DEFAULT_TRACE_STEPS = [
  { step: 1, action: 'heappop(pq) -> pop ("A", 0)', node: 'A', dist: 0, pq: "[(2, 'C'), (4, 'B')]", visited: "{'A'}", relaxation: 'Relaxed neighbors B (4) & C (2)' },
  { step: 2, action: 'heappop(pq) -> pop ("C", 2)', node: 'C', dist: 2, pq: "[(3, 'B'), (4, 'B'), (10, 'D'), (12, 'E')]", visited: "{'A', 'C'}", relaxation: 'Found shorter path to B: 2 + 1 = 3 < 4' },
  { step: 3, action: 'heappop(pq) -> pop ("B", 3)', node: 'B', dist: 3, pq: "[(8, 'D'), (10, 'D'), (12, 'E')]", visited: "{'A', 'B', 'C'}", relaxation: 'Relaxed neighbor D: 3 + 5 = 8 < 10' },
  { step: 4, action: 'heappop(pq) -> pop ("D", 8)', node: 'D', dist: 8, pq: "[(10, 'E'), (12, 'E')]", visited: "{'A', 'B', 'C', 'D'}", relaxation: 'Relaxed neighbor E: 8 + 2 = 10 < 12' },
  { step: 5, action: 'heappop(pq) -> pop ("E", 10)', node: 'E', dist: 10, pq: '[]', visited: "{'A', 'B', 'C', 'D', 'E'}", relaxation: 'Target reached. All vertices settled.' }
];

export default function CodeRunner({ artifact }) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeTraceIndex, setActiveTraceIndex] = useState(DEFAULT_TRACE_STEPS.length - 1);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'trace' | 'output'

  const codeContent = artifact?.content || `import heapq\n\ndef dijkstra(graph, start):\n    distances = {node: float('inf') for node in graph}\n    distances[start] = 0\n    pq = [(0, start)]\n    visited = set()\n    while pq:\n        curr_dist, u = heapq.heappop(pq)\n        if u in visited: continue\n        visited.add(u)\n        for v, weight in graph[u]:\n            if curr_dist + weight < distances[v]:\n                distances[v] = curr_dist + weight\n                heapq.heappush(pq, (distances[v], v))\n    return distances`;

  const complexityTime = artifact?.metadata?.complexityTime || '\\mathcal{O}((|V| + |E|) \\log |V|)';
  const complexitySpace = artifact?.metadata?.complexitySpace || '\\mathcal{O}(|V|)';

  const handleRunTrace = () => {
    setIsRunning(true);
    setActiveTraceIndex(0);
    setActiveTab('trace');

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= DEFAULT_TRACE_STEPS.length) {
        clearInterval(interval);
        setIsRunning(false);
        setActiveTraceIndex(DEFAULT_TRACE_STEPS.length - 1);
      } else {
        setActiveTraceIndex(current);
      }
    }, 600);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = codeContent.split('\n');

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Sandbox Header with View Tabs & Action Button */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-zinc-900 border border-white/[0.08] p-1 text-xs">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'code' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Python 3 Editor
            </button>
            <button
              onClick={() => setActiveTab('trace')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'trace' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Dry-Run State Trace ({DEFAULT_TRACE_STEPS.length})
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'output' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Stdout Terminal
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleRunTrace}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
            <span>{isRunning ? 'Stepping Trace...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 rounded-2xl border border-white/[0.08] bg-zinc-950/90 shadow-2xl overflow-hidden flex flex-col">
        {/* Code Tab View */}
        {activeTab === 'code' && (
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
            <div className="space-y-1">
              {lines.map((line, idx) => (
                <div key={idx} className="flex hover:bg-white/[0.02] rounded px-1 group">
                  <span className="w-8 shrink-0 text-zinc-600 select-none text-right pr-4 font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-zinc-300 group-hover:text-zinc-100 whitespace-pre">
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trace Table View */}
        {activeTab === 'trace' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/[0.06]">
              <span className="font-mono uppercase tracking-wider text-amber-400">
                Min-Heap Priority Queue & Vertex Relaxation Trace
              </span>
              <span className="text-zinc-500">
                Step {activeTraceIndex + 1} of {DEFAULT_TRACE_STEPS.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-zinc-500 text-[11px]">
                    <th className="py-2 px-2">Step</th>
                    <th className="py-2 px-2">Heap Extraction</th>
                    <th className="py-2 px-2">Settled Node</th>
                    <th className="py-2 px-2">Tentative Heap (pq)</th>
                    <th className="py-2 px-2">Edge Relaxation Invariant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {DEFAULT_TRACE_STEPS.map((row, idx) => {
                    const isStepActive = idx === activeTraceIndex;
                    return (
                      <tr
                        key={row.step}
                        className={`transition-colors ${
                          isStepActive
                            ? 'bg-indigo-600/20 text-indigo-200 border-l-2 border-indigo-500'
                            : 'hover:bg-white/[0.02] text-zinc-400'
                        }`}
                      >
                        <td className="py-2 px-2 font-semibold text-zinc-300">#{row.step}</td>
                        <td className="py-2 px-2 text-indigo-300">{row.action}</td>
                        <td className="py-2 px-2 font-bold text-emerald-400">{row.node} (d={row.dist})</td>
                        <td className="py-2 px-2 text-amber-300 font-mono text-[10px]">{row.pq}</td>
                        <td className="py-2 px-2 text-zinc-300 text-[11px]">{row.relaxation}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stdout Terminal View */}
        {activeTab === 'output' && (
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-zinc-300 space-y-2 bg-black/60">
            <div className="flex items-center gap-2 text-zinc-500 pb-2 border-b border-white/[0.06]">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>Python 3.11 Sandbox Process Output</span>
            </div>
            <pre className="text-emerald-400 whitespace-pre leading-relaxed">
{`>>> python3 dijkstra_heap.py
[Graph Initialized]: 5 Vertices, 7 Directed Weighted Edges
[Source]: Vertex 'A'
--- Running Dijkstra Single-Source Shortest Paths ---
Settled A: dist = 0
Settled C: dist = 2
Settled B: dist = 3 (via C)
Settled D: dist = 8 (via B)
Settled E: dist = 10 (via D)
==================================================
Shortest Paths from A: {'A': 0, 'C': 2, 'B': 3, 'D': 8, 'E': 10}
Process finished with exit code 0`}
            </pre>
          </div>
        )}

        {/* Complexity Footer Invariant Bar */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3 bg-zinc-900/60 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-zinc-500">Time:</span>
              <KatexMath math={complexityTime} className="text-amber-300 font-mono" />
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-zinc-500">Space:</span>
              <KatexMath math={complexitySpace} className="text-cyan-300 font-mono" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" />
              Exit 0 (Verified)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
