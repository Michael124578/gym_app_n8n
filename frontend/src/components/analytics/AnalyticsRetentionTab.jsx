import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Download, Phone, Mail } from 'lucide-react'
import { formatReadableDate } from '../../utils/dateUtils'

export default function AnalyticsRetentionTab({
  activeCount,
  expiringCount,
  expiredCount,
  retentionRate,
  expiringMembersList,
  exportToCSV
}) {
  return (
    <motion.div
      key="retention"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* RETENTION HEALTH BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl text-center">
          <p className="text-xs text-slate-400 font-medium">Active Member Base</p>
          <p className="text-3xl font-black text-emerald-400 mt-1">{activeCount}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Current Paid Passes</p>
        </div>

        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl text-center">
          <p className="text-xs text-slate-400 font-medium">Expiring in &le; 7 Days</p>
          <p className="text-3xl font-black text-amber-400 mt-1">{expiringCount}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Needs Renewal Outreach</p>
        </div>

        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl text-center">
          <p className="text-xs text-slate-400 font-medium">Lapsed / Inactive</p>
          <p className="text-3xl font-black text-rose-400 mt-1">{expiredCount}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Past Expiry Date</p>
        </div>

        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl text-center">
          <p className="text-xs text-slate-400 font-medium">Retention Ratio</p>
          <p className="text-3xl font-black text-indigo-400 mt-1">{retentionRate}%</p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Loyalty Index</p>
        </div>
      </div>

      {/* EXPIRING MEMBERS ACTION LIST */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Expiring Soon Watchlist (Next 7 Days)</span>
            </h3>
            <p className="text-xs text-slate-400">Proactively engage members before their pass expires to maintain 90%+ retention</p>
          </div>
          <button
            onClick={() => exportToCSV('expiring')}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Watchlist</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Days Left</th>
                <th className="py-3 px-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expiringMembersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                    🎉 No memberships expiring in the next 7 days!
                  </td>
                </tr>
              ) : (
                expiringMembersList.map(m => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-bold text-white">
                      {m.full_name}
                      <div className="text-[10px] font-normal text-slate-500 font-mono">{m.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-xl font-medium">
                        {m.plan_name || 'Monthly Pass'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {m.membership_end_date ? formatReadableDate(m.membership_end_date) : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${m.daysLeft <= 2
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                        {m.daysLeft === 0 ? 'Expires Today' : `${m.daysLeft} Day${m.daysLeft > 1 ? 's' : ''} Left`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {m.phone && (
                          <a
                            href={`tel:${m.phone}`}
                            className="p-1.5 bg-slate-900 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-xl transition"
                            title="Call Member"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {m.email && (
                          <a
                            href={`mailto:${m.email}?subject=Iron Gym Membership Renewal&body=Hi ${m.full_name}, your Iron Gym pass is expiring soon!`}
                            className="p-1.5 bg-slate-900 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 border border-slate-800 rounded-xl transition"
                            title="Email Member"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
