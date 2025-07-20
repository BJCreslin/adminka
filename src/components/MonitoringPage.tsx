import React from 'react'

const MonitoringIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
    <path d="M3 13H7V23H3V13ZM10 9H14V23H10V9ZM17 5H21V23H17V5Z"/>
  </svg>
)

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <MonitoringIcon />
          <h1 className="text-2xl font-bold text-gray-900 ml-3">Мониторинг сервера</h1>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Раздел в разработке</h3>
            <p className="text-gray-600">
              Здесь будет реализован функционал для мониторинга состояния сервера: метрики производительности, логи системы, статус служб, анализ нагрузки.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 