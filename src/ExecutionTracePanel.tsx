import type { TraceDetails, TraceSpan, TraceSummary } from './types'

interface Props {
  summary: TraceSummary
  trace?: TraceDetails
  isLoading: boolean
  error?: string
  onClose: () => void
  onRetry: () => void
}

export function ExecutionTracePanel({ summary, trace, isLoading, error, onClose, onRetry }: Props) {
  return (
    <div className="trace-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <aside className="trace-panel" role="dialog" aria-modal="true" aria-labelledby="trace-heading">
        <header className="trace-header">
          <div>
            <p className="eyebrow">Observable execution</p>
            <h2 id="trace-heading">Agent trace</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close execution trace">×</button>
        </header>

        <TraceSummaryCards summary={trace?.summary ?? summary} />

        <div className="trace-body">
          {isLoading && <div className="trace-loading" role="status">Loading execution spans…</div>}
          {error && (
            <div className="trace-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={onRetry}>Retry</button>
            </div>
          )}
          {trace && <TraceTree spans={trace.spans} />}
        </div>
      </aside>
    </div>
  )
}

function TraceSummaryCards({ summary }: { summary: TraceSummary }) {
  const items = [
    ['Duration', formatDuration(summary.durationMs)],
    ['Iterations', summary.agentIterations],
    ['LLM calls', summary.llmCalls],
    ['Tool calls', summary.toolCalls],
    ['Knowledge', summary.knowledgeSearches],
    ['Memory', summary.memoryLookups],
  ]
  return (
    <section className="trace-summary" aria-label="Execution summary">
      {items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </section>
  )
}

function TraceTree({ spans }: { spans: TraceSpan[] }) {
  const childMap = new Map<string | null, TraceSpan[]>()
  for (const span of spans) {
    const siblings = childMap.get(span.parentSpanId) ?? []
    siblings.push(span)
    childMap.set(span.parentSpanId, siblings)
  }
  const roots = childMap.get(null) ?? []
  return <div className="trace-tree">{roots.map((span) => <TraceNode key={span.spanId} span={span} childMap={childMap} depth={0} />)}</div>
}

function TraceNode({ span, childMap, depth }: { span: TraceSpan; childMap: Map<string | null, TraceSpan[]>; depth: number }) {
  const nested = childMap.get(span.spanId) ?? []
  const metadata = Object.entries(span.metadata ?? {})
  return (
    <details className={`trace-node trace-${span.type.toLowerCase()} status-${span.status.toLowerCase()}`} open={depth < 2}>
      <summary>
        <span className="trace-glyph" aria-hidden="true">{glyph(span.type)}</span>
        <span className="trace-name">{span.name}</span>
        {span.iteration && <span className="trace-iteration">#{span.iteration}</span>}
        <span className="trace-duration">{formatDuration(span.durationMs)}</span>
        <span className="trace-state">{span.status.toLowerCase()}</span>
      </summary>
      {(metadata.length > 0 || nested.length > 0) && (
        <div className="trace-node-content">
          {metadata.length > 0 && <dl className="trace-metadata">{metadata.map(([key, value]) => (
            <div key={key}><dt>{formatLabel(key)}</dt><dd>{formatValue(value)}</dd></div>
          ))}</dl>}
          {nested.map((child) => <TraceNode key={child.spanId} span={child} childMap={childMap} depth={depth + 1} />)}
        </div>
      )}
    </details>
  )
}

function glyph(type: TraceSpan['type']) {
  const values: Record<TraceSpan['type'], string> = {
    AGENT_RUN: '◎', AGENT_ITERATION: '↻', LLM_CALL: '◇', TOOL_CALL: '⌘', KNOWLEDGE_SEARCH: '⌕',
    EMBEDDING: '∿', VECTOR_SEARCH: '⋈', MEMORY_LOOKUP: '▤', FINAL_RESPONSE: '✓',
  }
  return values[type]
}

function formatDuration(value: number) { return value < 1000 ? `${value} ms` : `${(value / 1000).toFixed(2)} s` }
function formatLabel(value: string) { return value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()) }
function formatValue(value: unknown) {
  if (Array.isArray(value)) return value.join(', ') || 'None'
  if (value && typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
