import { Link } from 'react-router-dom'
import logo from '../assets/edutrack.png'

const highlights = [
  {
    title: 'Facility and Asset Booking',
    description: 'Book lecture halls, labs, and equipment with clear approval flow and live availability.',
  },
  {
    title: 'Maintenance and Incident Handling',
    description: 'Report faults, track technician updates, and close issues with accountable resolution notes.',
  },
  {
    title: 'Role-Based and Auditable',
    description: 'Students, staff, admins, and technicians all work through one transparent workflow history.',
  },
]

const workflow = [
  {
    title: 'Choose a resource',
    description: 'Browse rooms, labs, and equipment with capacity, zone, and live booking context.',
  },
  {
    title: 'Submit a request',
    description: 'Send a booking with date, time, attendees, and purpose in one clean form.',
  },
  {
    title: 'Track the result',
    description: 'Watch approval status, notifications, and your request history from the dashboard.',
  },
]

const platformStats = [
  { label: 'Spaces tracked', value: '120+' },
  { label: 'Approval workflows', value: '24/7' },
  { label: 'Audit records', value: '100%' },
  { label: 'User roles', value: '4+' },
]

const footerColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'Bookings', to: '/bookings' },
      { label: 'Maintenance', to: '/dashboard' },
      { label: 'Notifications', to: '/dashboard' },
      { label: 'Resources', to: '/resources' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', to: '/login' },
      { label: 'System Status', to: '/dashboard' },
      { label: 'Contact Admin', to: '/dashboard' },
      { label: 'Privacy', to: '/forgot-password' },
    ],
  },
  {
    title: 'Access',
    links: [
      { label: 'Login', to: '/login' },
      { label: 'Sign Up', to: '/signup' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Resources', to: '/resources' },
    ],
  },
]

const Home = () => {
  return (
    <div className="min-h-screen bg-[#f4efe9] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EduTrack logo" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <h1 className="text-xl font-black">EduTrack</h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Smart Campus Platform</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100">
              Login
            </Link>
            <Link to="/signup" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-200/60 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-orange-200/60 blur-3xl"></div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                University Operations Hub
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                One Platform for Booking, Maintenance, and Campus Service Visibility
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
                Modernize daily operations with a single web platform built for room and lab reservations,
                equipment allocation, issue reporting, technician collaboration, and resolution tracking.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup" className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600">
                  Create Account
                </Link>
                <Link to="/login" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  Access Portal
                </Link>
                <Link to="/dashboard" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  View Dashboard
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-2xl bg-slate-900 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Today</p>
                <p className="mt-2 text-3xl font-black">426</p>
                <p className="text-sm text-slate-300">Total booking requests</p>
              </article>
              <article className="rounded-2xl bg-cyan-500 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Maintenance</p>
                <p className="mt-2 text-3xl font-black">38</p>
                <p className="text-sm text-cyan-100">Open incidents under review</p>
              </article>
              <article className="rounded-2xl bg-violet-700 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Auditability</p>
                <p className="mt-2 text-sm leading-relaxed text-violet-100">
                  Every status change is recorded with actor, timestamp, and resolution context.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">How it works</p>
              <h3 className="mt-2 text-3xl font-black text-slate-950">A simple path from request to approval</h3>
            </div>
            <Link to="/resources" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Explore Resources
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {workflow.map((item, index) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  0{index + 1}
                </div>
                <h4 className="mt-4 text-lg font-black text-slate-900">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {platformStats.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-black text-slate-950">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-4 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 py-6 md:grid-cols-[1.3fr_0.7fr] lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="EduTrack logo" className="h-10 w-10 rounded-xl object-cover" />
              <div>
                <h4 className="text-lg font-black text-slate-900">EduTrack Smart Campus</h4>
                <p className="text-sm text-slate-500">Bookings, maintenance, and operations in one place.</p>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
              Designed for students, staff, admins, and technicians to manage requests, approvals, notifications, and service updates with one auditable workflow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title} className="flex flex-col">
                <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">{column.title}</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-500">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="hover:text-slate-900 hover:underline">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <p>EduTrack Smart Campus</p>
          <p>Unified bookings and maintenance workflow platform</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
