import { API_BASE_URL, LOGIN_ENDPOINT } from '../constants'

export interface LoginRequest {
  numberCode: number
}

export interface LoginResponse {
  token: string
}

export class AuthError extends Error {
  status?: number
  
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  let response: Response
  
  try {
    response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numberCode: data.numberCode })
    })
  } catch {
    throw new AuthError('Ошибка сети. Попробуйте позже.')
  }
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new AuthError('Неверный код. Попробуйте снова.', 401)
    }
    throw new AuthError('Ошибка сервера. Попробуйте позже.', response.status)
  }
  
  // Сервер может возвращать токен как строку или как JSON объект
  const contentType = response.headers.get('content-type')
  let token: string
  
  if (contentType && contentType.includes('application/json')) {
    // Если JSON, ищем поле token
    const result = await response.json()
    if (!result?.token) {
      throw new AuthError('Некорректный ответ сервера. Попробуйте позже.')
    }
    token = result.token
  } else {
    // Если простая строка, используем её как токен
    token = await response.text()
    if (!token || token.length < 10) {
      throw new AuthError('Некорректный токен от сервера. Попробуйте позже.')
    }
  }
  
  return { token }
}

export function saveAuthToken(token: string): void {
  try {
    localStorage.setItem('jwt', token)
  } catch {
    throw new AuthError('Не удалось сохранить токен. Проверьте настройки браузера.')
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('jwt')
}

export function removeAuthToken(): void {
  localStorage.removeItem('jwt')
} 