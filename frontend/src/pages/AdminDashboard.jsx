import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/edutrack.png'
import { getAuthUser } from '../auth/roles.js'
import { API_BASE_URL } from '../config.js'

const adminSections = ['Users', 'Resources', 'Bookings', 'Notifications']
const USERS_API_URL = `${API_BASE_URL}/api/auth/admin/users`
const NOTIFICATION_API_URL = `${API_BASE_URL}/api/auth/notification-preferences`
const RESOURCES_API_URL = `${API_BASE_URL}/api/resources`
const BOOKINGS_API_URL = `${API_BASE_URL}/api/bookings`
const notificationCategoryLabels = {
  BOOKING_UPDATES: 'Booking Updates',
  MAINTENANCE_ALERTS: 'Maintenance Alerts',
  SYSTEM_ANNOUNCEMENTS: 'System Announcements',
  SECURITY_NOTICES: 'Security Notices',
}

const resourceTypeLabels = {
  LAB: 'Lab',
  LECTURE_HALL: 'Lecture Hall',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
}

const initialAdminNotifications = [
  { id: 1, title: 'New booking request', detail: 'Computer Lab B needs approval.', time: '5 min ago', read: false },
  { id: 2, title: 'Maintenance alert', detail: 'Projector fault reported in Hall A3.', time: '20 min ago', read: false },
  { id: 3, title: 'System announcement', detail: 'Semester schedule update published.', time: '1 hour ago', read: true },
]


