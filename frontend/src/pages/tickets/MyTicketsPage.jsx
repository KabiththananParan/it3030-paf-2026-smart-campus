import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyTickets } from '../../api/ticketApi.js'
import TicketStatusBadge from '../../components/tickets/TicketStatusBadge.jsx'

const parseDescriptionMetadata = (description) => {
  const lines = String(description || '').split('\n')
  const map = {}

  lines.forEach((line) => {
    const [rawKey, ...rest] = line.split(':')
    if (!rawKey || rest.length === 0) {
      return
    }

    const key = rawKey.trim().toLowerCase()
    const value = rest.join(':').trim()
    if (value) {
      map[key] = value
    }
  })

  return {
    registrationNumber: map['registration number'] || '-',
    department: map.department || '-',
    campusCenter: map['campus / center'] || '-',
    requestType: map['request / inquiry type'] || '-',
    message: map.message || '-',
  }
}

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await getMyTickets()
        setTickets(data)
      } catch (loadError) {
        setError(loadError.message || 'Unable to load your tickets.')
      } finally {
        setIsLoading(false)
      }
    }

    loadTickets()
  }, [])

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return tickets
    }

    return tickets.filter((ticket) => {
      return [ticket.category, ticket.location, ticket.resourceName, ticket.status, ticket.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [tickets, search])

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/60">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/dashboard"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              to="/tickets/my"
              className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
            >
              My Tickets
            </Link>
            <Link
              to="/tickets/new"
              className="rounded-2xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              New Request
            </Link>
          </div>
          <p className="text-sm font-semibold text-slate-600">My Tickets</p>
        </nav>

        <div className="rounded-4xl bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-400/20">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Maintenance ticketing</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">My tickets</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">Track your open issues and follow the full resolution history.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by category, location, status, or description" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500" />
        </div>

        {isLoading ? <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">Loading tickets...</div> : null}
        {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div> : null}

        {!isLoading && !error && filteredTickets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No tickets found.
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredTickets.map((ticket) => {
            const metadata = parseDescriptionMetadata(ticket.description)
            const titleValue = ticket.category === 'OTHER'
              ? (ticket.title || 'Subject')
              : (metadata.requestType !== '-' ? metadata.requestType : (ticket.title || 'Request / Inquiry type'))

            return (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <TicketStatusBadge status={ticket.status} />
                    <h2 className="mt-3 text-xl font-bold text-slate-950">{titleValue}</h2>
                  </div>
                  <div className="text-right text-xs text-slate-500">#{ticket.id}</div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm text-slate-700">{metadata.message}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Priority: {ticket.priority}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Reg No: {metadata.registrationNumber}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Campus / Center: {metadata.campusCenter}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Department: {metadata.department}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Attachments: {ticket.attachments?.length || 0}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MyTicketsPage