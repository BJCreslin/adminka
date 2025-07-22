import React from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { QRCodeSVG } from 'qrcode.react'
import { TELEGRAM_BOT_URL } from './constants'
import { login, saveAuthToken, getAuthToken, AuthError } from './services/auth'
import Layout from './components/Layout'
import MainPage from './components/MainPage'
import UsersPage from './components/UsersPage'
import ProcurementsPage from './components/ProcurementsPage'
import MonitoringPage from './components/MonitoringPage'

interface LoginFormValues {
  code: string
}

const loginSchema = z.object({
  code: z.string().min(4, 'Введите код из Telegram (не менее 4 символов)')
})

// Компонент для проверки авторизации
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = React.useState(true)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  
  React.useEffect(() => {
    const token = getAuthToken()
    setIsAuthenticated(!!token)
    setIsChecking(false)
  }, [])
  
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <Layout>{children}</Layout>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/procurements" 
        element={
          <ProtectedRoute>
            <ProcurementsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/monitoring" 
        element={
          <ProtectedRoute>
            <MonitoringPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })
  const [message, setMessage] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)

  async function onSubmit(data: LoginFormValues) {
    clearErrors()
    setMessage(null)
    
    try {
      const response = await login({ numberCode: parseInt(data.code, 10) })
      saveAuthToken(response.token)
      
      setMessage('Успешный вход! Переходим в панель управления...')
      setIsSuccess(true)
      
      // Перенаправляем на главную страницу через 1.5 секунды
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (error) {
      if (error instanceof AuthError) {
        setMessage(error.message)
      } else {
        setMessage('Неожиданная ошибка. Попробуйте позже.')
      }
    }
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
          <div className={`text-center text-sm mt-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
