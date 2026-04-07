import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { approveBooking, getBookings, rejectBooking } from '../api/bookingApi.js'

const BookingApprovalPage = () => {
  const savedUser = localStorage.getItem('auth_user')
  const [pendingBookings, setPendingBookings] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const user = useMemo(() => (savedUser ? JSON.parse(savedUser) : null), [savedUser])
  const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN'

  const loadPending = useCallback(async () => {
    if (!isAdmin) {
      return
    }

    try {
      const data = await getBookings({ status: 'PENDING' })
      setPendingBookings(data)
    } catch (loadError) {
      setError(loadError.message)
    }
  }, [isAdmin])

  useMemo(() => {
    if (isAdmin) {
      void loadPending()
    }
  }, [isAdmin, loadPending])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/bookings/my" replace />
  }

  const onApprove = async (id) => {
    const note = window.prompt('Approval note (optional)') || ''
    try {
      await approveBooking(id, note)
      setMessage('Booking approved.')
      loadPending()
    } catch (approveError) {
      setError(approveError.message)
    }
  }

  const onReject = async (id) => {
    const note = window.prompt('Rejection reason (optional)') || ''
    try {
      await rejectBooking(id, note)
      setMessage('Booking rejected.')
      loadPending()
    } catch (rejectError) {
      setError(rejectError.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900">Booking Approval (Admin)</h1>
          <div className="flex gap-2 text-sm">
            <Link to="/bookings/calendar" className="rounded-lg border border-slate-300 px-3 py-1.5">Calendar</Link>
            <Link to="/dashboard" className="rounded-lg border border-slate-300 px-3 py-1.5">Dashboard</Link>
          </div>
        </div>

        {message ? <p className="mb-3 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mb-3 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <div className="space-y-3">
          {pendingBookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-slate-200 p-4">
              <p className="font-bold text-slate-900">{booking.resourceName}</p>
              <p className="text-sm text-slate-600">{booking.bookingDate} | {booking.startTime} - {booking.endTime}</p>
              <p className="text-sm text-slate-700">{booking.purpose}</p>
              <p className="text-xs text-slate-500">{booking.requesterName} ({booking.requesterItNumber})</p>

              <div className="mt-3 flex gap-2">
                <button onClick={() => onApprove(booking.id)} className="rounded-lg border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-700">Approve</button>
                <button onClick={() => onReject(booking.id)} className="rounded-lg border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-700">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BookingApprovalPage
