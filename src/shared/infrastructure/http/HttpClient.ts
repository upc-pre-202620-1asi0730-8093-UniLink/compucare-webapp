import { ApiError } from './ApiError'

export type HttpClientOptions = {
  baseUrl?: string
  getAccessToken?: () => string | null
}

/**
 * Thin fetch wrapper used by BC infrastructure repositories.
 */
export class HttpClient {
  private readonly baseUrl: string
  private readonly getAccessToken?: () => string | null

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? '').replace(
      /\/$/,
      '',
    )
    this.getAccessToken = options.getAccessToken
  }

  async post<TResponse>(path: string, body: unknown): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<TResponse>(path: string, body: unknown): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async get<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>(path, { method: 'GET' })
  }

  private async request<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
    const headers = new Headers(init.headers)
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')

    const token = this.getAccessToken?.()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    })

    const rawBody = await response.text()
    const parsedBody = rawBody ? this.tryParseJson(rawBody) : null

    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status} ${response.statusText}`,
        response.status,
        parsedBody ?? rawBody,
      )
    }

    return parsedBody as TResponse
  }

  private tryParseJson(raw: string): unknown {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }
}
