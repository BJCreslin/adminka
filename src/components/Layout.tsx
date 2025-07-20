import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from './Navigation'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('jwt')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
} 