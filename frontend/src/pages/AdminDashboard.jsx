import { Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import logo from '../assets/edutrack.png'
import { getAuthUser } from '../auth/roles.js'

const adminKpis = [
  { label: 'Pending approvals', value: '31', note: '+6 from yesterday' },
  { label: 'Open incidents', value: '22', note: '5 high priority' },
  { label: 'Assets in service', value: '1,284', note: '97% operational' },
  { label: 'Teams on shift', value: '12', note: 'Across 4 faculties' },
]

const approvalQueue = [
  { title: 'Main Hall A booking', owner: 'Faculty of Engineering', status: 'Needs approval' },
  { title: 'Lab C2 equipment request', owner: 'School of Computing', status: 'Awaiting budget check' },
  { title: 'Emergency AC maintenance', owner: 'Facilities Office', status: 'Escalated' },
]


// Admin Dashboard

const AdminDashboard = () => {
  const navigate = useNavigate()
  const user = getAuthUser()
  const [formData, setFormData] = useState({
    fullName: '',
    itNumber: '',
    email: '',
    password: '',
    role: 'TECHNICIAN',
  })
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
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

  const handleCreateAccount = async (event) => {
    event.preventDefault()
    setStatusMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:8080/api/auth/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          itNumber: formData.itNumber.trim().toUpperCase(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setStatusMessage(data.message || 'Account creation failed.')
        return
      }

      setStatusMessage(`${data.role} account created for ${data.email}`)
      setFormData({
        fullName: '',
        itNumber: '',
        email: '',
        password: '',
        role: 'TECHNICIAN',
      })
    } catch {
      setStatusMessage('Cannot connect to server. Please start backend and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e9f1ee] p-3 sm:p-5">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-xl sm:p-7">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduTrack logo" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin Control Room</p>
              <h1 className="text-2xl font-black text-slate-900">Campus Operations Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">ADMIN</span>
            <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Logout
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {adminKpis.map((kpi) => (
            <article key={kpi.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{kpi.label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{kpi.value}</p>
              <p className="mt-1 text-sm text-slate-500">{kpi.note}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 p-5">
            <h2 className="text-xl font-black text-slate-900">Approval Queue</h2>
            <div className="mt-4 space-y-3">
              {approvalQueue.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.owner}</p>
                  <p className="mt-1 inline-flex rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">{item.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-700 p-5 text-white">
            <h2 className="text-xl font-black">Admin Summary</h2>
            <p className="mt-3 text-sm text-emerald-100">
              You are signed in as {user.fullName || 'Administrator'} ({user.email}).
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <p>1. Review pending booking approvals.</p>
              <p>2. Prioritize escalated maintenance incidents.</p>
              <p>3. Track technician team utilization.</p>
            </div>
            <button className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
              Open Admin Actions
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">Create Staff Account</h2>
              <p className="text-sm text-slate-500">Admin can create MANAGER or TECHNICIAN accounts here.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">No USER signup here</span>
          </div>

          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreateAccount}>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-100"
              required
            />
            <input
              name="itNumber"
              value={formData.itNumber}
              onChange={handleChange}
              placeholder="IT23608054"
              maxLength={10}
              className="rounded-xl border border-slate-200 px-4 py-3 uppercase outline-none focus:ring-4 focus:ring-emerald-100"
              required
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="staff@smartcampus.com"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-100"
              required
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Temporary password"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-100"
              required
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-100"
            >
              <option value="TECHNICIAN">TECHNICIAN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white disabled:opacity-60"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          {statusMessage ? <p className="mt-3 text-sm text-slate-600">{statusMessage}</p> : null}
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard