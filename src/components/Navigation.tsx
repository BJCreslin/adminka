import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface NavigationItem {
  key: string
  label: string
  icon: React.ReactNode
  path: string
  action?: () => void
}

interface NavigationProps {
  onLogout: () => void
}

// SVG иконки как React компоненты
const Icons = {
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
    </svg>
  ),
  Procurements: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V5H19V19ZM17 13H7V11H17V13ZM15 17H7V15H15V17ZM7 9V7H17V9H7Z"/>
    </svg>
  ),
  Monitoring: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13H7V23H3V13ZM10 9H14V23H10V9ZM17 5H21V23H17V5Z"/>
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"/>
    </svg>
  )
}

export default function Navigation({ onLogout }: NavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Конфигурация пунктов навигации
  const navigationItems: NavigationItem[] = [
    {
      key: 'users',
      label: 'Пользователи',
      icon: <Icons.Users />,
      path: '/users'
    },
    {
      key: 'procurements',
      label: 'Закупки',
      icon: <Icons.Procurements />,
      path: '/procurements'
    },
    {
      key: 'monitoring',
      label: 'Мониторинг сервера',
      icon: <Icons.Monitoring />,
      path: '/monitoring'
    },
    {
      key: 'logout',
      label: 'Выход',
      icon: <Icons.Logout />,
      path: '/logout',
      action: onLogout
    }
  ]

  function handleItemClick(item: NavigationItem) {
    if (item.action) {
      item.action()
    } else {
      navigate(item.path)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex">
          {navigationItems.map((item, index) => (
            <button
              key={item.key}
              onClick={() => handleItemClick(item)}
              className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                index < navigationItems.length - 1 ? 'mr-5' : ''
              } ${
                location.pathname === item.path
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${item.key === 'logout' ? 'text-red-500 hover:text-red-700 ml-auto' : ''}`}
            >
              <span className={item.key === 'logout' ? 'text-red-500' : ''}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

/* 
Для добавления новых пунктов навигации:
1. Добавьте новую иконку в объект Icons:
   NewIcon: () => (
     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
       <path d="..."/>
     </svg>
   )

2. Добавьте новый объект в массив navigationItems:
   {
     key: 'settings',
     label: 'Настройки',
     icon: <Icons.NewIcon />,
     path: '/settings'
   }

3. Создайте соответствующий компонент страницы
4. Добавьте роут в App.tsx

Иконки теперь отображаются как inline SVG, что гарантирует их надежную загрузку.
*/ 