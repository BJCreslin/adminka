import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { QRCodeSVG } from 'qrcode.react'
import { TELEGRAM_BOT_URL } from './constants'

interface LoginFormValues {
  code: string
}

const loginSchema = z.object({
  code: z.string().min(4, 'Введите код из Telegram (не менее 4 символов)')
})

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })
  const [message, setMessage] = React.useState<string | null>(null)

  async function onSubmit() {
    clearErrors()
    setMessage(null)
    
    // ВРЕМЕННО: Принимаем любой код для входа
    try {
      // Имитируем задержку сети
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Генерируем фиктивный токен
      const fakeToken = `fake-jwt-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      localStorage.setItem('jwt', fakeToken)
      setMessage('Успешный вход! (Временный режим - любой код принят)')
      
      // Здесь можно сделать редирект или обновить состояние приложения
    } catch {
      setMessage('Не удалось сохранить токен. Проверьте настройки браузера.')
    }
    
    /* ЗАКОММЕНТИРОВАННЫЙ СТАРЫЙ КОД API:
    let response: Response
    try {
      response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data.code })
      })
    } catch {
      setMessage('Ошибка сети. Попробуйте позже.')
      return
    }
    if (!response.ok) {
      if (response.status === 401) {
        setError('code', { message: 'Неверный код. Попробуйте снова.' })
        return
      }
      setMessage('Ошибка сервера. Попробуйте позже.')
      return
    }
    const result = await response.json()
    if (!result?.token) {
      setMessage('Некорректный ответ сервера. Попробуйте позже.')
      return
    }
    try {
      localStorage.setItem('jwt', result.token)
    } catch {
      setMessage('Не удалось сохранить токен. Проверьте настройки браузера.')
      return
    }
    setMessage('Успешный вход!')
    // Здесь можно сделать редирект или обновить состояние приложения
    */
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-center">Вход в систему</h1>
        <p className="text-gray-600 text-center">
          Для входа получите код у Telegram-бота и введите его ниже. Если у вас нет кода, отсканируйте QR-код для перехода к боту.
        </p>
        <div className="flex justify-center">
          <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer" aria-label="Перейти к Telegram-боту">
            <QRCodeSVG value={TELEGRAM_BOT_URL} size={128} />
          </a>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Код из Telegram</span>
            <input
              type="text"
              autoComplete="one-time-code"
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('code')}
              disabled={isSubmitting}
              inputMode="numeric"
            />
            {errors.code && (
              <span className="text-red-500 text-sm">{errors.code.message}</span>
            )}
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>
        {message && (
          <div className="text-center text-sm mt-2 text-red-600">{message}</div>
        )}
      </div>
    </div>
  )
}

export default App
