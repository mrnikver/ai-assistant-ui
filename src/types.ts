export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH'
export type MemoryKey = 'PRODUCTION_REGION' | 'DEFAULT_SERVICE'

export interface ChatRequest {
  conversationId?: string
  message: string
}

export interface ChatResponse {
  messageId: string
  conversationId: string
  answer: string
  confidence: Confidence
  trace: TraceSummary
}

export type TraceStatus = 'SUCCESS' | 'ERROR'
export type TraceSpanType = 'AGENT_RUN' | 'AGENT_ITERATION' | 'LLM_CALL' | 'TOOL_CALL'
  | 'KNOWLEDGE_SEARCH' | 'EMBEDDING' | 'VECTOR_SEARCH' | 'MEMORY_LOOKUP' | 'FINAL_RESPONSE'

export interface TraceSummary {
  traceId: string
  durationMs: number
  agentIterations: number
  llmCalls: number
  toolCalls: number
  knowledgeSearches: number
  memoryLookups: number
  status: TraceStatus
}

export interface TraceSpan {
  spanId: string
  parentSpanId: string | null
  type: TraceSpanType
  name: string
  status: TraceStatus
  startedAt: string
  endedAt: string
  durationMs: number
  iteration?: number
  metadata: Record<string, unknown>
}

export interface TraceDetails {
  traceId: string
  status: TraceStatus
  startedAt: string
  endedAt: string
  durationMs: number
  summary: TraceSummary
  spans: TraceSpan[]
}

export interface MemoryRequest {
  key: MemoryKey
  value: string
}

export interface Memory {
  id: string
  key: string
  value: string
  createdAt?: string
  updatedAt?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  confidence?: Confidence
  trace?: TraceSummary
}
