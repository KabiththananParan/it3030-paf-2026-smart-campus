import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/edutrack.png'

const API_BASE_URL = 'http://localhost:8080'

const resources = [
  { id: 101, name: 'Innovation Lab A', type: 'Computer Lab', capacity: 40, zone: 'Engineering Block', accent: 'from-teal-500 to-cyan-500' },
  { id: 102, name: 'Seminar Hall C1', type: 'Lecture Hall', capacity: 120, zone: 'Main Auditorium Wing', accent: 'from-amber-500 to-orange-500' },
  { id: 103, name: 'Studio Room S2', type: 'Media Studio', capacity: 18, zone: 'Digital Media Center', accent: 'from-slate-700 to-slate-500' },
  { id: 104, name: 'Research Pod R4', type: 'Discussion Room', capacity: 10, zone: 'Library Annex', accent: 'from-emerald-500 to-teal-600' },
]

const demoBookings = [
  {
    id: 7001,
    resourceId: 101,
    bookingDate: '2026-04-10',
    startTime: '09:00',
    endTime: '11:00',
    purpose: 'Database lab rehearsal',
    expectedAttendees: 32,
    status: 'APPROVED',
    createdAt: '2026-04-08T08:15:00',
  },
  {
    id: 7002,
    resourceId: 102,
    bookingDate: '2026-04-12',
    startTime: '13:00',
    endTime: '15:30',
    purpose: 'Final-year proposal review',
    expectedAttendees: 58,
    status: 'PENDING',
    createdAt: '2026-04-08T09:10:00',
  },
  {
    id: 7003,
    resourceId: 104,
    bookingDate: '2026-04-14',
    startTime: '10:30',
    endTime: '12:00',
    purpose: 'Project mentor sync',
    expectedAttendees: 8,
    status: 'CANCELLED',
    cancelReason: 'Faculty timetable moved to next week',
    createdAt: '2026-04-07T14:20:00',
  },
]

const initialForm = {
  resourceId: String(resources[0].id),
  bookingDate: '',
  startTime: '09:00',
  endTime: '11:00',
  purpose: '',
  expectedAttendees: '10',
}