// Admin Dashboard

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = getAuthUser()
  const initialSection = searchParams.get('section')
  const resolvedInitialSection = adminSections.includes(initialSection) ? initialSection : 'Users'
  const [activeSection, setActiveSection] = useState(resolvedInitialSection)
  const [users, setUsers] = useState([])
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [usersStatus, setUsersStatus] = useState('')
  const [crudStatus, setCrudStatus] = useState('')
  const [editingUserId, setEditingUserId] = useState(null)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    itNumber: '',
    email: '',
    role: 'USER',
  })
  const [formData, setFormData] = useState({
    fullName: '',
    itNumber: '',
    email: '',
    password: '',
    role: 'TECHNICIAN',
  })
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notificationPreferences, setNotificationPreferences] = useState({})
  const [notificationStatus, setNotificationStatus] = useState('')
  const [isNotificationLoading, setIsNotificationLoading] = useState(false)
  const [isNotificationSaving, setIsNotificationSaving] = useState(false)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const [adminNotifications, setAdminNotifications] = useState(initialAdminNotifications)
  const [resources, setResources] = useState([])
  const [isResourcesLoading, setIsResourcesLoading] = useState(false)
  const [resourcesStatus, setResourcesStatus] = useState('')
  const [resourceCrudStatus, setResourceCrudStatus] = useState('')
  const [resourceFilters, setResourceFilters] = useState({
    name: '',
    type: '',
    status: '',
    location: '',
    minCapacity: '',
  })
  const [resourceFormData, setResourceFormData] = useState({
    name: '',
    type: 'LAB',
    capacity: 1,
    location: '',
    availabilityWindows: '',
    status: 'AVAILABLE',
  })
  const [isSubmittingResource, setIsSubmittingResource] = useState(false)
  const [editingResourceId, setEditingResourceId] = useState(null)
  const [editResourceFormData, setEditResourceFormData] = useState({
    name: '',
    type: 'LAB',
    capacity: 1,
    location: '',
    availabilityWindows: '',
    status: 'AVAILABLE',
  })
  const [bookings, setBookings] = useState([])
  const [isBookingsLoading, setIsBookingsLoading] = useState(false)
  const [bookingsStatus, setBookingsStatus] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL')

  const unreadNotificationCount = adminNotifications.filter((notification) => !notification.read).length

  const getResourceStatusLabel = (resource) => {
    const status = (resource?.status || '').toUpperCase()
    if (status === 'OUT_OF_SERVICE') {
      return { label: 'Out of Service', tone: 'rose' }
    }

    if (status === 'BUSY') {
      return { label: 'Busy', tone: 'amber' }
    }

    return { label: 'Available', tone: 'emerald' }
  }

  const getResourceDisplayStatus = (resource) => {
    const status = (resource?.status || '').toUpperCase()
    if (status === 'OUT_OF_SERVICE' || status === 'AVAILABLE' || status === 'BUSY') {
      return status
    }

    return 'AVAILABLE'
  }

  const filteredResources = resources.filter((resource) => {
    const displayStatus = getResourceDisplayStatus(resource)
    return (
      (resource.name || '').toLowerCase().includes(resourceFilters.name.toLowerCase()) &&
      (resource.type || '').toLowerCase().includes(resourceFilters.type.toLowerCase()) &&
      (resource.location || '').toLowerCase().includes(resourceFilters.location.toLowerCase()) &&
      displayStatus.toLowerCase().includes(resourceFilters.status.toLowerCase()) &&
      (resourceFilters.minCapacity === '' || Number(resource.capacity || 0) >= Number(resourceFilters.minCapacity))
    )
  })

  const handleResourceFilterChange = (event) => {
    const { name, value } = event.target
    setResourceFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleClearResourceFilters = () => {
    setResourceFilters({
      name: '',
      type: '',
      status: '',
      location: '',
      minCapacity: '',
    })
  }

  const fetchUsers = async () => {
    setIsUsersLoading(true)
    setUsersStatus('')
    try {
      const response = await fetch(USERS_API_URL)
      const data = await response.json()

      if (!response.ok) {
        setUsersStatus(data.message || 'Failed to load users.')
        return
      }

      setUsers(Array.isArray(data) ? data : [])
    } catch {
      setUsersStatus('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsUsersLoading(false)
    }
  }

  const fetchResources = async () => {
    setIsResourcesLoading(true)
    setResourcesStatus('')
    try {
      const response = await fetch(`${RESOURCES_API_URL}/all`)
      const data = await response.json()

      if (!response.ok) {
        setResourcesStatus(data.message || 'Failed to load resources.')
        return
      }

      setResources(Array.isArray(data) ? data : [])
    } catch {
      setResourcesStatus('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsResourcesLoading(false)
    }
  }

  const fetchBookings = async () => {
    setIsBookingsLoading(true)
    setBookingsStatus('')
    try {
      const query = bookingStatusFilter === 'ALL' ? '' : `?status=${encodeURIComponent(bookingStatusFilter)}`
      const response = await fetch(`${BOOKINGS_API_URL}${query}`)
      const data = await response.json()

      if (!response.ok) {
        setBookingsStatus(data.message || 'Failed to load bookings.')
        return
      }

      setBookings(Array.isArray(data) ? data : [])
    } catch {
      setBookingsStatus('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsBookingsLoading(false)
    }
  }

  const fetchNotificationPreferences = async () => {
    if (!user?.email) {
      return
    }

    setIsNotificationLoading(true)
    setNotificationStatus('')
    try {
      const response = await fetch(`${NOTIFICATION_API_URL}?email=${encodeURIComponent(user.email)}`)
      const data = await response.json()

      if (!response.ok) {
        setNotificationStatus(data.message || 'Failed to load notification preferences.')
        return
      }

      setNotificationPreferences(data.preferences || {})
    } catch {
      setNotificationStatus('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsNotificationLoading(false)
    }
  }

  useEffect(() => {
    if (activeSection === 'Users') {
      fetchUsers()
    }
    if (activeSection === 'Resources') {
      fetchResources()
    }
    if (activeSection === 'Bookings') {
      fetchBookings()
    }
  }, [activeSection])

  useEffect(() => {
    if (activeSection === 'Bookings') {
      fetchBookings()
    }
  }, [bookingStatusFilter])

  useEffect(() => {
    if (activeSection === 'Notifications') {
      fetchNotificationPreferences()
    }
  }, [activeSection, user?.email])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  if (resolvedInitialSection === 'Resources') {
    return <Navigate to="/admin/resources" replace />
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    navigate('/login', { replace: true })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'itNumber' ? value.toUpperCase().replace(/\s+/g, '') : value,
    }))
  }

  const isStudentCreate = formData.role === 'STUDENT'

  const handleCreateAccount = async (event) => {
    event.preventDefault()
    setStatusMessage('')
    setIsSubmitting(true)

    const payload = {
      itNumber: formData.itNumber.trim().toUpperCase(),
      role: formData.role,
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    }

    if (isStudentCreate) {
      payload.fullName = formData.fullName.trim() || null
      payload.email = formData.email.trim().toLowerCase() || null
      payload.password = formData.password.trim() || null
    }

    try {
      const response = await fetch(USERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        setStatusMessage(data.message || 'Account creation failed.')
        return
      }

      const studentHint = isStudentCreate && !formData.password.trim()
        ? ' Default password is IT number + @Stu.'
        : ''
      setStatusMessage(`${data.role} account created for ${data.email}.${studentHint}`)
      setCrudStatus('User account created successfully.')
      setFormData({
        fullName: '',
        itNumber: '',
        email: '',
        password: '',
        role: 'TECHNICIAN',
      })
      fetchUsers()
    } catch {
      setStatusMessage('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditInputChange = (event) => {
    const { name, value } = event.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'itNumber' ? value.toUpperCase().replace(/\s+/g, '') : value,
    }))
  }

  const handleStartEdit = (selectedUser) => {
    setEditingUserId(selectedUser.id)
    setCrudStatus('')
    setEditFormData({
      fullName: selectedUser.fullName || '',
      itNumber: selectedUser.itNumber || '',
      email: selectedUser.email || '',
      role: selectedUser.role || 'USER',
    })
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditFormData({
      fullName: '',
      itNumber: '',
      email: '',
      role: 'USER',
    })
  }

  const handleUpdateUser = async (event) => {
    event.preventDefault()
    if (!editingUserId) {
      return
    }

    setCrudStatus('')
    setIsUpdatingUser(true)

    try {
      const response = await fetch(`${USERS_API_URL}/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFormData.fullName.trim(),
          itNumber: editFormData.itNumber.trim().toUpperCase(),
          email: editFormData.email.trim().toLowerCase(),
          role: editFormData.role,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setCrudStatus(data.message || 'Failed to update user.')
        return
      }

      setCrudStatus(`User updated: ${data.email}`)
      setEditingUserId(null)
      fetchUsers()
    } catch {
      setCrudStatus('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsUpdatingUser(false)
    }
  }

  const handleDeleteUser = async (userToDelete) => {
    const isConfirmed = window.confirm(`Delete user ${userToDelete.email}?`)
    if (!isConfirmed) {
      return
    }

    setCrudStatus('')

    try {
      const response = await fetch(`${USERS_API_URL}/${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        let message = 'Failed to delete user.'
        try {
          const data = await response.json()
          message = data.message || message
        } catch {
          // Keep default message when response body is empty.
        }
        setCrudStatus(message)
        return
      }

      setCrudStatus(`User deleted: ${userToDelete.email}`)
      if (editingUserId === userToDelete.id) {
        handleCancelEdit()
      }
      fetchUsers()
    } catch {
      setCrudStatus('Cannot connect to server. Please start backend and try again.')
    }
  }

  const handleNotificationToggle = (category) => {
    setNotificationStatus('')
    setNotificationPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleSaveNotificationPreferences = async () => {
    if (!user?.email) {
      return
    }

    setIsNotificationSaving(true)
    setNotificationStatus('')

    try {
      const response = await fetch(NOTIFICATION_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          preferences: notificationPreferences,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setNotificationStatus(data.message || 'Failed to save notification preferences.')
        return
      }

      setNotificationPreferences(data.preferences || {})
      setNotificationStatus('Notification preferences saved.')
    } catch {
      setNotificationStatus('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsNotificationSaving(false)
    }
  }

  const handleMarkAllNotificationsRead = () => {
    setAdminNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const handleReadNotificationMessage = (notificationId) => {
    setAdminNotifications((prev) => prev.map((notification) => (
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    )))
  }

  const handleResourceInputChange = (event) => {
    const { name, value } = event.target
    setResourceFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value,
    }))
  }

  const handleCreateResource = async (event) => {
    event.preventDefault()
    setResourceCrudStatus('')

    if (!resourceFormData.name.trim()) {
      setResourceCrudStatus('Resource name is required.')
      return
    }

    if (!resourceFormData.type.trim()) {
      setResourceCrudStatus('Resource type is required.')
      return
    }

    if (!Number.isFinite(resourceFormData.capacity) || resourceFormData.capacity < 1) {
      setResourceCrudStatus('Capacity must be at least 1.')
      return
    }

    setIsSubmittingResource(true)
    try {
      const response = await fetch(`${RESOURCES_API_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceFormData),
      })
      const data = await response.json()
      if (!response.ok) {
        setResourceCrudStatus(data.message || 'Failed to create resource.')
        return
      }

      setResourceCrudStatus(`Resource created: ${data.name}`)
      setResourceFormData({
        name: '',
        type: 'LAB',
        capacity: 1,
        location: '',
        availabilityWindows: '',
        status: 'AVAILABLE',
      })
      fetchResources()
    } catch {
      setResourceCrudStatus('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsSubmittingResource(false)
    }
  }

  const handleStartResourceEdit = (resource) => {
    setEditingResourceId(resource.id)
    setEditResourceFormData({
      name: resource.name || '',
      type: resource.type || 'LAB',
      capacity: resource.capacity || 1,
      location: resource.location || '',
      availabilityWindows: resource.availabilityWindows || '',
      status: resource.status || 'AVAILABLE',
    })
    setResourceCrudStatus('')
  }

  const handleEditResourceInputChange = (event) => {
    const { name, value } = event.target
    setEditResourceFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value,
    }))
  }

  const handleUpdateResource = async (event) => {
    event.preventDefault()
    if (!editingResourceId) {
      return
    }

    setResourceCrudStatus('')
    try {
      const response = await fetch(`${RESOURCES_API_URL}/${editingResourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editResourceFormData),
      })
      const data = await response.json()
      if (!response.ok) {
        setResourceCrudStatus(data.message || 'Failed to update resource.')
        return
      }

      setResourceCrudStatus(`Resource updated: ${data.name}`)
      setEditingResourceId(null)
      fetchResources()
    } catch {
      setResourceCrudStatus('Cannot connect to server. Please start backend and try again.')
    }
  }

  const handleDeleteResource = async (resource) => {
    const isConfirmed = window.confirm(`Delete resource ${resource.name}?`)
    if (!isConfirmed) {
      return
    }

    setResourceCrudStatus('')
    try {
      const response = await fetch(`${RESOURCES_API_URL}/${resource.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        setResourceCrudStatus('Failed to delete resource.')
        return
      }

      setResourceCrudStatus(`Resource deleted: ${resource.name}`)
      if (editingResourceId === resource.id) {
        setEditingResourceId(null)
      }
      fetchResources()
    } catch {
      setResourceCrudStatus('Cannot connect to server. Please start backend and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f5efe8] p-3 sm:p-5">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-xl sm:p-7">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduTrack logo" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin Control Room</p>
              <h1 className="text-2xl font-black text-slate-900">Campus Operations Dashboard</h1>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNotificationPanelOpen((prev) => !prev)}
              className="relative rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              aria-label="View notifications"
            >
              <span className="text-base leading-none">🔔</span>
              {unreadNotificationCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                  {unreadNotificationCount}
                </span>
              ) : null}
            </button>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">ADMIN</span>
            <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Logout
            </button>

            {isNotificationPanelOpen ? (
              <div className="absolute right-0 top-12 z-20 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Notifications</p>
                    <h3 className="text-lg font-black text-slate-900">Recent updates</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsRead}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Mark all read
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNotificationPanelOpen(false)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {adminNotifications.map((notification) => (
                    <div key={notification.id} className={`rounded-xl border p-3 ${notification.read ? 'border-slate-200 bg-slate-50' : 'border-cyan-200 bg-cyan-50'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-bold ${notification.read ? 'text-slate-900' : 'text-cyan-900'}`}>{notification.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{notification.detail}</p>
                          <button
                            type="button"
                            onClick={() => handleReadNotificationMessage(notification.id)}
                            disabled={notification.read}
                            className="mt-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {notification.read ? 'Read' : 'Read message'}
                          </button>
                        </div>
                        <span className="whitespace-nowrap text-xs font-semibold text-slate-400">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Navigation</p>
            <nav className="mt-4 space-y-2">
              {adminSections.map((section) => {
                const isActive = activeSection === section
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => {
                      if (section === 'Resources') {
                        navigate('/admin/resources')
                        return
                      }

                      setActiveSection(section)
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {section}
                  </button>
                )
              })}
            </nav>
          </aside>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-black text-slate-900">{activeSection}</h2>
              <p className="mt-2 text-sm text-slate-500">
                You are signed in as {user.fullName || 'Administrator'} ({user.email}).
              </p>

              {activeSection === 'Users' ? (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">Manage all users in the system (Read, Create, Update, Delete).</p>
                    <button
                      type="button"
                      onClick={fetchUsers}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Refresh Users
                    </button>
                  </div>

                  {usersStatus ? <p className="text-sm text-rose-600">{usersStatus}</p> : null}
                  {crudStatus ? <p className="text-sm text-slate-700">{crudStatus}</p> : null}

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full bg-white text-sm">
                      <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">IT Number</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Role</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isUsersLoading ? (
                          <tr>
                            <td colSpan="5" className="px-3 py-5 text-center text-slate-500">Loading users...</td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-3 py-5 text-center text-slate-500">No users found.</td>
                          </tr>
                        ) : (
                          users.map((item) => (
                            <tr key={item.id} className="border-t border-slate-100">
                              <td className="px-3 py-2 text-slate-800">{item.fullName}</td>
                              <td className="px-3 py-2 text-slate-700">{item.itNumber}</td>
                              <td className="px-3 py-2 text-slate-700">{item.email}</td>
                              <td className="px-3 py-2 text-slate-700">{item.role}</td>
                              <td className="px-3 py-2">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(item)}
                                    className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white hover:bg-slate-800"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(item)}
                                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {editingUserId ? (
                    <form className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2" onSubmit={handleUpdateUser}>
                      <input
                        name="fullName"
                        value={editFormData.fullName}
                        onChange={handleEditInputChange}
                        placeholder="Full name"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                        required
                      />
                      <input
                        name="itNumber"
                        value={editFormData.itNumber}
                        onChange={handleEditInputChange}
                        placeholder="IT23608054"
                        maxLength={10}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 uppercase outline-none focus:ring-4 focus:ring-violet-100"
                        required
                      />
                      <input
                        name="email"
                        type="email"
                        value={editFormData.email}
                        onChange={handleEditInputChange}
                        placeholder="user@smartcampus.com"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                        required
                      />
                      <select
                        name="role"
                        value={editFormData.role}
                        onChange={handleEditInputChange}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="USER">USER</option>
                        <option value="TECHNICIAN">TECHNICIAN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <div className="flex gap-2 md:col-span-2">
                        <button
                          type="submit"
                          disabled={isUpdatingUser}
                          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                        >
                          {isUpdatingUser ? 'Updating...' : 'Update User'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : null}

                  <section className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Create User Account</h2>
                        <p className="text-sm text-slate-500">Admin can create ADMIN, MANAGER, TECHNICIAN, USER, and STUDENT accounts.</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">STUDENT uses IT number, TECHNICIAN gets ITTECH###</span>
                    </div>

                    <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreateAccount}>
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder={isStudentCreate ? 'Optional for student' : 'Full name'}
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                        required={!isStudentCreate}
                      />
                      <input
                        name="itNumber"
                        value={formData.itNumber}
                        onChange={handleChange}
                        placeholder={isStudentCreate ? 'IT23608054' : 'Optional for technician (auto ITTECH001)'}
                        maxLength={10}
                        className="rounded-xl border border-slate-200 px-4 py-3 uppercase outline-none focus:ring-4 focus:ring-violet-100"
                        required={isStudentCreate}
                      />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={isStudentCreate ? 'Optional for student' : 'staff@smartcampus.com'}
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                        required={!isStudentCreate}
                      />
                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={isStudentCreate ? 'Optional for student (auto if empty)' : 'Temporary password'}
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                        required={!isStudentCreate}
                      />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-violet-100"
                      >
                        <option value="TECHNICIAN">TECHNICIAN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                        <option value="STUDENT">STUDENT</option>
                      </select>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60"
                      >
                        {isSubmitting ? 'Creating...' : 'Create Account'}
                      </button>
                    </form>

                    {statusMessage ? <p className="mt-3 text-sm text-slate-600">{statusMessage}</p> : null}
                  </section>
                </div>
              ) : null}

              {activeSection === 'Notifications' ? (
                <div className="mt-5 space-y-4">
                  <p className="text-sm text-slate-500">Enable or disable notification categories for your admin account.</p>
                  {notificationStatus ? <p className="text-sm text-slate-700">{notificationStatus}</p> : null}

                  {isNotificationLoading ? (
                    <p className="text-sm text-slate-500">Loading notification preferences...</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.keys(notificationCategoryLabels).map((category) => {
                        const isEnabled = Boolean(notificationPreferences[category])
                        return (
                          <label key={category} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                            <span className="font-semibold text-slate-800">{notificationCategoryLabels[category]}</span>
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => handleNotificationToggle(category)}
                              className="h-5 w-5 accent-slate-900"
                            />
                          </label>
                        )
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveNotificationPreferences}
                    disabled={isNotificationSaving || isNotificationLoading}
                    className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {isNotificationSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              ) : null}

              {activeSection === 'Resources' ? (
                <div className="mt-5 space-y-6">
                  <div className="rounded-[2rem] bg-[#003366] px-6 py-8 text-white shadow-lg shadow-slate-200/60">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-4xl font-black tracking-tight">EduTrack <span className="text-[#008080]">Inventory</span></h3>
                        <p className="mt-2 text-sm font-medium tracking-wide text-blue-100/70">SLIIT RESOURCE MANAGEMENT SYSTEM</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingResourceId(null)
                            setEditResourceFormData({
                              name: '',
                              type: 'LAB',
                              capacity: 1,
                              location: '',
                              availabilityWindows: '',
                              status: 'AVAILABLE',
                            })
                            document.getElementById('resource-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }}
                          className="rounded-xl bg-[#F39200] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
                        >
                          Add New Resource
                        </button>
                        <button
                          type="button"
                          onClick={fetchResources}
                          className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                        >
                          Refresh Resources
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                      <div className="space-y-1">
                        <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Name</label>
                        <input
                          name="name"
                          value={resourceFilters.name}
                          onChange={handleResourceFilterChange}
                          placeholder="Search..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-cyan-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</label>
                        <select
                          name="type"
                          value={resourceFilters.type}
                          onChange={handleResourceFilterChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-cyan-100"
                        >
                          <option value="">All</option>
                          <option value="LAB">Lab</option>
                          <option value="LECTURE_HALL">Lecture Hall</option>
                          <option value="MEETING_ROOM">Meeting Room</option>
                          <option value="EQUIPMENT">Equipment</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</label>
                        <select
                          name="status"
                          value={resourceFilters.status}
                          onChange={handleResourceFilterChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-cyan-100"
                        >
                          <option value="">All</option>
                          <option value="AVAILABLE">Available</option>
                          <option value="BUSY">Busy</option>
                          <option value="OUT_OF_SERVICE">Out of Service</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</label>
                        <input
                          name="location"
                          value={resourceFilters.location}
                          onChange={handleResourceFilterChange}
                          placeholder="Block..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-cyan-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Min Capacity</label>
                        <input
                          name="minCapacity"
                          type="number"
                          min="1"
                          value={resourceFilters.minCapacity}
                          onChange={handleResourceFilterChange}
                          placeholder="Qty"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-cyan-100"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button type="button" onClick={handleClearResourceFilters} className="text-sm font-bold text-slate-500 hover:text-rose-500">
                        Reset
                      </button>
                    </div>
                  </div>

                  {resourcesStatus ? <p className="text-sm text-rose-600">{resourcesStatus}</p> : null}
                  {resourceCrudStatus ? <p className="text-sm text-slate-700">{resourceCrudStatus}</p> : null}

                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {isResourcesLoading ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 md:col-span-2 lg:col-span-3">Loading resources...</div>
                    ) : filteredResources.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 md:col-span-2 lg:col-span-3">No resources found.</div>
                    ) : (
                      filteredResources.map((resource) => {
                        const statusInfo = getResourceStatusLabel(resource)
                        return (
                          <article
                            key={resource.id}
                            className={`group flex h-full flex-col justify-between rounded-[2rem] border ${resource.type === 'LAB' ? 'bg-blue-50/70 border-blue-200 text-blue-700 border-t-4 border-t-blue-500' : resource.type === 'EQUIPMENT' ? 'bg-orange-50/70 border-orange-200 text-orange-700 border-t-4 border-t-orange-500' : resource.type === 'LECTURE_HALL' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-700 border-t-4 border-t-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-700 border-t-4 border-t-slate-400'} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                          >
                            <div>
                              <div className="mb-6 flex items-start justify-between gap-4">
                                <div className="rounded-xl bg-white/80 p-3 shadow-sm text-slate-700">
                                  <span className="text-lg font-black">{resource.type === 'LAB' ? '⌘' : resource.type === 'EQUIPMENT' ? '⚙' : '▣'}</span>
                                </div>
                                <span className={`inline-flex items-center rounded-full border bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm ${statusInfo.tone === 'emerald' ? 'border-emerald-200 text-emerald-600' : statusInfo.tone === 'amber' ? 'border-amber-200 text-amber-600' : 'border-rose-200 text-rose-600'}`}>
                                  <span className={`mr-2 inline-flex h-2 w-2 rounded-full ${statusInfo.tone === 'emerald' ? 'bg-emerald-500' : statusInfo.tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                  {statusInfo.label}
                                </span>
                              </div>

                              <h3 className="mb-1 text-xl font-black text-slate-800 leading-tight">{resource.name}</h3>
                              <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{resourceTypeLabels[resource.type] || resource.type}</p>

                              <div className="mb-6 space-y-2">
                                <div className="inline-flex items-center gap-2 rounded-lg bg-white/40 p-2 text-xs font-bold text-slate-600">
                                  <span className="text-[#008080]">⌂</span> {resource.location || 'Not set'}
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-lg bg-white/40 p-2 text-xs font-bold text-slate-600">
                                  <span className="text-[#F39200]">👥</span> {resource.capacity}
                                </div>
                              </div>

                              <p className="text-xs text-slate-500">{resource.availabilityWindows || 'No schedule set'}</p>
                            </div>

                            <div className="mt-4 flex gap-3 opacity-100 transition-all duration-300 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingResourceId(resource.id)
                                  setEditResourceFormData({
                                    name: resource.name || '',
                                    type: resource.type || 'LAB',
                                    capacity: resource.capacity || 1,
                                    location: resource.location || '',
                                    availabilityWindows: resource.availabilityWindows || '',
                                    status: resource.status || 'AVAILABLE',
                                  })
                                  document.getElementById('resource-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }}
                                className="flex-1 rounded-xl bg-[#008080] px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-teal-900/20"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteResource(resource)}
                                className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-white shadow-md transition hover:bg-slate-800 hover:-translate-y-0.5"
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        )
                      })
                    )}
                  </div>

                  <section id="resource-form" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{editingResourceId ? 'Edit Resource' : 'Add Resource'}</h3>
                        <p className="text-sm text-slate-500">{editingResourceId ? 'Update the selected resource details below.' : 'Add a new resource to the inventory.'}</p>
                      </div>
                      {editingResourceId ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingResourceId(null)
                            setEditResourceFormData({
                              name: '',
                              type: 'LAB',
                              capacity: 1,
                              location: '',
                              availabilityWindows: '',
                              status: 'AVAILABLE',
                            })
                          }}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Cancel Edit
                        </button>
                      ) : null}
                    </div>
                  </section>

                  {editingResourceId ? (
                    <form className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2" onSubmit={handleUpdateResource}>
                      <input name="name" value={editResourceFormData.name} onChange={handleEditResourceInputChange} placeholder="Resource name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <input name="type" value={editResourceFormData.type} onChange={handleEditResourceInputChange} placeholder="LAB / HALL" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <input name="capacity" type="number" min="1" value={editResourceFormData.capacity} onChange={handleEditResourceInputChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <input name="location" value={editResourceFormData.location} onChange={handleEditResourceInputChange} placeholder="Location" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <input name="availabilityWindows" value={editResourceFormData.availabilityWindows} onChange={handleEditResourceInputChange} placeholder="08:00-18:00" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <input name="status" value={editResourceFormData.status} onChange={handleEditResourceInputChange} placeholder="AVAILABLE" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <button type="submit" disabled={isSubmittingResource} className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60 md:col-span-2">
                        {isSubmittingResource ? 'Saving...' : 'Save Resource Changes'}
                      </button>
                    </form>
                  ) : (
                    <form className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2" onSubmit={handleCreateResource}>
                      <input name="name" value={resourceFormData.name} onChange={handleResourceInputChange} placeholder="Resource name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <input name="type" value={resourceFormData.type} onChange={handleResourceInputChange} placeholder="LAB / HALL" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <input name="capacity" type="number" min="1" value={resourceFormData.capacity} onChange={handleResourceInputChange} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <input name="location" value={resourceFormData.location} onChange={handleResourceInputChange} placeholder="Location" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <input name="availabilityWindows" value={resourceFormData.availabilityWindows} onChange={handleResourceInputChange} placeholder="08:00-18:00" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <input name="status" value={resourceFormData.status} onChange={handleResourceInputChange} placeholder="AVAILABLE" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none" />
                      <button type="submit" disabled={isSubmittingResource} className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60 md:col-span-2">
                        {isSubmittingResource ? 'Creating...' : 'Create Resource'}
                      </button>
                    </form>
                  )}

                  <p className="text-xs text-slate-500">
                    This view now starts with the available resources first, then gives admin actions for edit, delete, and add.
                  </p>
                </div>
              ) : null}

              {activeSection === 'Bookings' ? (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">View booking requests and quickly open booking tools.</p>
                    <div className="flex items-center gap-2">
                      <select
                        value={bookingStatusFilter}
                        onChange={(event) => setBookingStatusFilter(event.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                      >
                        <option value="ALL">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <button
                        type="button"
                        onClick={fetchBookings}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Refresh Bookings
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    <button type="button" onClick={() => navigate('/bookings/approval')} className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white">Open Approval Panel</button>
                    <button type="button" onClick={() => navigate('/bookings/calendar')} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700">Open Booking Calendar</button>
                  </div>

                  {bookingsStatus ? <p className="text-sm text-rose-600">{bookingsStatus}</p> : null}

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full bg-white text-sm">
                      <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-3 py-2">Requester</th>
                          <th className="px-3 py-2">Resource</th>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Time</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isBookingsLoading ? (
                          <tr><td colSpan="5" className="px-3 py-5 text-center text-slate-500">Loading bookings...</td></tr>
                        ) : bookings.length === 0 ? (
                          <tr><td colSpan="5" className="px-3 py-5 text-center text-slate-500">No bookings found.</td></tr>
                        ) : (
                          bookings.map((booking) => (
                            <tr key={booking.id} className="border-t border-slate-100">
                              <td className="px-3 py-2 text-slate-700">{booking.requesterName}</td>
                              <td className="px-3 py-2 text-slate-700">{booking.resourceName}</td>
                              <td className="px-3 py-2 text-slate-700">{booking.bookingDate}</td>
                              <td className="px-3 py-2 text-slate-700">{booking.startTime} - {booking.endTime}</td>
                              <td className="px-3 py-2 text-slate-700">{booking.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </section>

          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard