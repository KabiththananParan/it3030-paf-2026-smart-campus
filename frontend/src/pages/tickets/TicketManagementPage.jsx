import { useEffect, useMemo, useState } from 'react'
import { getAllTickets, assignTechnician, updateTicketStatus, addResolutionNotes } from '../../api/ticketApi.js'
import TicketStatusBadge from '../../components/tickets/TicketStatusBadge.jsx'

const TicketManagementPage = () => {
  const [tickets, setTickets] = useState([])
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [technicianEmail, setTechnicianEmail] = useState('')
  const [status, setStatus] = useState('IN_PROGRESS')
  const [rejectionReason, setRejectionReason] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTickets = async () => {
    try {
      const data = await getAllTickets()
      setTickets(data)
      setSelectedTicketId((current) => current || data[0]?.id || null)
    } catch (loadError) {
      setError(loadError.message || 'Unable to load tickets.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const selectedTicket = useMemo(() => tickets.find((ticket) => ticket.id === selectedTicketId) || null, [tickets, selectedTicketId])

  const refreshTicketList = async () => {
    const data = await getAllTickets()
    setTickets(data)
  }

  const handleAssign = async () => {
    try {
      await assignTechnician(selectedTicketId, technicianEmail)
      setMessage('Technician assigned successfully.')
      await refreshTicketList()
    } catch (assignError) {
      setMessage(assignError.message || 'Unable to assign technician.')
    }
  }

  const handleStatusUpdate = async () => {
    try {
      await updateTicketStatus(selectedTicketId, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      })
      setMessage('Status updated successfully.')
      await refreshTicketList()
    } catch (statusError) {
      setMessage(statusError.message || 'Unable to update status.')
    }
  }

  const handleResolutionNotes = async () => {
    try {
      await addResolutionNotes(selectedTicketId, resolutionNotes)
      setMessage('Resolution notes saved.')
      await refreshTicketList()
    } catch (notesError) {
      setMessage(notesError.message || 'Unable to save notes.')
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-slate-100 p-8 text-center">Loading management console...</div>
  }

  if (error) {
    return <div className="min-h-screen bg-slate-100 p-8 text-center text-rose-600">{error}</div>
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">Ticket management</h1>
          <p className="mt-2 text-sm text-slate-600">Assign staff, update workflow state, and log resolution notes.</p>

          <div className="mt-6 space-y-3">
            {tickets.map((ticket) => (
              <button key={ticket.id} onClick={() => setSelectedTicketId(ticket.id)} className={`w-full rounded-2xl border px-4 py-4 text-left transition ${selectedTicketId === ticket.id ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <TicketStatusBadge status={ticket.status} />
                    <p className="mt-2 font-bold text-slate-950">#{ticket.id} {ticket.category}</p>
                    <p className="text-sm text-slate-600">{ticket.resourceName || ticket.location}</p>
                  </div>
                  <span className="text-xs text-slate-400">{ticket.priority}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          {selectedTicket ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <TicketStatusBadge status={selectedTicket.status} />
                  <h2 className="mt-3 text-2xl font-black text-slate-950">Ticket #{selectedTicket.id}</h2>
                  <p className="mt-1 text-sm text-slate-600">{selectedTicket.description}</p>
                </div>
                <div className="text-right text-sm text-slate-500">Assigned: {selectedTicket.assignedTechnicianName || 'None'}</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Technician email
                  <input value={technicianEmail} onChange={(event) => setTechnicianEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
                <button onClick={handleAssign} className="self-end rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Assign technician</button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Update status
                  <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3">
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                {status === 'REJECTED' ? (
                  <label className="block text-sm font-semibold text-slate-700">
                    Rejection reason
                    <input value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
                  </label>
                ) : null}
                <button onClick={handleStatusUpdate} className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white">Save status</button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Resolution notes
                  <textarea value={resolutionNotes} onChange={(event) => setResolutionNotes(event.target.value)} rows="5" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Summarize the fix, parts replaced, testing result, and follow-up steps." />
                </label>
                <button onClick={handleResolutionNotes} className="mt-3 rounded-2xl border border-slate-950 px-4 py-3 text-sm font-bold text-slate-950">Save notes</button>
              </div>

              {message ? <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">{message}</div> : null}
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Select a ticket to manage it.</div>
          )}
        </section>
      </div>
    </div>
  )
}

export default TicketManagementPage