const statusStyles = {
  APPROVED: 'bg-emerald-100 text-emerald-800',
  PENDING: 'bg-amber-100 text-amber-800',
  REJECTED: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-slate-200 text-slate-700',
}

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const formatTime = (value) =>
  new Date(`2026-01-01T${value}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const getResourceById = (resourceId) =>
  resources.find((resource) => resource.id === Number(resourceId)) || resources[0]

const Booking = () => {
  const navigate = useNavigate()
  const savedUser = localStorage.getItem('auth_user')
  const [formData, setFormData] = useState(initialForm)
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingMode, setLoadingMode] = useState('preview')

  if (!savedUser) {
    return <Navigate to="/login" replace />
  }

  const user = JSON.parse(savedUser)
  const userId = user.id || user.userId || null
  const userItNumber = user.itNumber || user.itNo || localStorage.getItem('auth_it_number') || 'IT Number'
  const selectedResource = getResourceById(formData.resourceId)

  const pendingCount = bookings.filter((booking) => booking.status === 'PENDING').length
  const approvedCount = bookings.filter((booking) => booking.status === 'APPROVED').length
  const nextBooking = [...bookings]
    .filter((booking) => booking.status === 'PENDING' || booking.status === 'APPROVED')
    .sort((a, b) => new Date(`${a.bookingDate}T${a.startTime}`) - new Date(`${b.bookingDate}T${b.startTime}`))[0]

  const resetMessages = () => {
    setFormMessage('')
    setFormError('')
  }

  useEffect(() => {
    let ignore = false

    const loadBookings = async () => {
      if (!userId) {
        setBookings(demoBookings)
        setLoadingMode('preview')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/bookings/my?userId=${userId}`)
        if (!response.ok) {
          throw new Error('Booking data is not available yet.')
        }

        const data = await response.json()
        if (!ignore) {
          setBookings(data)
          setLoadingMode('live')
        }
      } catch {
        if (!ignore) {
          setBookings(demoBookings)
          setLoadingMode('preview')
          setFormError('Live booking data is unavailable right now. Showing a UI preview with sample records.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadBookings()

    return () => {
      ignore = true
    }
  }, [userId])

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    navigate('/login')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
    resetMessages()
  }

  const validateForm = () => {
    if (!formData.bookingDate) {
      return 'Select a booking date.'
    }

    if (!formData.purpose.trim()) {
      return 'Add a purpose for the booking.'
    }

    if (!formData.expectedAttendees || Number(formData.expectedAttendees) < 1) {
      return 'Expected attendees should be at least 1.'
    }

    if (formData.startTime >= formData.endTime) {
      return 'End time must be later than start time.'
    }

    return ''
  }

  const buildPayload = () => ({
    resourceId: Number(formData.resourceId),
    bookingDate: formData.bookingDate,
    startTime: formData.startTime,
    endTime: formData.endTime,
    purpose: formData.purpose.trim(),
    expectedAttendees: Number(formData.expectedAttendees),
  })

  const prependBooking = (booking) => {
    setBookings((current) => [booking, ...current])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    resetMessages()

    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    const payload = buildPayload()
    setIsSubmitting(true)

    if (!userId || loadingMode === 'preview') {
      prependBooking({
        id: Date.now(),
        ...payload,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      })
      setFormMessage('Booking request added to preview mode. Connect the backend user flow to submit live requests.')
      setFormData({
        ...initialForm,
        bookingDate: formData.bookingDate,
      })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bookings?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        const message = typeof data.message === 'string' ? data.message : 'Unable to create booking.'
        setFormError(message)
        return
      }

      prependBooking(data)
      setFormMessage('Booking request submitted successfully.')
      setFormData({
        ...initialForm,
        bookingDate: formData.bookingDate,
      })
    } catch {
      setFormError('Unable to connect to the booking service right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async (bookingId) => {
    resetMessages()

    if (!userId || loadingMode === 'preview') {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: 'CANCELLED', cancelReason: 'Cancelled from preview mode.' }
            : booking,
        ),
      )
      setFormMessage('Booking marked as cancelled in preview mode.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel?userId=${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Cancelled by requester from booking page.',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        const message = typeof data.message === 'string' ? data.message : 'Unable to cancel booking.'
        setFormError(message)
        return
      }

      setBookings((current) => current.map((booking) => (booking.id === bookingId ? data : booking)))
      setFormMessage('Booking cancelled successfully.')
    } catch {
      setFormError('Unable to connect to the booking service right now.')
    }
  }

  const handleResourceSelect = (resourceId) => {
    const resource = getResourceById(resourceId)
    setFormData((current) => ({
      ...current,
      resourceId: String(resource.id),
      expectedAttendees: String(Math.min(Number(current.expectedAttendees || 1), resource.capacity)),
    }))
    resetMessages()
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ee_0%,#eef4f4_46%,#f6f8fb_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduTrack logo" className="h-11 w-11 rounded-2xl object-cover shadow-sm" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">EduTrack Smart Campus</p>
              <h1 className="mt-1 text-xl font-black text-slate-950">Booking Center</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
              {user.fullName || 'Student User'} · {userItNumber}
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#103b38_46%,#0f766e_100%)] px-6 py-7 text-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] sm:px-8 sm:py-9">
          <div className="absolute -right-10 top-0 h-52 w-52 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl"></div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.32em] text-teal-100">Standalone Booking Workspace</p>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                Reserve rooms, labs, and study spaces through a page built only for bookings.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-teal-50/90 sm:text-base">
                Pick a space, lock in the time window, and manage your requests without the dashboard layout getting in the way.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-teal-100">Pending</p>
                <p className="mt-2 text-3xl font-black">{pendingCount}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-teal-100">Approved</p>
                <p className="mt-2 text-3xl font-black">{approvedCount}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-teal-100">Mode</p>
                <p className="mt-2 text-2xl font-black">{loadingMode === 'live' ? 'Live API' : 'Preview UI'}</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 grid gap-4 border-t border-white/15 pt-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-teal-100">Next active booking</p>
              <p className="mt-2 text-xl font-bold text-white">
                {nextBooking
                  ? `${getResourceById(nextBooking.resourceId).name} on ${formatDate(nextBooking.bookingDate)}`
                  : 'No active bookings scheduled yet'}
              </p>
            </div>
            <div className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-teal-50">
              {nextBooking ? `${formatTime(nextBooking.startTime)} to ${formatTime(nextBooking.endTime)}` : 'Select a space and create a request'}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Request Form</p>
                  <h3 className="mt-2 text-3xl font-black text-slate-950">Create a new booking request</h3>
                </div>
                <p className="text-sm text-slate-500">Capacity updates when you switch the selected space</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2" noValidate>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Resource</span>
                  <select
                    name="resourceId"
                    value={formData.resourceId}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-teal-200 transition focus:bg-white focus:ring-4"
                  >
                    {resources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name} · {resource.type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Booking date</span>
                  <input
                    type="date"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-teal-200 transition focus:bg-white focus:ring-4"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Start time</span>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-teal-200 transition focus:bg-white focus:ring-4"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">End time</span>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-teal-200 transition focus:bg-white focus:ring-4"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Purpose</span>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    rows="4"
                    placeholder="State the class, meeting, lab session, or event activity."
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-teal-200 transition focus:bg-white focus:ring-4"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Expected attendees</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedResource.capacity}
                    name="expectedAttendees"
                    value={formData.expectedAttendees}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-teal-200 transition focus:bg-white focus:ring-4"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                  </button>
                </div>
              </form>

              {formError ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{formError}</p> : null}
              {formMessage ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{formMessage}</p> : null}
            </section>

            <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Request History</p>
                  <h3 className="mt-2 text-3xl font-black text-slate-950">My booking requests</h3>
                </div>
                <p className="text-sm text-slate-500">
                  {loadingMode === 'live' ? 'Connected to backend records' : 'Previewing with sample and local session records'}
                </p>
              </div>

              {isLoading ? (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                  Loading booking activity...
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {bookings.map((booking) => {
                    const resource = getResourceById(booking.resourceId)
                    const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED'

                    return (
                      <article
                        key={booking.id}
                        className="grid gap-4 rounded-[1.6rem] border border-slate-200 bg-slate-50/60 px-5 py-4 transition hover:border-slate-300 hover:bg-white lg:grid-cols-[1.1fr_0.9fr_auto]"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-lg font-black text-slate-900">{resource.name}</h4>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[booking.status] || statusStyles.CANCELLED}`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">{booking.purpose}</p>
                          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                            Created {booking.createdAt ? formatDateTime(booking.createdAt) : 'just now'}
                          </p>
                        </div>

                        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-1">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Schedule</p>
                            <p className="mt-1 font-semibold text-slate-900">
                              {formatDate(booking.bookingDate)} · {formatTime(booking.startTime)} to {formatTime(booking.endTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Attendance</p>
                            <p className="mt-1 font-semibold text-slate-900">{booking.expectedAttendees} attendees</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                          {booking.cancelReason ? (
                            <p className="max-w-[220px] text-right text-xs text-slate-500">{booking.cancelReason}</p>
                          ) : (
                            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{resource.type}</span>
                          )}

                          {canCancel ? (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                            >
                              Cancel Request
                            </button>
                          ) : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className={`overflow-hidden rounded-[1.8rem] bg-gradient-to-br ${selectedResource.accent} p-6 text-white shadow-[0_18px_60px_rgba(15,23,42,0.12)]`}>
              <p className="text-xs uppercase tracking-[0.24em] text-white/75">Selected resource</p>
              <h3 className="mt-3 text-3xl font-black">{selectedResource.name}</h3>
              <p className="mt-2 text-sm text-white/85">{selectedResource.type}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/12 p-4">
                  <p className="text-white/70">Capacity</p>
                  <p className="mt-1 text-2xl font-bold">{selectedResource.capacity}</p>
                </div>
                <div className="rounded-2xl bg-white/12 p-4">
                  <p className="text-white/70">Zone</p>
                  <p className="mt-1 text-base font-bold leading-tight">{selectedResource.zone}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Available spaces</p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">Choose a resource</h3>
              <div className="mt-5 space-y-3">
                {resources.map((resource) => (
                  <button
                    key={resource.id}
                    onClick={() => handleResourceSelect(resource.id)}
                    className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                      Number(formData.resourceId) === resource.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{resource.name}</p>
                        <p className={`mt-1 text-sm ${Number(formData.resourceId) === resource.id ? 'text-slate-200' : 'text-slate-500'}`}>
                          {resource.type}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${Number(formData.resourceId) === resource.id ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {resource.capacity}
                      </span>
                    </div>
                    <p className={`mt-3 text-xs uppercase tracking-[0.18em] ${Number(formData.resourceId) === resource.id ? 'text-slate-300' : 'text-slate-400'}`}>
                      {resource.zone}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Booking guidance</p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">Before you submit</h3>
              <div className="mt-5 space-y-4">
                {[
                  'Requests remain editable only while the status is pending.',
                  'Approved and pending bookings block overlapping time windows for the same space.',
                  'Use a clear academic or operational purpose to speed up review.',
                ].map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      0{index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-relaxed text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default Booking
