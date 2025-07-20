import React from 'react'

// SVG иконки как React компоненты
const Icons = {
  Users: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
    </svg>
  ),
  Procurements: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
      <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V5H19V19ZM17 13H7V11H17V13ZM15 17H7V15H15V17ZM7 9V7H17V9H7Z"/>
    </svg>
  ),
  Monitoring: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
      <path d="M3 13H7V23H3V13ZM10 9H14V23H10V9ZM17 5H21V23H17V5Z"/>
    </svg>
  )
}

export default function MainPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Панель администратора
        </h1>
        <p className="text-gray-600 mb-6">
          Добро пожаловать в административную панель. Выберите раздел в навигации выше для управления системой.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Icons.Users />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Пользователи</h3>
              <p className="text-sm text-gray-500">Управление пользователями системы</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Icons.Procurements />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Закупки</h3>
              <p className="text-sm text-gray-500">Управление процессом закупок</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Icons.Monitoring />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Мониторинг</h3>
              <p className="text-sm text-gray-500">Контроль состояния сервера</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 