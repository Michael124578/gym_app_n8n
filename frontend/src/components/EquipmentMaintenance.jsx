import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Wrench, AlertTriangle, CheckCircle2, Clock, QrCode, Plus } from 'lucide-react'

export default function EquipmentMaintenance({ userRole }) {
  const [tickets, setTickets] = useState([])
  const [equipmentList, setEquipmentList] = useState([])
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [issue, setIssue] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchEquipmentAndTickets()
  }, [])

  const fetchEquipmentAndTickets = async () => {
    const { data: eq } = await supabase.from('equipment').select('*').order('name')
    if (eq) setEquipmentList(eq)

    const { data: t } = await supabase
      .from('maintenance_tickets')
      .select('*, equipment(name, location_zone)')
      .order('created_at', { ascending: false })
    if (t) setTickets(t)
  }

  const handleReportIssue = async (e) => {
    e.preventDefault()
    if (!selectedEquipment) return
    setSubmitting(true)

    const { error } = await supabase.from('maintenance_tickets').insert([
      {
        equipment_id: selectedEquipment.id,
        issue_description: issue,
        severity
      }
    ])

    if (!error) {
      await supabase
        .from('equipment')
        .update({ status: 'needs_repair' })
        .eq('id', selectedEquipment.id)

      setSuccessMsg(`Ticket created for ${selectedEquipment.name}!`)
      setIssue('')
      setSelectedEquipment(null)
      fetchEquipmentAndTickets()
      setTimeout(() => setSuccessMsg(''), 4000)
    }
    setSubmitting(false)
  }

  const handleUpdateTicketStatus = async (ticketId, equipmentId, newStatus) => {
    await supabase
      .from('maintenance_tickets')
      .update({
        status: newStatus,
        resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
      })
      .eq('id', ticketId)

    if (newStatus === 'resolved') {
      await supabase
        .from('equipment')
        .update({ status: 'operational' })
        .eq('id', equipmentId)
    }

    fetchEquipmentAndTickets()
  }

  return (
    <div className="space-y-6">
      {/* SUCCESS TOAST */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center space-x-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* REPORT ISSUE CARD */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Report Broken Gym Equipment</h3>
            <p className="text-xs text-slate-400">Select machine or report via machine QR tag</p>
          </div>
        </div>

        <form onSubmit={handleReportIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Select Machine</label>
            <select
              value={selectedEquipment?.id || ''}
              onChange={(e) => {
                const item = equipmentList.find(i => i.id === e.target.value)
                setSelectedEquipment(item || null)
              }}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Choose Equipment --</option>
              {equipmentList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.location_zone}) - [{item.status.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="low">Low (Cosmetic/Minor)</option>
                <option value="medium">Medium (Partially Usable)</option>
                <option value="high">High (Unusable)</option>
                <option value="urgent">Urgent (Safety Hazard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Issue Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Snap cable frayed on left pulley"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-amber-600/20 flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{submitting ? 'Dispatching Ticket...' : 'Submit Repair Ticket'}</span>
          </button>
        </form>
      </div>

      {/* STAFF MAINTENANCE QUEUE */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Clock className="h-4 w-4 text-indigo-400" />
          <span>Active Maintenance Tickets Queue ({tickets.filter(t => t.status !== 'resolved').length})</span>
        </h3>

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">All machinery is operational!</p>
          ) : (
            tickets.map((t) => (
              <div key={t.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{t.equipment?.name || 'Equipment'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.severity === 'urgent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      t.severity === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{t.issue_description}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Logged: {new Date(t.created_at).toLocaleString()}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {t.status !== 'resolved' ? (
                    <button
                      onClick={() => handleUpdateTicketStatus(t.id, t.equipment_id, 'resolved')}
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold rounded-xl transition"
                    >
                      Mark Fixed
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}