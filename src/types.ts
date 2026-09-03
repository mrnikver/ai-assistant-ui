export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH'
export type MemoryKey = 'PRODUCTION_REGION' | 'DEFAULT_SERVICE'

export interface ChatRequest {
  conversationId?: string
  message: string
}

export interface ChatResponse {
  conversationId: string
  answer: string
  confidence: Confidence
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
}
