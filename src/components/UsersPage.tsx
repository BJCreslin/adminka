import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { API_BASE_URL } from '../constants'

// TypeScript интерфейсы на основе Kotlin сущностей
interface User {
  id: number
  username: string
  password?: string
  enabled: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  comment?: string
  userRoles?: UserRole[]
  telegramUser?: TelegramUser
  procurements?: Procurement[]
}

interface UserRole {
  id: number
  role: string
  user: User
}

interface TelegramUser {
  id: number
  telegramId: string
  firstName?: string
  lastName?: string
  username?: string
}

interface Procurement {
  id: number
  name: string
}

interface UsersResponse {
  _embedded: {
    users: User[]
  }
  page: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

// Схемы валидации
const createUserSchema = z.object({
  username: z.string().min(3, 'Имя пользователя должно быть не менее 3 символов'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов').optional(),
  enabled: z.boolean(),
  comment: z.string().max(255, 'Комментарий не должен превышать 255 символов').optional()
})

const editUserSchema = z.object({
  username: z.string().min(3, 'Имя пользователя должно быть не менее 3 символов'),
  enabled: z.boolean(),
  comment: z.string().max(255, 'Комментарий не должен превышать 255 символов').optional()
})

type CreateUserForm = z.infer<typeof createUserSchema>
type EditUserForm = z.infer<typeof editUserSchema>

const UsersIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500 flex-shrink-0">
    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
  </svg>
)

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageSize, setPageSize] = useState(25)

  // Форма создания пользователя
  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      enabled: true
    }
  })

  // Форма редактирования пользователя
  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema)
  })

  // Загрузка пользователей
  const loadUsers = async (page = 0, search = '', size = pageSize) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('jwt')
      let url = `${API_BASE_URL}/users?page=${page}&size=${size}&sort=username`
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`)
      }

      const data: UsersResponse = await response.json()
      
      setUsers(data._embedded?.users || [])
      setTotalPages(data.page?.totalPages || 0)
      setTotalElements(data.page?.totalElements || 0)
      setCurrentPage(page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      if (errorMessage.toLowerCase().includes('failed to fetch')) {
        setError('Невозможно получить данные')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Создание пользователя
  const createUser = async (data: CreateUserForm) => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('jwt')
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Ошибка создания: ${response.status}`)
      }

      setShowCreateModal(false)
      createForm.reset()
      await loadUsers(currentPage, searchTerm, pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания пользователя'
      if (errorMessage.toLowerCase().includes('failed to fetch')) {
        setError('Невозможно создать пользователя')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Обновление пользователя
  const updateUser = async (data: EditUserForm) => {
    if (!editingUser) return
    
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('jwt')
      const response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Ошибка обновления: ${response.status}`)
      }

      setShowEditModal(false)
      setEditingUser(null)
      editForm.reset()
      await loadUsers(currentPage, searchTerm, pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления пользователя'
      if (errorMessage.toLowerCase().includes('failed to fetch')) {
        setError('Невозможно обновить пользователя')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Удаление пользователя
  const deleteUser = async () => {
    if (!deletingUser) return
    
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('jwt')
      const response = await fetch(`${API_BASE_URL}/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Ошибка удаления: ${response.status}`)
      }

      setShowDeleteModal(false)
      setDeletingUser(null)
      await loadUsers(currentPage, searchTerm, pageSize)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления пользователя'
      if (errorMessage.toLowerCase().includes('failed to fetch')) {
        setError('Невозможно удалить пользователя')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Обработчики событий
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadUsers(0, searchTerm, pageSize)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    loadUsers(0, searchTerm, newSize)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    editForm.reset({
      username: user.username,
      enabled: user.enabled,
      comment: user.comment || ''
    })
    setShowEditModal(true)
  }

  const handleDelete = (user: User) => {
    setDeletingUser(user)
    setShowDeleteModal(true)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Не указано'
    return new Date(dateStr).toLocaleString('ru-RU')
  }

  // Загрузка при монтировании
  useEffect(() => {
    loadUsers(0, '', pageSize)
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline">
            <UsersIcon />
            <h1 className="text-xl font-bold text-gray-900 ml-4">Управление пользователями</h1>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Добавить пользователя
          </button>
        </div>

        {/* Поиск */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Поиск по имени пользователя..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 h-[42px] rounded-md font-medium transition-colors"
            >
              Поиск
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  loadUsers(0, '', pageSize)
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 h-[42px] rounded-md font-medium transition-colors"
              >
                Очистить
              </button>
            )}
          </form>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center justify-between">
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700 text-sm leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Таблица */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Создан
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Комментарий
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.enabled ? 'Активен' : 'Отключен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(user.createdAt)}</div>
                      {user.createdBy && (
                        <div className="text-xs text-gray-400">от {user.createdBy}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.comment || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        <div className="mt-6 space-y-4">
          <div className="ml-2 text-sm text-gray-700">
            Показано {users.length} из {totalElements} пользователей
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Показывать:</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => loadUsers(currentPage - 1, searchTerm, pageSize)}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Назад
                </button>
                
                <span className="px-3 py-1 text-sm">
                  Страница {currentPage + 1} из {totalPages}
                </span>
                
                <button
                  onClick={() => loadUsers(currentPage + 1, searchTerm, pageSize)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Вперед
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно создания пользователя */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Создать пользователя</h2>
            
            <form onSubmit={createForm.handleSubmit(createUser)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя пользователя *
                </label>
                <input
                  type="text"
                  {...createForm.register('username')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {createForm.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {createForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  {...createForm.register('password')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {createForm.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {createForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...createForm.register('enabled')}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Активен</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий
                </label>
                <textarea
                  {...createForm.register('comment')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {createForm.formState.errors.comment && (
                  <p className="text-red-500 text-sm mt-1">
                    {createForm.formState.errors.comment.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  {isSubmitting ? 'Создание...' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    createForm.reset()
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования пользователя */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Редактировать пользователя</h2>
            
            <form onSubmit={editForm.handleSubmit(updateUser)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя пользователя *
                </label>
                <input
                  type="text"
                  {...editForm.register('username')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editForm.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {editForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...editForm.register('enabled')}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Активен</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий
                </label>
                <textarea
                  {...editForm.register('comment')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editForm.formState.errors.comment && (
                  <p className="text-red-500 text-sm mt-1">
                    {editForm.formState.errors.comment.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingUser(null)
                    editForm.reset()
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Подтвердите удаление</h2>
            
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить пользователя <strong>{deletingUser.username}</strong>? 
              Это действие нельзя отменить.
            </p>

            <div className="flex gap-3">
              <button
                onClick={deleteUser}
                disabled={isSubmitting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                {isSubmitting ? 'Удаление...' : 'Удалить'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingUser(null)
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 