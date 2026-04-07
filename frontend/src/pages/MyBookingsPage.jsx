import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { cancelBooking, getMyBookings, updateBooking } from '../api/bookingApi.js'

const MyBookingsPage = () => {
  const savedUser = localStorage.getItem('auth_user')
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const user = useMemo(() => (savedUser ? JSON.parse(savedUser) : null), [savedUser])

  const loadBookings = useCallback(async () => {
    if (!user) {
      return
    }

    try {
      const data = await getMyBookings(user.email)
      setBookings(data)
    } catch (loadError) {
      setError(loadError.message)
    }
  }, [user])

  useMemo(() => {
    if (user) {
      void loadBookings()
    }
  }, [loadBookings, user])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const onCancel = async (id) => {
    setError('')
    setMessage('')
    try {
      await cancelBooking(id, user.email)
      setMessage('Booking cancelled successfully.')
      loadBookings()
    } catch (cancelError) {
      setError(cancelError.message)
    }
  }

  const onUpdate = async (booking) => {
    const purpose = window.prompt('Update purpose', booking.purpose)
    if (!purpose) {
      return
    }

    try {
      await updateBooking(booking.id, user.email, {
        resourceType: booking.resourceType,
        resourceName: booking.resourceName,
        purpose,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
      })
      setMessage('Booking updated successfully.')
      loadBookings()
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900">My Bookings</h1>
          <div className="flex gap-2 text-sm">
            <Link to="/bookings/form" className="rounded-lg border border-slate-300 px-3 py-1.5">New Booking</Link>
            <Link to="/bookings/calendar" className="rounded-lg border border-slate-300 px-3 py-1.5">Calendar</Link>
            <Link to="/dashboard" className="rounded-lg border border-slate-300 px-3 py-1.5">Dashboard</Link>
          </div>
        </div>

        {message ? <p className="mb-3 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mb-3 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-slate-200 p-4">
              <p className="font-bold text-slate-900">{booking.resourceName} <span className="ml-2 text-xs font-semibold text-slate-500">{booking.status}</span></p>
              <p className="text-sm text-slate-600">{booking.bookingDate} | {booking.startTime} - {booking.endTime}</p>
              <p className="text-sm text-slate-700">{booking.purpose}</p>

              <div className="mt-3 flex gap-2">
                {booking.status === 'PENDING' ? (
                  <button onClick={() => onUpdate(booking)} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold">Update</button>
                ) : null}
                {(booking.status === 'PENDING' || booking.status === 'APPROVED') ? (
                  <button onClick={() => onCancel(booking.id)} className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700">Cancel</button>
                ) : null}
                {booking.status === 'APPROVED' && booking.qrToken ? (
                  <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">QR Token: {booking.qrToken.slice(0, 8)}...</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyBookingsPage
