import { Navigate, Route, Routes } from 'react-router-dom'
import BookingApprovalPage from './pages/BookingApprovalPage.jsx'
import BookingCalendarPage from './pages/BookingCalendarPage.jsx'
import BookingFormPage from './pages/BookingFormPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import MyBookingsPage from './pages/MyBookingsPage.jsx'
import SignUp from './pages/SignUp.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/bookings" element={<Navigate to="/bookings/form" replace />} />
      <Route path="/bookings/form" element={<BookingFormPage />} />
      <Route path="/bookings/my" element={<MyBookingsPage />} />
      <Route path="/bookings/approval" element={<BookingApprovalPage />} />
      <Route path="/bookings/calendar" element={<BookingCalendarPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
