import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Wrench, AlertTriangle, CheckCircle2, Clock, Plus, Trash2, Dumbbell, ShieldAlert, X } from 'lucide-react'

export default function EquipmentMaintenance({ userRole }) {
  const [tickets, setTickets] = useState([])
  const [equipmentList, setEquipmentList] = useState([])
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [issue, setIssue] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Add Equipment Form State (Admin Only)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newEqName, setNewEqName] = useState('')
  const [newEqCategory, setNewEqCategory] = useState('Strength')
  const [newEqZone, setNewEqZone] = useState('Main Floor')
  const [addingEquipment, setAddingEquipment] = useState(false)

  useEffect(() => {
    fetchEquipmentAndTickets()

    // Realtime channel listener for instant maintenance queue sync
    const channel = supabase
      .channel('realtime-maintenance-tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_tickets' }, () => {
        fetchEquipmentAndTickets()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, () => {
        fetchEquipmentAndTickets()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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

  // Admin Registers New Machine
  const handleAddEquipment = async (e) => {
    e.preventDefault()
    if (!newEqName.trim()) return
    setAddingEquipment(true)

    const { error } = await supabase.from('equipment').insert([
      {
        name: newEqName.trim(),
        category: newEqCategory,
        location_zone: newEqZone,
        status: 'operational'
      }
    ])

    if (!error) {
      setSuccessMsg(`Registered ${newEqName.trim()} into gym inventory!`)
      setNewEqName('')
      setIsAddModalOpen(false)
      fetchEquipmentAndTickets()
      setTimeout(() => setSuccessMsg(''), 4000)
    } else {
      setSuccessMsg(`Failed to add machine: ${error.message}`)
    }
    setAddingEquipment(false)
  }

  const [itemToDelete, setItemToDelete] = useState(null)

  // Admin Deletes Equipment
  const confirmDeleteEquipment = async () => {
    if (!itemToDelete) return
    const { error } = await supabase.from('equipment').delete().eq('id', itemToDelete.id)

    if (!error) {
      setSuccessMsg(`Decommissioned ${itemToDelete.name}.`)
      fetchEquipmentAndTickets()
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      setSuccessMsg(`Delete Error: ${error.message}`)
    }
    setItemToDelete(null)
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
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center space-x-2 text-xs font-bold animate-bounce shadow-xl">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* REPORT ISSUE CARD */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Report Broken Gym Equipment</h3>
              <p className="text-xs text-slate-400">Flag malfunctioning machinery for maintenance dispatch</p>
            </div>
          </div>

          {/* ADMIN ADD EQUIPMENT BUTTON */}
          {userRole === 'admin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-amber-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Equipment</span>
            </button>
          )}
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
              <option value="">-- Choose Equipment ({equipmentList.length} Listed) --</option>
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

      {/* ADMIN ONLY: REGISTERED MACHINERY INVENTORY ROSTER */}
      {userRole === 'admin' && (
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Dumbbell className="h-4 w-4 text-indigo-400" />
              <span>Gym Machinery Inventory Roster ({equipmentList.length})</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Total Registered: {equipmentList.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {equipmentList.length === 0 ? (
              <p className="text-xs text-slate-500 col-span-full py-8 text-center border border-dashed border-slate-800 rounded-2xl font-mono">
                No machinery currently registered in inventory. Click "Add New Equipment" above!
              </p>
            ) : (
              equipmentList.map((item) => (
                <div key={item.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black text-white">{item.name}</h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{item.category} • {item.location_zone}</p>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 uppercase ${
                      item.status === 'operational' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      item.status === 'needs_repair' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/20 cursor-pointer"
                    title="Decommission Equipment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* STAFF MAINTENANCE QUEUE */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Clock className="h-4 w-4 text-indigo-400" />
          <span>Active Maintenance Tickets Queue ({tickets.filter(t => t.status !== 'resolved').length})</span>
        </h3>

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-2xl">
              All machinery is operational!
            </p>
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

      {/* ADMIN ADD EQUIPMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-amber-500/20 border border-amber-500/30 p-2.5 rounded-xl text-amber-400">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Register Gym Equipment</h3>
                <p className="text-xs text-slate-400">Add new machine into maintenance tracking database</p>
              </div>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Equipment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leg Press Machine #2"
                  value={newEqName}
                  onChange={(e) => setNewEqName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={newEqCategory}
                    onChange={(e) => setNewEqCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Free Weights">Free Weights</option>
                    <option value="Cable Machine">Cable Machine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Location Zone</label>
                  <select
                    value={newEqZone}
                    onChange={(e) => setNewEqZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Main Floor">Main Floor</option>
                    <option value="Cardio Deck">Cardio Deck</option>
                    <option value="Free Weight Area">Free Weight Area</option>
                    <option value="Recovery Room">Recovery Room</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingEquipment}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-amber-600/20"
                >
                  {addingEquipment ? 'Adding...' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-lg font-black text-white uppercase">Confirm Machine Decommission</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to decommission and remove <strong className="text-white">{itemToDelete.name}</strong> from facility inventory? This will also remove associated repair tickets.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEquipment}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-xl transition cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Decommission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}