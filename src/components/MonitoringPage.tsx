import { useState, useEffect } from 'react'

const MonitoringIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
    <path d="M3 13H7V23H3V13ZM10 9H14V23H10V9ZM17 5H21V23H17V5Z"/>
  </svg>
)

interface ServerStatus {
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN' | 'UNAVAILABLE'
  timestamp?: string
  lastChecked: Date
}

const StatusCircle = ({ status }: { status: ServerStatus['status'] }) => {
  const getStatusColor = (status: ServerStatus['status']) => {
    switch (status) {
      case 'UP': return 'bg-green-500'
      case 'DOWN': return 'bg-red-500'
      case 'OUT_OF_SERVICE': return 'bg-orange-500'
      case 'UNKNOWN': return 'bg-gray-500'
      case 'UNAVAILABLE': return 'bg-red-600'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: ServerStatus['status']) => {
    switch (status) {
      case 'UP': return 'Работает'
      case 'DOWN': return 'Недоступен'
      case 'OUT_OF_SERVICE': return 'Не обслуживается'
      case 'UNKNOWN': return 'Неизвестно'
      case 'UNAVAILABLE': return 'Сервер недоступен'
      default: return 'Неизвестно'
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`w-4 h-4 rounded-full ${getStatusColor(status)} shadow-sm`}></div>
      <span className="font-medium text-gray-800">{getStatusText(status)}</span>
    </div>
  )
}

export default function MonitoringPage() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: 'UNKNOWN',
    lastChecked: new Date()
  })
  const [isChecking, setIsChecking] = useState(false)

  const checkServerHealth = async () => {
    setIsChecking(true)
    
    try {
      // Получаем JWT токен
      const token = localStorage.getItem('jwt')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 секунд таймаут
      
      const response = await fetch('https://naidizakupku.ru/api/health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        setServerStatus({
          status: data.status || 'UNKNOWN',
          timestamp: data.timestamp,
          lastChecked: new Date()
        })
      } else {
        setServerStatus({
          status: 'DOWN',
          lastChecked: new Date()
        })
      }
    } catch (error) {
      console.error('Health check failed:', error)
      setServerStatus({
        status: 'UNAVAILABLE',
        lastChecked: new Date()
      })
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Проверяем сразу при загрузке
    checkServerHealth()
    
    // Устанавливаем интервал 60 секунд
    const interval = setInterval(checkServerHealth, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    try {
      if (!date || isNaN(date.getTime())) {
        return 'Невалидная дата'
      }
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return 'Ошибка форматирования даты'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <MonitoringIcon />
          <h1 className="text-2xl font-bold text-gray-900 ml-3">Мониторинг сервера</h1>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Статус сервера */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Статус сервера</h3>
                {isChecking && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                )}
              </div>
              
              <StatusCircle status={serverStatus.status} />
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Последняя проверка: <span className="font-medium">{formatTime(serverStatus.lastChecked)}</span>
                </p>
                {serverStatus.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    Время сервера (UTC): {(() => {
                      try {
                        const date = new Date(serverStatus.timestamp)
                        return isNaN(date.getTime()) ? 'Невалидная дата' : date.toISOString()
                      } catch {
                        return 'Невалидная дата'
                      }
                    })()}
                  </p>
                )}
              </div>
            </div>

            {/* Информация о мониторинге */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Параметры мониторинга</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Интервал проверки:</span>
                  <span className="font-medium">60 секунд</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Endpoint:</span>
                  <span className="font-medium text-xs">api/health</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Таймаут:</span>
                  <span className="font-medium">10 секунд</span>
                </div>
              </div>

              <button
                onClick={checkServerHealth}
                disabled={isChecking}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                {isChecking ? 'Проверяется...' : 'Проверить сейчас'}
              </button>
            </div>

          </div>

          {/* Будущее расширение */}
          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Планируемые метрики</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl text-gray-400">📊</div>
                <p className="text-xs text-gray-600 mt-1">Производительность</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl text-gray-400">💾</div>
                <p className="text-xs text-gray-600 mt-1">Память</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl text-gray-400">🔄</div>
                <p className="text-xs text-gray-600 mt-1">Нагрузка</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl text-gray-400">📋</div>
                <p className="text-xs text-gray-600 mt-1">Логи</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 