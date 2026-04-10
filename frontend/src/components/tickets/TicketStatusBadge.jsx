const statusClasses = {
  OPEN: 'bg-sky-100 text-sky-700 border-sky-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-200',
  AWAITING_FOR_REPLY: 'bg-orange-100 text-orange-800 border-orange-200',
  RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-200 text-slate-700 border-slate-300',
  REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
}

const formatStatusLabel = (status) => String(status || '').replaceAll('_', ' ')

const TicketStatusBadge = ({ status }) => {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusClasses[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {formatStatusLabel(status)}
    </span>
  )
}

export default TicketStatusBadge