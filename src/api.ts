import type { ChatRequest, ChatResponse, Memory, MemoryRequest } from './types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return apiRequest('/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function getMemories(): Promise<Memory[]> {
  return apiRequest('/memory')
}

export async function saveMemory(request: MemoryRequest): Promise<void> {
  await apiRequest('/memory', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => undefined) as { message?: string } | undefined
    throw new ApiError(body?.message ?? `Request failed with status ${response.status}`, response.status)
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
