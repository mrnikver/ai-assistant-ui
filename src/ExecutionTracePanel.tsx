import { useEffect, useMemo, useRef } from 'react'
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
  const dialogRef = useRef<HTMLElement>(null)
  const promptPreview = useMemo(() => findPromptPreview(trace?.spans ?? []), [trace])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), summary, [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = previousOverflow }
  }, [onClose])

  return (
    <div className="trace-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section ref={dialogRef} className="trace-panel" role="dialog" aria-modal="true"
        aria-labelledby="trace-heading" aria-describedby="trace-description" tabIndex={-1}>
        <header className="trace-header">
          <div className="trace-heading-copy">
            <p className="eyebrow">Observable execution</p>
            <div className="trace-title-row"><h2 id="trace-heading">Execution trace</h2><span className="trace-id">{summary.traceId}</span></div>
            <p id="trace-description">Follow the investigation from context assembly through delegation, tools, and final response.</p>
            {promptPreview && <p className="trace-prompt"><span>User request</span>{promptPreview}</p>}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close execution trace">×</button>
          <TraceSummaryCards summary={trace?.summary ?? summary} />
        </header>

        <div className="trace-body">
          {isLoading && <div className="trace-loading" role="status">Loading execution spans…</div>}
          {error && (
            <div className="trace-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={onRetry}>Retry</button>
            </div>
          )}
          {trace && <><div className="trace-legend" aria-label="Agent trace legend">
            <span>◆ Supervisor</span><span>● Specialist agent</span><span>⌘ Tool</span><span>◇ LLM</span>
          </div><TraceTree spans={trace.spans} /></>}
        </div>
      </section>
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
  const isLlm = span.type === 'LLM_CALL'
  const metadata = Object.entries(span.metadata ?? {}).filter(([key]) => !isLlm || (key !== 'input' && key !== 'output'))
  const agentType = typeof span.metadata?.agentType === 'string' ? span.metadata.agentType.toLowerCase() : ''
  const expandable = metadata.length > 0 || nested.length > 0 || isLlm
  return (
    <details className={`trace-node trace-${span.type.toLowerCase()} agent-${agentType} status-${span.status.toLowerCase()}`} open={depth < 3}>
      <summary>
        <span className={`trace-chevron ${expandable ? '' : 'empty'}`} aria-hidden="true">›</span>
        <span className="trace-glyph" aria-hidden="true">{glyph(span.type)}</span>
        <span className="trace-name"><strong>{span.name}</strong><small>{typeLabel(span.type)}</small></span>
        {span.iteration && <span className="trace-chip trace-iteration">Iteration {span.iteration}</span>}
        <span className="trace-chip trace-duration">{formatDuration(span.durationMs)}</span>
        <span className="trace-chip trace-state">{span.status.toLowerCase()}</span>
      </summary>
      {(metadata.length > 0 || nested.length > 0 || isLlm) && (
        <div className="trace-node-content">
          {isLlm && <LlmExchange input={span.metadata?.input} output={span.metadata?.output} />}
          {metadata.length > 0 && <dl className="trace-metadata">{metadata.map(([key, value]) => (
            <div key={key}><dt>{formatLabel(key)}</dt><dd>{formatValue(value)}</dd></div>
          ))}</dl>}
          {nested.map((child) => <TraceNode key={child.spanId} span={child} childMap={childMap} depth={depth + 1} />)}
        </div>
      )}
    </details>
  )
}

function findPromptPreview(spans: TraceSpan[]) {
  for (const span of spans) {
    if (span.type !== 'LLM_CALL' || !isRecord(span.metadata?.input)) continue
    const request = span.metadata.input.userRequest
    if (typeof request === 'string' && request.trim()) return request
  }
  return undefined
}

function typeLabel(type: TraceSpan['type']) {
  const labels: Record<TraceSpan['type'], string> = {
    AGENT_RUN: 'Request lifecycle', SUPERVISOR: 'Supervisor', AGENT: 'Specialist agent',
    AGENT_ITERATION: 'Decision cycle', LLM_CALL: 'Model call', TOOL_CALL: 'Application tool',
    KNOWLEDGE_SEARCH: 'Retrieval', EMBEDDING: 'Embedding', VECTOR_SEARCH: 'Vector search',
    MEMORY_LOOKUP: 'Persistent memory', FINAL_RESPONSE: 'Response publication',
  }
  return labels[type]
}

function LlmExchange({ input, output }: { input: unknown; output: unknown }) {
  return <div className="llm-exchange">
    <SummarySection title="Input" value={input} />
    <SummarySection title="Output" value={output} />
  </div>
}

function SummarySection({ title, value }: { title: string; value: unknown }) {
  if (!isRecord(value)) return null
  return <details className="llm-summary-section" open>
    <summary>{title}</summary>
    <dl>{Object.entries(value).filter(([, item]) => item !== null && item !== undefined).map(([key, item]) => (
      <div key={key}><dt>{formatLabel(key)}</dt><dd><ReadableValue value={item} /></dd></div>
    ))}</dl>
  </details>
}

function ReadableValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="empty-value">None</span>
    return <ul>{value.map((item, index) => <li key={index}><ReadableValue value={item} /></li>)}</ul>
  }
  if (isRecord(value)) {
    return <dl className="nested-summary">{Object.entries(value).map(([key, item]) => (
      <div key={key}><dt>{formatLabel(key)}</dt><dd><ReadableValue value={item} /></dd></div>
    ))}</dl>
  }
  return <>{String(value)}</>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function glyph(type: TraceSpan['type']) {
  const values: Record<TraceSpan['type'], string> = {
    AGENT_RUN: '◎', SUPERVISOR: '◆', AGENT: '●', AGENT_ITERATION: '↻', LLM_CALL: '◇', TOOL_CALL: '⌘', KNOWLEDGE_SEARCH: '⌕',
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
