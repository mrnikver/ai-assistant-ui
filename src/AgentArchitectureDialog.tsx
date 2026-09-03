import { useEffect, useMemo, useState } from 'react'
import { architectureEdges, architectureFlowSteps, architectureNodes } from './architectureModel'
import type { ArchitectureEdgeModel, ArchitectureNodeModel } from './architectureModel'
import './AgentArchitecture.css'

interface Props { onClose: () => void }

export function AgentArchitectureDialog({ onClose }: Props) {
  const [selectedId, setSelectedId] = useState('agent')
  const [flowStep, setFlowStep] = useState<number>()
  const selectedNode = architectureNodes.find((node) => node.id === selectedId) ?? architectureNodes[0]
  const activeStep = flowStep === undefined ? undefined : architectureFlowSteps[flowStep]

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="architecture-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="architecture-dialog" role="dialog" aria-modal="true" aria-labelledby="architecture-heading">
        <header className="architecture-header">
          <div>
            <p className="eyebrow">System design</p>
            <h2 id="architecture-heading">How the agent works</h2>
            <p>Architecture explains the design. Execution traces show one request.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close agent architecture">×</button>
        </header>

        <div className="architecture-toolbar">
          <button className={`secondary-button ${flowStep !== undefined ? 'active' : ''}`} type="button"
            aria-pressed={flowStep !== undefined} onClick={() => setFlowStep(flowStep === undefined ? 0 : undefined)}>
            {flowStep === undefined ? 'Show request flow' : 'Exit request flow'}
          </button>
          <span><i className="architecture-key optional" /> Optional tool path</span>
          <span><i className="architecture-key observes" /> Observability only</span>
        </div>

        {activeStep && (
          <div className="architecture-walkthrough" aria-live="polite">
            <button type="button" className="icon-button" aria-label="Previous request-flow step"
              disabled={flowStep === 0} onClick={() => setFlowStep((current) => Math.max(0, (current ?? 0) - 1))}>←</button>
            <div><span>Step {(flowStep ?? 0) + 1} of {architectureFlowSteps.length}</span><strong>{activeStep.title}</strong><p>{activeStep.description}</p></div>
            <button type="button" className="icon-button" aria-label="Next request-flow step"
              disabled={flowStep === architectureFlowSteps.length - 1}
              onClick={() => setFlowStep((current) => Math.min(architectureFlowSteps.length - 1, (current ?? 0) + 1))}>→</button>
          </div>
        )}

        <div className="architecture-content">
          <ArchitectureGraph selectedId={selectedId} onSelect={setSelectedId} activeStep={activeStep} />
          <ArchitectureDetails node={selectedNode} />
        </div>
      </section>
    </div>
  )
}

function ArchitectureGraph({ selectedId, onSelect, activeStep }: {
  selectedId: string
  onSelect: (id: string) => void
  activeStep?: (typeof architectureFlowSteps)[number]
}) {
  const nodesById = useMemo(() => new Map(architectureNodes.map((node) => [node.id, node])), [])
  return (
    <div className="architecture-viewport" aria-label="Interactive agent architecture diagram">
      <div className="architecture-canvas">
        <svg viewBox="0 0 970 635" role="img" aria-label="Request, optional tool, feedback, memory, and observability paths">
          <defs><marker id="architecture-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" /></marker></defs>
          {architectureEdges.map((edge) => <ArchitectureEdge key={edge.id} edge={edge} nodesById={nodesById}
            active={activeStep?.edgeIds.includes(edge.id) ?? false} dimmed={Boolean(activeStep && !activeStep.edgeIds.includes(edge.id))} />)}
        </svg>
        {architectureNodes.map((node) => {
          const highlighted = activeStep?.nodeIds.includes(node.id) ?? false
          return <button key={node.id} type="button" style={{ left: `${node.x / 9.7}%`, top: `${node.y / 6.35}%` }}
            className={`architecture-node category-${node.category} ${selectedId === node.id ? 'selected' : ''} ${highlighted ? 'flow-active' : ''} ${activeStep && !highlighted ? 'flow-dimmed' : ''}`}
            aria-pressed={selectedId === node.id} onClick={() => onSelect(node.id)}>
            <strong>{node.title}</strong><span>{node.subtitle}</span>
          </button>
        })}
      </div>
    </div>
  )
}

function ArchitectureEdge({ edge, nodesById, active, dimmed }: {
  edge: ArchitectureEdgeModel
  nodesById: Map<string, ArchitectureNodeModel>
  active: boolean
  dimmed: boolean
}) {
  const source = nodesById.get(edge.source)!
  const target = nodesById.get(edge.target)!
  const path = edge.bend
    ? `M ${source.x} ${source.y} Q ${(source.x + target.x) / 2} ${(source.y + target.y) / 2 + edge.bend} ${target.x} ${target.y}`
    : `M ${source.x} ${source.y} L ${target.x} ${target.y}`
  const labelX = (source.x + target.x) / 2
  const labelY = (source.y + target.y) / 2 + (edge.bend ?? 0) / 2
  return <g className={`architecture-edge edge-${edge.kind ?? 'normal'} ${active ? 'flow-active' : ''} ${dimmed ? 'flow-dimmed' : ''}`}>
    <path d={path} markerEnd="url(#architecture-arrow)" />
    {edge.label && <text x={labelX} y={labelY}>{edge.label}</text>}
  </g>
}

function ArchitectureDetails({ node }: { node: ArchitectureNodeModel }) {
  return (
    <aside className={`architecture-details category-${node.category}`} aria-live="polite">
      <p className="eyebrow">{node.subtitle}</p>
      <h3>{node.title}</h3>
      <p className="architecture-purpose">{node.responsibility}</p>
      <dl>
        <div><dt>Receives</dt><dd>{node.input}</dd></div>
        <div><dt>Produces</dt><dd>{node.output}</dd></div>
        <div><dt>Connects to</dt><dd>{node.communicatesWith}</dd></div>
        <div><dt>Key constraint</dt><dd>{node.constraint}</dd></div>
      </dl>
    </aside>
  )
}
