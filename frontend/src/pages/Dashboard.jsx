import { Navigate, useNavigate } from 'react-router-dom'
import logo from '../assets/edutrack.png'

const taskCards = [
  { title: 'Room Booking Queue', items: '14 requests', progress: '92%', color: 'bg-violet-700', accent: 'bg-violet-200' },
  { title: 'Lab Equipment Requests', items: '8 requests', progress: '61%', color: 'bg-cyan-500', accent: 'bg-cyan-200' },
  { title: 'Incident Resolution Sprint', items: '22 tickets', progress: '73%', color: 'bg-orange-500', accent: 'bg-orange-200' },
]

const todayTasks = [
  { name: 'Projector fault - Hall A3', detail: 'Assigned to technician', color: 'bg-orange-500' },
  { name: 'Computer Lab B booking', detail: 'Pending admin approval', color: 'bg-violet-700' },
  { name: 'Mic set replacement', detail: 'Resolved and closed', color: 'bg-cyan-500' },
]

const calendarItems = [
  { time: '10:00', title: 'Lab C2 Inspection', subtitle: 'Maintenance' },
  { time: '13:20', title: 'Room 402 Booking', subtitle: 'Faculty Request' },
  { time: '15:00', title: 'Asset Audit Update', subtitle: 'Admin Workflow' },
]

const Dashboard = () => {
  const navigate = useNavigate()
  const savedUser = localStorage.getItem('auth_user')

  if (!savedUser) {
    return <Navigate to="/login" replace />
  }

  const user = JSON.parse(savedUser)
  const userItNumber = user.itNumber || user.itNo || localStorage.getItem('auth_it_number') || 'IT Number'

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
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">Smart Campus</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-cyan-100 to-violet-100 p-4">
            <p className="text-xs uppercase text-slate-500">Logged in as</p>
            <p className="mt-1 text-[1.85rem] font-bold leading-tight text-slate-900 break-words">{user.fullName || 'Student User'}</p>
            <p className="text-sm text-slate-600 break-all">{user.email}</p>
            <p className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">{user.role || 'STUDENT'}</p>
          </div>

          <nav className="mt-8 space-y-2 text-sm font-semibold text-slate-600">
            <button className="w-full rounded-xl bg-slate-900 px-4 py-3 text-left text-white">Dashboard</button>
            <button className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">Bookings</button>
            <button className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">Incidents</button>
            <button className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">Assets</button>
            <button className="w-full rounded-xl px-4 py-3 text-left hover:bg-slate-100">Audit Logs</button>
          </nav>

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
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">Notifications</button>
              <button className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Quick Actions</button>
            </div>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Hello, {userItNumber}</h1>
              <p className="text-sm text-slate-500">Facility bookings and maintenance operations at a glance.</p>
            </div>
            <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Add New Request</button>
          </div>

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
              <h2 className="mb-4 text-2xl font-black text-slate-900">Tasks for today</h2>
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div key={task.name} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <span className={`${task.color} mt-1 h-3 w-3 rounded-full`}></span>
                      <div>
                        <p className="font-bold text-slate-900">{task.name}</p>
                        <p className="text-sm text-slate-500">{task.detail}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">Open</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-black text-slate-900">Statistics</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-3xl font-black text-slate-900">28 h</p>
                  <p className="text-sm text-slate-500">Avg. resolution time</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-3xl font-black text-slate-900">18</p>
                  <p className="text-sm text-slate-500">Closed incidents</p>
                </div>
                <div className="col-span-2 rounded-2xl bg-slate-900 p-4 text-white">
                  <p className="text-sm uppercase tracking-wide text-slate-300">Auditability</p>
                  <p className="mt-2 text-lg font-bold">Every status update is recorded with timestamp and actor.</p>
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
          <p className="mt-1 text-sm text-slate-500">Today</p>
          <div className="mt-6 space-y-4">
            {calendarItems.map((entry) => (
              <div key={`${entry.time}-${entry.title}`} className="rounded-xl border border-slate-200 p-3">
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
