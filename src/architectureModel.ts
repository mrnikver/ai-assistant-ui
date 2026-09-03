export type ArchitectureCategory = 'client' | 'orchestration' | 'model' | 'tool' | 'data' | 'observability'

export interface ArchitectureNodeModel {
  id: string
  title: string
  subtitle: string
  category: ArchitectureCategory
  x: number
  y: number
  responsibility: string
  input: string
  output: string
  communicatesWith: string
  constraint: string
}

export interface ArchitectureEdgeModel {
  id: string
  source: string
  target: string
  label?: string
  kind?: 'normal' | 'optional' | 'feedback' | 'observes'
  bend?: number
}

export interface ArchitectureFlowStep {
  title: string
  description: string
  nodeIds: string[]
  edgeIds: string[]
}

export const architectureNodes: ArchitectureNodeModel[] = [
  {
    id: 'user', title: 'User', subtitle: 'Request', category: 'client', x: 70, y: 80,
    responsibility: 'Starts a deployment investigation from the browser interface.',
    input: 'A question and optional existing conversation ID.', output: 'A chat request.',
    communicatesWith: 'ai-assistant-ui.', constraint: 'The browser never calls model or data services directly.',
  },
  {
    id: 'ui', title: 'ai-assistant-ui', subtitle: 'React client', category: 'client', x: 225, y: 80,
    responsibility: 'Presents chat, memory controls, architecture help, and per-message execution traces.',
    input: 'User actions and backend response DTOs.', output: 'HTTP requests and rendered assistant messages.',
    communicatesWith: 'Chat, memory, and trace endpoints.', constraint: 'Architecture is explanatory; execution traces describe one real request.',
  },
  {
    id: 'api', title: 'Backend API', subtitle: 'Spring controllers', category: 'orchestration', x: 390, y: 80,
    responsibility: 'Validates HTTP input, resolves a conversation ID, and delegates the request to the assistant flow.',
    input: 'POST /chat with message and optional conversationId.', output: 'Answer, confidence, message ID, and trace summary.',
    communicatesWith: 'AssistantService and the React UI.', constraint: 'Controllers expose DTOs rather than model or persistence internals.',
  },
  {
    id: 'assistant', title: 'AssistantService', subtitle: 'Context coordinator', category: 'orchestration', x: 555, y: 80,
    responsibility: 'Coordinates memory extraction, persistent memory, recent conversation history, agent execution, and response persistence.',
    input: 'Conversation ID and current user message.', output: 'Prepared context and final AssistantExecution.',
    communicatesWith: 'MemoryExtractorService, MemoryService, ConversationService, AgentService, and tracing.',
    constraint: 'It does not run knowledge retrieval automatically.',
  },
  {
    id: 'agent', title: 'Agent Loop', subtitle: 'AgentService · max 5', category: 'orchestration', x: 720, y: 80,
    responsibility: 'Repeatedly asks the LLM to answer or choose a tool, then feeds controlled tool observations back to the model.',
    input: 'System prompt, memory, recent conversation, current message, and prior observations.', output: 'A structured answer or another tool request.',
    communicatesWith: 'LLMClient and ToolRegistry.', constraint: 'The loop stops after at most five iterations to prevent infinite execution.',
  },
  {
    id: 'llm', title: 'Ollama / qwen3', subtitle: 'Model decision', category: 'model', x: 895, y: 80,
    responsibility: 'Chooses whether available context is enough for an answer or whether a registered tool is needed.',
    input: 'Agent context plus registered tool definitions.', output: 'Final content or inert tool-call data.',
    communicatesWith: 'LLMClient through the agent loop.', constraint: 'The model cannot execute Java code or access Qdrant directly.',
  },
  {
    id: 'memory', title: 'Persistent Memory', subtitle: 'PostgreSQL', category: 'data', x: 390, y: 245,
    responsibility: 'Stores supported durable facts and makes current application-wide memories available for context assembly.',
    input: 'Accepted memory facts and memory reads.', output: 'Stored production-region/default-service facts.',
    communicatesWith: 'MemoryExtractorService, MemoryService, and AssistantService.', constraint: 'Memory is application-wide, while conversation history is in-memory and keyed by conversation ID.',
  },
  {
    id: 'context', title: 'Context & History', subtitle: 'ConversationService', category: 'orchestration', x: 555, y: 245,
    responsibility: 'Combines the system prompt, persistent memories, recent messages, current request, and later tool observations.',
    input: 'Memory and recent conversation messages.', output: 'Ordered LLMMessage context for each decision.',
    communicatesWith: 'AssistantService and AgentService.', constraint: 'Only user messages and final answers persist in the in-memory conversation history.',
  },
  {
    id: 'registry', title: 'ToolRegistry', subtitle: 'Application allow-list', category: 'tool', x: 895, y: 245,
    responsibility: 'Validates the model-requested function name and delegates only to explicitly registered Java tools.',
    input: 'Inert ToolCall data from qwen3.', output: 'A successful or controlled-failure ToolResult observation.',
    communicatesWith: 'AgentService and registered Tool implementations.',
    constraint: 'Unknown tools are rejected; arguments and execution failures stay controlled by Java.',
  },
  {
    id: 'knowledge', title: 'search_knowledge_base', subtitle: 'Optional RAG tool', category: 'tool', x: 720, y: 405,
    responsibility: 'Exposes existing semantic retrieval as an agent-selected tool and formats retrieved chunks as an observation.',
    input: 'Focused query and optional topK.', output: 'Relevant chunks with scores for the next LLM decision.',
    communicatesWith: 'ToolRegistry and RunbookRetriever.',
    constraint: 'Runs only when selected by the LLM; topK defaults to 3 and is capped at 10.',
  },
  {
    id: 'embedding', title: 'Embedding Service', subtitle: 'embeddinggemma', category: 'data', x: 555, y: 405,
    responsibility: 'Transforms the focused search query into a vector for similarity search.',
    input: 'Knowledge-search query.', output: 'Embedding vector.', communicatesWith: 'RunbookRetriever and the configured Ollama embedding endpoint.',
    constraint: 'It supports retrieval; it does not generate the assistant answer.',
  },
  {
    id: 'qdrant', title: 'Qdrant', subtitle: 'Vector search', category: 'data', x: 390, y: 405,
    responsibility: 'Searches the indexed deployment runbook collection for nearest vector matches.',
    input: 'Query vector and effective topK.', output: 'Relevant runbook chunks and similarity scores.',
    communicatesWith: 'VectorStoreClient through RunbookRetriever.', constraint: 'The LLM never accesses Qdrant directly.',
  },
  {
    id: 'observation', title: 'Tool Observation', subtitle: 'LLMMessage role=tool', category: 'tool', x: 720, y: 555,
    responsibility: 'Carries a tool result back into the mutable agent context so the model can decide again.',
    input: 'Retrieved chunks or a controlled tool error.', output: 'Context for the next agent iteration.',
    communicatesWith: 'AgentService and the next Ollama call.', constraint: 'An observation is context, not the final user-facing response.',
  },
  {
    id: 'final', title: 'Final Response', subtitle: 'Answer + confidence', category: 'client', x: 895, y: 555,
    responsibility: 'Returns the model answer through the backend to the exact assistant message in the UI.',
    input: 'A no-tool LLM response parsed into AssistantResponse.', output: 'ChatResponse rendered by React.',
    communicatesWith: 'AgentService, AssistantService, Backend API, and UI.', constraint: 'A direct answer may bypass all knowledge retrieval.',
  },
  {
    id: 'trace', title: 'Trace Collector', subtitle: 'Observability side-channel', category: 'observability', x: 70, y: 330,
    responsibility: 'Observes agent, LLM, tool, memory, embedding, vector-search, and final-response operations as causal spans.',
    input: 'Sanitized lifecycle events.', output: 'A completed AgentTrace and derived summary.',
    communicatesWith: 'Instrumented backend components and TraceStore.', constraint: 'Tracing observes decisions; it never makes or changes them and never stores hidden reasoning.',
  },
  {
    id: 'trace-store', title: 'Trace Store', subtitle: 'Bounded in-memory', category: 'observability', x: 70, y: 450,
    responsibility: 'Retains completed traces so detailed spans can be requested after the chat response.',
    input: 'Completed AgentTrace records.', output: 'Trace details by traceId.', communicatesWith: 'TraceService and GET /api/traces/{traceId}.',
    constraint: 'Keeps up to 500 entries; traces are lost on restart and may be evicted.',
  },
  {
    id: 'trace-ui', title: 'Execution Trace UI', subtitle: 'Per-request evidence', category: 'observability', x: 225, y: 555,
    responsibility: 'Lazily renders what happened during one particular assistant request.',
    input: 'Trace summary and trace details loaded by traceId.', output: 'Expandable causal span tree.',
    communicatesWith: 'Trace endpoint and an assistant message.', constraint: 'It is distinct from this static architecture explanation.',
  },
]

export const architectureEdges: ArchitectureEdgeModel[] = [
  { id: 'user-ui', source: 'user', target: 'ui' },
  { id: 'ui-api', source: 'ui', target: 'api', label: 'HTTP' },
  { id: 'api-assistant', source: 'api', target: 'assistant' },
  { id: 'assistant-agent', source: 'assistant', target: 'agent' },
  { id: 'agent-llm', source: 'agent', target: 'llm', label: 'context' },
  { id: 'assistant-memory', source: 'assistant', target: 'memory' },
  { id: 'memory-context', source: 'memory', target: 'context' },
  { id: 'assistant-context', source: 'assistant', target: 'context' },
  { id: 'context-agent', source: 'context', target: 'agent' },
  { id: 'llm-final', source: 'llm', target: 'final', label: 'direct answer', kind: 'optional', bend: 80 },
  { id: 'llm-registry', source: 'llm', target: 'registry', label: 'tool call', kind: 'optional' },
  { id: 'registry-knowledge', source: 'registry', target: 'knowledge' },
  { id: 'knowledge-embedding', source: 'knowledge', target: 'embedding' },
  { id: 'embedding-qdrant', source: 'embedding', target: 'qdrant' },
  { id: 'qdrant-observation', source: 'qdrant', target: 'observation', label: 'chunks', bend: 70 },
  { id: 'observation-agent', source: 'observation', target: 'agent', label: 'next iteration', kind: 'feedback', bend: -100 },
  { id: 'agent-trace', source: 'agent', target: 'trace', kind: 'observes', bend: 90 },
  { id: 'registry-trace', source: 'registry', target: 'trace', kind: 'observes', bend: 130 },
  { id: 'knowledge-trace', source: 'knowledge', target: 'trace', kind: 'observes', bend: 80 },
  { id: 'trace-store-edge', source: 'trace', target: 'trace-store', kind: 'observes' },
  { id: 'store-trace-ui', source: 'trace-store', target: 'trace-ui', kind: 'observes', bend: -30 },
  { id: 'final-ui', source: 'final', target: 'ui', label: 'ChatResponse', kind: 'feedback', bend: 130 },
]

export const architectureFlowSteps: ArchitectureFlowStep[] = [
  { title: 'User sends a request', description: 'React sends POST /chat with the message and optional conversation ID.', nodeIds: ['user', 'ui', 'api'], edgeIds: ['user-ui', 'ui-api'] },
  { title: 'Backend prepares the run', description: 'AssistantService extracts durable memory and assembles system, memory, history, and user context.', nodeIds: ['api', 'assistant', 'memory', 'context'], edgeIds: ['api-assistant', 'assistant-memory', 'memory-context', 'assistant-context'] },
  { title: 'Agent starts a bounded iteration', description: 'AgentService sends the assembled context and registered tool definitions to Ollama.', nodeIds: ['context', 'agent', 'llm'], edgeIds: ['context-agent', 'agent-llm'] },
  { title: 'LLM chooses the next action', description: 'qwen3 either returns a final answer directly or emits inert tool-call data.', nodeIds: ['llm', 'final', 'registry'], edgeIds: ['llm-final', 'llm-registry'] },
  { title: 'Registry validates the tool', description: 'Only an explicitly registered tool can execute; unknown tools and invalid arguments become controlled observations.', nodeIds: ['llm', 'registry'], edgeIds: ['llm-registry'] },
  { title: 'Optional knowledge retrieval', description: 'Only when search_knowledge_base is selected, the query is embedded and searched in Qdrant.', nodeIds: ['registry', 'knowledge', 'embedding', 'qdrant'], edgeIds: ['registry-knowledge', 'knowledge-embedding', 'embedding-qdrant'] },
  { title: 'Result becomes an observation', description: 'Retrieved chunks return as a tool-role message, not as the final answer.', nodeIds: ['qdrant', 'observation'], edgeIds: ['qdrant-observation'] },
  { title: 'Agent decides again', description: 'The observation is appended to context and another LLM iteration begins, still within the five-iteration limit.', nodeIds: ['observation', 'agent', 'llm'], edgeIds: ['observation-agent', 'agent-llm'] },
  { title: 'Final answer and trace return', description: 'The answer reaches the UI while trace details remain available separately for that one request.', nodeIds: ['final', 'ui', 'trace', 'trace-store', 'trace-ui'], edgeIds: ['final-ui', 'trace-store-edge', 'store-trace-ui'] },
]
