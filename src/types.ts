export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH'
export type MemoryKey = 'PRODUCTION_REGION' | 'DEFAULT_SERVICE'
export type AssistantResponseStatus = 'ANSWER' | 'CONFIRMATION_REQUIRED' | 'ACTION_EXECUTED'
  | 'ACTION_EXPIRED' | 'ACTION_ALREADY_RESOLVED'
export type PendingActionStatus = 'AWAITING_CONFIRMATION' | 'CONFIRMED' | 'EXECUTING' | 'EXECUTED'
  | 'FAILED' | 'EXPIRED' | 'SUPERSEDED'

export interface PendingActionDetails {
  pendingActionId: string
  tool: string
  arguments: Record<string, unknown>
  confirmationRequired: boolean
  confirmationStatus: PendingActionStatus
  executionStatus: string
  message: string
}

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
  status: AssistantResponseStatus
  pendingAction: PendingActionDetails | null
}

export type TraceStatus = 'SUCCESS' | 'ERROR'
export type TraceSpanType = 'AGENT_RUN' | 'SUPERVISOR' | 'AGENT' | 'AGENT_ITERATION' | 'LLM_CALL' | 'TOOL_CALL'
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

export interface MemoryResetResponse {
  deletedCount: number
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
