// import React from 'react'

const ProcurementsIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
    <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V5H19V19ZM17 13H7V11H17V13ZM15 17H7V15H15V17ZM7 9V7H17V9H7Z"/>
  </svg>
)

export default function ProcurementsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <ProcurementsIcon />
          <h1 className="text-2xl font-bold text-gray-900 ml-3">Управление закупками</h1>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Раздел в разработке</h3>
            <p className="text-gray-600">
              Здесь будет реализован функционал для управления процессом закупок: создание заявок, отслеживание статусов, управление поставщиками, анализ закупочной деятельности.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 