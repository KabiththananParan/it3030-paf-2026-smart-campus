import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/edutrack.png'
import { getAuthUser } from '../auth/roles.js'
import { API_BASE_URL } from '../config.js'
import { deleteBooking, getMyBookings, updateBooking } from '../api/bookingApi.js'

const NOTIFICATION_API_URL = `${API_BASE_URL}/api/auth/notification-preferences`
const notificationCategoryLabels = {
  BOOKING_UPDATES: 'Booking Updates',
  MAINTENANCE_ALERTS: 'Maintenance Alerts',
  SYSTEM_ANNOUNCEMENTS: 'System Announcements',
  SECURITY_NOTICES: 'Security Notices',
}

const statusDotColor = {
  APPROVED: 'bg-emerald-500',
  PENDING: 'bg-amber-500',
  REJECTED: 'bg-rose-500',
  CANCELLED: 'bg-slate-400',
}

const toBookingDateTime = (booking) => {
  const raw = booking.updatedAt || booking.createdAt
  if (raw) {
    const parsed = new Date(raw)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  if (booking.bookingDate && booking.startTime) {
    const parsed = new Date(`${booking.bookingDate}T${booking.startTime}`)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return new Date(0)
}

const Dashboard = () => {
  const navigate = useNavigate()
  const user = getAuthUser()
  const [activeSection, setActiveSection] = useState('Dashboard')
  const [bookings, setBookings] = useState([])
  const [bookingError, setBookingError] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [isBookingsLoading, setIsBookingsLoading] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const [editingBookingId, setEditingBookingId] = useState(null)
  const [editBookingForm, setEditBookingForm] = useState(null)
  const [isBookingActionLoading, setIsBookingActionLoading] = useState(false)
  const [bookingNotifications, setBookingNotifications] = useState([])
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const [notificationPreferences, setNotificationPreferences] = useState({})
  const [notificationStatus, setNotificationStatus] = useState('')
  const [isNotificationLoading, setIsNotificationLoading] = useState(false)
  const [isNotificationSaving, setIsNotificationSaving] = useState(false)

  const bookingUpdatesEnabled = notificationPreferences.BOOKING_UPDATES !== false
  const pendingRequests = bookings.filter((booking) => booking.status === 'PENDING')
  const approvedBookings = bookings.filter((booking) => booking.status === 'APPROVED')
  const rejectedBookings = bookings.filter((booking) => booking.status === 'REJECTED')
  const unreadNotificationCount = bookingNotifications.filter((notification) => !notification.read).length
  const notificationReadStorageKey = user?.email ? `read_booking_notifications_${user.email.toLowerCase()}` : null

  const getStoredReadNotificationIds = () => {
    if (!notificationReadStorageKey) {
      return new Set()
    }

    try {
      return new Set(JSON.parse(localStorage.getItem(notificationReadStorageKey) || '[]'))
    } catch {
      return new Set()
    }
  }

  const saveReadNotificationIds = (updater) => {
    if (!notificationReadStorageKey) {
      return new Set()
    }

    const nextIds = updater(getStoredReadNotificationIds())
    localStorage.setItem(notificationReadStorageKey, JSON.stringify([...nextIds]))
    return nextIds
  }

  const recentActivities = [...bookings]
    .sort((left, right) => toBookingDateTime(right) - toBookingDateTime(left))
    .slice(0, 3)
    .map((booking) => ({
      id: booking.id,
      name: `${booking.resourceName || 'Resource'} booking`,
      detail: `${booking.status} • ${booking.bookingDate} ${booking.startTime}-${booking.endTime}`,
      color: statusDotColor[booking.status] || 'bg-cyan-500',
    }))

  const calendarItems = [...bookings]
    .filter((booking) => booking.status === 'APPROVED' || booking.status === 'PENDING')
    .sort((left, right) => toBookingDateTime(left) - toBookingDateTime(right))
    .slice(0, 4)
    .map((booking) => ({
      id: booking.id,
      time: booking.startTime,
      title: booking.resourceName,
      subtitle: `${booking.bookingDate} • ${booking.status}`,
    }))

  const taskCards = [
    {
      title: 'My booking requests',
      items: `${pendingRequests.length} active request${pendingRequests.length === 1 ? '' : 's'}`,
      progress: bookings.length === 0 ? '0%' : `${Math.round((pendingRequests.length / bookings.length) * 100)}%`,
      color: 'bg-violet-700',
      accent: 'bg-violet-200',
    },
    {
      title: 'My bookings',
      items: `${approvedBookings.length} approved booking${approvedBookings.length === 1 ? '' : 's'}`,
      progress: bookings.length === 0 ? '0%' : `${Math.round((approvedBookings.length / bookings.length) * 100)}%`,
      color: 'bg-emerald-600',
      accent: 'bg-emerald-200',
    },
    {
      title: 'Total records',
      items: `${bookings.length} booking item${bookings.length === 1 ? '' : 's'}`,
      progress: '100%',
      color: 'bg-cyan-500',
      accent: 'bg-cyan-200',
    },
  ]

  const loadBookings = async () => {
    if (!user?.email) {
      return
    }

    setIsBookingsLoading(true)
    setBookingError('')

    try {
      const data = await getMyBookings(user.email)
      setBookings(Array.isArray(data) ? data : [])
      setLastUpdatedAt(new Date())
    } catch (error) {
      setBookingError(error.message || 'Failed to load your bookings.')
    } finally {
      setIsBookingsLoading(false)
    }
  }

  const handleStartBookingEdit = (booking) => {
    setBookingError('')
    setBookingMessage('')
    setEditingBookingId(booking.id)
    setEditBookingForm({
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose || '',
      resourceName: booking.resourceName,
      resourceType: booking.resourceType,
    })
  }

  const handleEditBookingFieldChange = (event) => {
    const { name, value } = event.target
    setEditBookingForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleCancelBookingEdit = () => {
    setEditingBookingId(null)
    setEditBookingForm(null)
  }

  const handleSaveBookingEdit = async (bookingId) => {
    if (!editBookingForm || !user?.email) {
      return
    }

    if (!editBookingForm.bookingDate || !editBookingForm.purpose.trim()) {
      setBookingError('Booking date and purpose are required.')
      return
    }

    if (editBookingForm.startTime >= editBookingForm.endTime) {
      setBookingError('End time must be later than start time.')
      return
    }

    try {
      setIsBookingActionLoading(true)
      setBookingError('')
      setBookingMessage('')
      await updateBooking(bookingId, user.email, {
        resourceType: editBookingForm.resourceType,
        resourceName: editBookingForm.resourceName,
        bookingDate: editBookingForm.bookingDate,
        startTime: editBookingForm.startTime,
        endTime: editBookingForm.endTime,
        purpose: editBookingForm.purpose.trim(),
      })
      setBookingMessage('Booking updated successfully.')
      handleCancelBookingEdit()
      await loadBookings()
    } catch (error) {
      setBookingError(error.message || 'Failed to update booking.')
    } finally {
      setIsBookingActionLoading(false)
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    if (!user?.email) {
      return
    }

    const isConfirmed = window.confirm('Delete this booking?')
    if (!isConfirmed) {
      return
    }

    try {
      setIsBookingActionLoading(true)
      setBookingError('')
      setBookingMessage('')
      await deleteBooking(bookingId, user.email)
      setBookingMessage('Booking deleted successfully.')
      if (editingBookingId === bookingId) {
        handleCancelBookingEdit()
      }
      await loadBookings()
    } catch (error) {
      setBookingError(error.message || 'Failed to delete booking.')
    } finally {
      setIsBookingActionLoading(false)
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
    if (user?.email) {
      fetchNotificationPreferences()
      void loadBookings()
    }
  }, [user?.email])

  useEffect(() => {
    if (!user?.email) {
      return
    }

    const intervalId = setInterval(() => {
      void loadBookings()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [user?.email])

  useEffect(() => {
    if (!user?.email) {
      return
    }

    const storageKey = `seen_approved_bookings_${user.email.toLowerCase()}`
    const seenApprovedIds = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'))
    const readIds = getStoredReadNotificationIds()
    const latestApproved = approvedBookings.filter((booking) => !seenApprovedIds.has(String(booking.id)))

    if (latestApproved.length > 0 && bookingUpdatesEnabled) {
      const latestNotifications = latestApproved.map((booking) => ({
        id: `approved-${booking.id}`,
        title: 'Booking Approved',
        detail: `${booking.resourceName} on ${booking.bookingDate} (${booking.startTime} - ${booking.endTime})`,
        read: readIds.has(`approved-${booking.id}`),
        timestamp: new Date().toISOString(),
      }))
      setBookingNotifications((prev) => {
        const known = new Set(prev.map((item) => item.id))
        const merged = [...prev]
        latestNotifications.forEach((item) => {
          if (!known.has(item.id)) {
            merged.unshift(item)
          } else if (item.read) {
            merged.splice(merged.findIndex((notification) => notification.id === item.id), 1, item)
          }
        })
        return merged.slice(0, 8)
      })
    }

    localStorage.setItem(storageKey, JSON.stringify(approvedBookings.map((booking) => String(booking.id))))
  }, [approvedBookings, bookingUpdatesEnabled, user?.email])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userItNumber = user.itNumber || user.itNo || localStorage.getItem('auth_it_number') || 'IT Number'

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

  const handleMarkNotificationRead = (notificationId) => {
    saveReadNotificationIds((currentIds) => new Set(currentIds).add(String(notificationId)))
    setBookingNotifications((prev) => prev.map((notification) => (
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    )))
  }

  const handleMarkAllNotificationsRead = () => {
    saveReadNotificationIds(() => new Set(bookingNotifications.map((notification) => String(notification.id))))
    setBookingNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    navigate('/login')
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f5efe8] p-2 sm:p-3 lg:p-4">
      <div className="grid h-full w-full gap-3 rounded-[2rem] bg-slate-50 p-3 shadow-2xl lg:grid-cols-[260px_minmax(0,1fr)_280px] lg:p-4">
        <aside className="overflow-auto rounded-[1.5rem] border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduTrack logo" className="h-10 w-10 rounded-xl object-cover shadow" />
            <div>
              <h2 className="text-2xl font-black text-slate-900">EduTrack</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">User Portal</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-cyan-100 to-violet-100 p-4">
            <p className="text-xs uppercase text-slate-500">Logged in as</p>
            <p className="mt-1 text-[1.85rem] font-bold leading-tight text-slate-900 break-words">{user.fullName || 'User'}</p>
            <p className="text-sm text-slate-600 break-all">{user.email}</p>
            <p className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">{user.role || 'USER'}</p>
          </div>

          <nav className="mt-8 space-y-2 text-sm font-semibold text-slate-600">
            {['Dashboard', 'My Bookings', 'My Requests', 'Notifications'].map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
                className={`w-full rounded-xl px-4 py-3 text-left ${activeSection === section ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
              >
                {section}
              </button>
            ))}
          </nav>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Notification Settings</p>
            <p className="mt-2 text-sm text-slate-700">Manage what updates you want to receive.</p>
            <button
              type="button"
              onClick={() => setActiveSection('Notifications')}
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Open Notification Settings
            </button>
          </section>

          <button onClick={handleLogout} className="mt-10 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Logout
          </button>
        </aside>

        <main className="overflow-auto rounded-[1.5rem] bg-white p-6">
          <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <img src={logo} alt="EduTrack logo" className="h-9 w-9 rounded-lg object-cover" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">University Operations</p>
                <p className="text-sm font-bold text-slate-800">Bookings, incidents, and audits in one place</p>
              </div>
            </div>
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationPanelOpen((prev) => !prev)
                  setActiveSection('Notifications')
                }}
                className="relative rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                aria-label="Open notifications"
              >
                <span className="text-base leading-none">🔔</span>
                {unreadNotificationCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                    {unreadNotificationCount}
                  </span>
                ) : null}
              </button>
              <button className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Quick Actions</button>

              {isNotificationPanelOpen ? (
                <div className="absolute right-0 top-12 z-20 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Notifications</p>
                      <h3 className="text-lg font-black text-slate-900">User alerts</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Read all
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsNotificationPanelOpen(false)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {bookingNotifications.length === 0 ? (
                      <p className="text-sm text-slate-500">No notifications yet.</p>
                    ) : bookingNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-xl border p-3 ${notification.read ? 'border-slate-200 bg-slate-50' : 'border-emerald-200 bg-emerald-50'}`}
                      >
                        <p className={`text-sm font-bold ${notification.read ? 'text-slate-800' : 'text-emerald-800'}`}>{notification.title}</p>
                        <p className="mt-1 text-sm text-slate-700">{notification.detail}</p>
                        <button
                          type="button"
                          onClick={() => handleMarkNotificationRead(notification.id)}
                          disabled={notification.read}
                          className="mt-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {notification.read ? 'Read' : 'Mark as read'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Hello, {userItNumber}</h1>
              <p className="text-sm text-slate-500">Your bookings, requests, and status updates at a glance.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              Book Now
            </button>
          </div>

          {isBookingsLoading ? <p className="mt-4 text-sm text-slate-500">Loading your bookings...</p> : null}
          {bookingMessage ? <p className="mt-4 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{bookingMessage}</p> : null}
          {bookingError ? <p className="mt-4 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{bookingError}</p> : null}

          {unreadNotificationCount > 0 && bookingUpdatesEnabled ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-bold text-emerald-800">Booking Approved Notification</p>
              <p className="text-sm text-emerald-700">You have {unreadNotificationCount} unread booking update{unreadNotificationCount === 1 ? '' : 's'}.</p>
            </div>
          ) : null}

          {activeSection === 'My Bookings' ? (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-lg font-black text-slate-900">My Bookings</h2>
              {bookings.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No bookings yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {bookings.slice(0, 8).map((booking) => (
                    <div key={booking.id} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{booking.resourceName}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${booking.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : booking.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : booking.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{booking.bookingDate} | {booking.startTime} - {booking.endTime}</p>
                      <p className="mt-1 text-sm text-slate-700">{booking.purpose}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartBookingEdit(booking)}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBooking(booking.id)}
                          disabled={isBookingActionLoading}
                          className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>

                      {editingBookingId === booking.id && editBookingForm ? (
                        <div className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                          <input
                            type="date"
                            name="bookingDate"
                            value={editBookingForm.bookingDate}
                            onChange={handleEditBookingFieldChange}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="time"
                              name="startTime"
                              value={editBookingForm.startTime}
                              onChange={handleEditBookingFieldChange}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                            <input
                              type="time"
                              name="endTime"
                              value={editBookingForm.endTime}
                              onChange={handleEditBookingFieldChange}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                          </div>
                          <textarea
                            rows={2}
                            name="purpose"
                            value={editBookingForm.purpose}
                            onChange={handleEditBookingFieldChange}
                            className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                          <div className="sm:col-span-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveBookingEdit(booking.id)}
                              disabled={isBookingActionLoading}
                              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelBookingEdit}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {activeSection === 'My Requests' ? (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-lg font-black text-slate-900">My Requests (Pending)</h2>
              {pendingRequests.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No pending requests.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {pendingRequests.slice(0, 6).map((booking) => (
                    <div key={booking.id} className="rounded-xl border border-amber-200 bg-white px-3 py-2">
                      <p className="font-semibold text-slate-900">{booking.resourceName}</p>
                      <p className="text-sm text-slate-600">{booking.bookingDate} | {booking.startTime} - {booking.endTime}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {activeSection === 'Notifications' ? (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-lg font-black text-slate-900">My Notifications</h2>
              {bookingNotifications.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No booking approval notifications yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {bookingNotifications.map((notification) => (
                    <div key={notification.id} className={`rounded-xl border px-3 py-2 ${notification.read ? 'border-slate-200 bg-slate-50' : 'border-emerald-200 bg-white'}`}>
                      <p className={`text-sm font-bold ${notification.read ? 'text-slate-800' : 'text-emerald-800'}`}>{notification.title}</p>
                      <p className="text-sm text-slate-700">{notification.detail}</p>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => handleMarkNotificationRead(notification.id)}
                          disabled={notification.read}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {notification.read ? 'Read' : 'Mark as read'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {activeSection === 'Notifications' ? (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Notification Preferences</h2>
                  <p className="text-sm text-slate-500">Enable or disable categories for your account notifications.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveNotificationPreferences}
                  disabled={isNotificationSaving || isNotificationLoading}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isNotificationSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>

              {notificationStatus ? <p className="mt-3 text-sm text-slate-700">{notificationStatus}</p> : null}

              {isNotificationLoading ? (
                <p className="mt-3 text-sm text-slate-500">Loading notification preferences...</p>
              ) : (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {Object.keys(notificationCategoryLabels).map((category) => {
                    const isEnabled = Boolean(notificationPreferences[category])
                    return (
                      <label key={category} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                        <span className="text-sm font-semibold text-slate-700">{notificationCategoryLabels[category]}</span>
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
            </section>
          ) : null}

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            {taskCards.map((card) => (
              <article key={card.title} className={`${card.color} rounded-2xl p-5 text-white`}>
                <h3 className="text-xl font-extrabold leading-tight">{card.title}</h3>
                <p className="mt-4 text-sm opacity-90">{card.items}</p>
                <div className="mt-3 h-2 rounded-full bg-white/30">
                  <div className={`${card.accent} h-2 rounded-full`} style={{ width: card.progress }}></div>
                </div>
                <p className="mt-2 text-xs font-semibold opacity-90">{card.progress}</p>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="mb-4 text-2xl font-black text-slate-900">Recent activity</h2>
              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">No activity yet. Create a booking to start tracking updates.</p>
                  </div>
                ) : recentActivities.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <span className={`${task.color} mt-1 h-3 w-3 rounded-full`}></span>
                      <div>
                        <p className="font-bold text-slate-900">{task.name}</p>
                        <p className="text-sm text-slate-500">{task.detail}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">Tracked</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-black text-slate-900">Summary</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-3xl font-black text-slate-900">{pendingRequests.length}</p>
                  <p className="text-sm text-slate-500">Pending requests</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-3xl font-black text-slate-900">{approvedBookings.length}</p>
                  <p className="text-sm text-slate-500">Approved bookings</p>
                </div>
                <div className="col-span-2 rounded-2xl bg-slate-900 p-4 text-white">
                  <p className="text-sm uppercase tracking-wide text-slate-300">Live Status</p>
                  <p className="mt-2 text-lg font-bold">Total: {bookings.length} | Rejected: {rejectedBookings.length}</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Last synced: {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString() : 'Waiting for data'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <img src={logo} alt="EduTrack logo" className="h-6 w-6 rounded object-cover" />
                <span className="font-semibold">EduTrack Smart Campus</span>
                <span>Copyright {new Date().getFullYear()}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <span className="font-medium">Status: Operational</span>
                <span>Version 1.0</span>
              </div>
            </div>
          </footer>
        </main>

        <aside className="overflow-auto rounded-[1.5rem] border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-black text-slate-900">Calendar</h2>
          <p className="mt-1 text-sm text-slate-500">Upcoming bookings</p>
          <div className="mt-6 space-y-4">
            {calendarItems.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming bookings.</p>
            ) : calendarItems.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-lg font-black text-slate-900">{entry.time}</p>
                <p className="text-sm font-semibold text-slate-800">{entry.title}</p>
                <p className="text-xs text-slate-500">{entry.subtitle}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Dashboard
