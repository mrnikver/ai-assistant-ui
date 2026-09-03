export type ArchitectureCategory = 'client' | 'orchestration' | 'supervisor' | 'agent' | 'model' | 'tool' | 'data' | 'observability'

export interface ArchitectureNodeModel {
  id: string; title: string; subtitle: string; category: ArchitectureCategory; x: number; y: number
  responsibility: string; input: string; output: string; communicatesWith: string; constraint: string
}
export interface ArchitectureEdgeModel {
  id: string; source: string; target: string; label?: string
  kind?: 'normal' | 'optional' | 'feedback' | 'observes'; bend?: number
}
export interface ArchitectureFlowStep { title: string; description: string; nodeIds: string[]; edgeIds: string[] }

export const architectureNodes: ArchitectureNodeModel[] = [
  { id: 'user', title: 'User', subtitle: 'Investigation request', category: 'client', x: 70, y: 65,
    responsibility: 'Asks a documentation, runtime, or combined operational question.', input: 'Question and optional conversation ID.', output: 'Chat request.', communicatesWith: 'React UI.', constraint: 'Never accesses models or infrastructure directly.' },
  { id: 'api', title: 'Assistant API', subtitle: 'Spring + AssistantService', category: 'orchestration', x: 260, y: 65,
    responsibility: 'Validates the request, extracts memory, and assembles persistent memory plus conversation history.', input: 'POST /chat.', output: 'Supervisor context and final response.', communicatesWith: 'Supervisor, PostgreSQL, history, and UI.', constraint: 'Does not execute domain tools.' },
  { id: 'supervisor', title: 'Supervisor Agent', subtitle: 'Delegation + synthesis', category: 'supervisor', x: 485, y: 65,
    responsibility: 'Owns the user answer, selects one or both specialists, and synthesizes their findings.', input: 'System context, memory, history, and current message.', output: 'Delegations or structured final answer.', communicatesWith: 'Knowledge Agent, Runtime Agent, and Ollama.', constraint: 'Allowed tools: ask_knowledge_agent and ask_runtime_agent only.' },
  { id: 'ollama', title: 'Ollama', subtitle: 'Supervisor + agent LLM calls', category: 'model', x: 710, y: 65,
    responsibility: 'Produces inert model decisions for every bounded agent loop.', input: 'Agent-specific context and tool definitions.', output: 'Tool calls or structured content.', communicatesWith: 'AgentRuntime.', constraint: 'Cannot execute Java tools itself.' },
  { id: 'final', title: 'Final Answer', subtitle: 'Answer + confidence', category: 'client', x: 900, y: 65,
    responsibility: 'Returns the Supervisor synthesis and trace summary to the UI.', input: 'Structured Supervisor response.', output: 'ChatResponse.', communicatesWith: 'Assistant API and user.', constraint: 'Only the Supervisor produces it.' },
  { id: 'knowledge-agent', title: 'Knowledge Agent', subtitle: 'Documentation specialist', category: 'agent', x: 350, y: 230,
    responsibility: 'Investigates documentation, project source knowledge, and runbooks.', input: 'Focused Supervisor delegation.', output: 'Evidence-backed specialist finding.', communicatesWith: 'AgentRuntime, Ollama, and knowledge search.', constraint: 'Allowed tool: search_knowledge_base only. No runtime access.' },
  { id: 'runtime-agent', title: 'Runtime Agent', subtitle: 'Operational specialist', category: 'agent', x: 620, y: 230,
    responsibility: 'Investigates mocked current deployment status and logs.', input: 'Focused Supervisor delegation.', output: 'Runtime specialist finding.', communicatesWith: 'AgentRuntime, Ollama, and mock runtime tools.', constraint: 'Allowed tools: getDeploymentStatus and getDeploymentLogs only. No RAG access.' },
  { id: 'knowledge-tool', title: 'search_knowledge_base', subtitle: 'RAG tool', category: 'tool', x: 350, y: 365,
    responsibility: 'Searches indexed runbooks and project sources for relevant chunks.', input: 'Query and optional topK.', output: 'Ranked knowledge observations.', communicatesWith: 'Embedding model and Qdrant.', constraint: 'Only the Knowledge Agent can invoke it.' },
  { id: 'runtime-tools', title: 'Mock Runtime Tools', subtitle: 'Status + deployment logs', category: 'tool', x: 620, y: 365,
    responsibility: 'Restores deterministic operational data for payments-service and orders-service.', input: 'serviceName.', output: 'Mock status or recent log text.', communicatesWith: 'Mock deployment service.', constraint: 'Only the Runtime Agent can invoke them.' },
  { id: 'embedding', title: 'Embedding Model', subtitle: 'embeddinggemma', category: 'data', x: 265, y: 500,
    responsibility: 'Embeds focused knowledge queries.', input: 'Search query.', output: 'Query vector.', communicatesWith: 'Knowledge retriever and Ollama embedding API.', constraint: 'Does not generate answers.' },
  { id: 'qdrant', title: 'Qdrant', subtitle: 'Indexed project knowledge', category: 'data', x: 435, y: 500,
    responsibility: 'Returns nearest runbook and source chunks.', input: 'Query vector and topK.', output: 'Ranked chunks.', communicatesWith: 'Knowledge retriever.', constraint: 'Not directly accessible to any model.' },
  { id: 'mock-data', title: 'Mock Services / Data', subtitle: 'Operational state', category: 'data', x: 620, y: 500,
    responsibility: 'Models deployment state without external runtime dependencies.', input: 'Known service name.', output: 'Fixed status and logs.', communicatesWith: 'Runtime tools.', constraint: 'Mock observations are not documentation.' },
  { id: 'memory', title: 'PostgreSQL Memory', subtitle: 'Persistent context', category: 'data', x: 70, y: 230,
    responsibility: 'Stores durable application facts included in Supervisor context.', input: 'Accepted memory values.', output: 'Persistent facts.', communicatesWith: 'AssistantService.', constraint: 'Values are not written to traces.' },
  { id: 'history', title: 'Conversation History', subtitle: 'Short-term context', category: 'data', x: 70, y: 365,
    responsibility: 'Keeps recent user and final assistant messages per conversation.', input: 'Completed turns.', output: 'Recent context.', communicatesWith: 'AssistantService.', constraint: 'Tool observations are not persisted.' },
  { id: 'trace', title: 'Trace Store + UI', subtitle: 'Nested observability', category: 'observability', x: 825, y: 365,
    responsibility: 'Captures and renders Supervisor to specialist to tool to retrieval hierarchy.', input: 'Sanitized spans and parent IDs.', output: 'Expandable execution tree.', communicatesWith: 'Instrumented backend stages and View execution.', constraint: 'Never stores prompts, retrieved contents, memory values, or chain of thought.' },
]

export const architectureEdges: ArchitectureEdgeModel[] = [
  { id: 'user-api', source: 'user', target: 'api', label: 'request' },
  { id: 'api-supervisor', source: 'api', target: 'supervisor', label: 'context' },
  { id: 'supervisor-ollama', source: 'supervisor', target: 'ollama', label: 'decision' },
  { id: 'ollama-final', source: 'ollama', target: 'final', label: 'synthesis' },
  { id: 'supervisor-knowledge', source: 'supervisor', target: 'knowledge-agent', label: 'delegate', kind: 'optional' },
  { id: 'supervisor-runtime', source: 'supervisor', target: 'runtime-agent', label: 'delegate', kind: 'optional' },
  { id: 'knowledge-tool-edge', source: 'knowledge-agent', target: 'knowledge-tool' },
  { id: 'runtime-tools-edge', source: 'runtime-agent', target: 'runtime-tools' },
  { id: 'knowledge-embedding', source: 'knowledge-tool', target: 'embedding' },
  { id: 'embedding-qdrant', source: 'embedding', target: 'qdrant' },
  { id: 'runtime-data', source: 'runtime-tools', target: 'mock-data' },
  { id: 'knowledge-return', source: 'knowledge-agent', target: 'supervisor', label: 'finding', kind: 'feedback', bend: -75 },
  { id: 'runtime-return', source: 'runtime-agent', target: 'supervisor', label: 'finding', kind: 'feedback', bend: 75 },
  { id: 'memory-api', source: 'memory', target: 'api' },
  { id: 'history-api', source: 'history', target: 'api' },
  { id: 'supervisor-trace', source: 'supervisor', target: 'trace', kind: 'observes', bend: 80 },
  { id: 'knowledge-trace', source: 'knowledge-agent', target: 'trace', kind: 'observes', bend: 50 },
  { id: 'runtime-trace', source: 'runtime-agent', target: 'trace', kind: 'observes' },
]

export const architectureFlowSteps: ArchitectureFlowStep[] = [
  { title: 'Context is assembled', description: 'The API combines persistent memory, recent conversation history, and the current request for the Supervisor.', nodeIds: ['user', 'api', 'memory', 'history', 'supervisor'], edgeIds: ['user-api', 'memory-api', 'history-api', 'api-supervisor'] },
  { title: 'Supervisor chooses domains', description: 'A bounded Supervisor model call can delegate to Knowledge, Runtime, or both specialist agents.', nodeIds: ['supervisor', 'ollama', 'knowledge-agent', 'runtime-agent'], edgeIds: ['supervisor-ollama', 'supervisor-knowledge', 'supervisor-runtime'] },
  { title: 'Knowledge investigation', description: 'The Knowledge Agent can only search indexed documentation through embedding and Qdrant retrieval.', nodeIds: ['knowledge-agent', 'knowledge-tool', 'embedding', 'qdrant'], edgeIds: ['knowledge-tool-edge', 'knowledge-embedding', 'embedding-qdrant'] },
  { title: 'Runtime investigation', description: 'The Runtime Agent can only inspect restored mock deployment status and logs.', nodeIds: ['runtime-agent', 'runtime-tools', 'mock-data'], edgeIds: ['runtime-tools-edge', 'runtime-data'] },
  { title: 'Findings return', description: 'Specialist answers become observations for the Supervisor; specialists cannot call one another.', nodeIds: ['knowledge-agent', 'runtime-agent', 'supervisor'], edgeIds: ['knowledge-return', 'runtime-return'] },
  { title: 'Supervisor synthesizes', description: 'The Supervisor combines available findings into the only user-facing answer.', nodeIds: ['supervisor', 'ollama', 'final'], edgeIds: ['supervisor-ollama', 'ollama-final'] },
  { title: 'Execution stays observable', description: 'Sanitized parent-child spans let View execution reconstruct arbitrary multi-agent nesting.', nodeIds: ['supervisor', 'knowledge-agent', 'runtime-agent', 'trace'], edgeIds: ['supervisor-trace', 'knowledge-trace', 'runtime-trace'] },
]
