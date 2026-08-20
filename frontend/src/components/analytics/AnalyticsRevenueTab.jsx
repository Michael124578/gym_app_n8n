import React from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { DollarSign, TrendingUp, FileSpreadsheet, Search, CheckCircle2 } from 'lucide-react'

export default function AnalyticsRevenueTab({
  totalRevenue,
  filteredPayments,
  planBreakdown,
  revenueTrendData,
  txSearch,
  setTxSearch,
  txPlanFilter,
  setTxPlanFilter,
  filteredTransactions,
  membersMap,
  CustomChartTooltip
}) {
  return (
    <motion.div
      key="revenue"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* PLAN REVENUE PIE */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>Revenue by Package</span>
            </h3>
            <p className="text-xs text-slate-400">Share of revenue per subscription package</p>
          </div>

          <div className="w-full h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planBreakdown}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {planBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip suffix=" EGP" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {planBreakdown.map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-300 font-medium">{p.name}</span>
                </div>
                <span className="font-bold text-white font-mono">{p.revenue.toLocaleString()} EGP</span>
              </div>
            ))}
          </div>
        </div>

        {/* REVENUE VELOCITY CHART */}
        <div className="lg:col-span-2 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <span>Volume & Cash Flow Speed</span>
              </h3>
              <p className="text-xs text-slate-400">Total payments processed in timeframe</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-slate-400">Avg Transaction</p>
              <p className="text-sm font-bold text-white">
                {filteredPayments.length > 0 ? Math.round(totalRevenue / filteredPayments.length).toLocaleString() : 0} EGP
              </p>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={val => `${val} EGP`} />
                <Tooltip content={<CustomChartTooltip suffix=" EGP" />} />
                <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LIVE TRANSACTIONS LEDGER */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span>Real-Time Payment Ledger</span>
            </h3>
            <p className="text-xs text-slate-400">Live feed of membership payments and renewals</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search member or plan..."
                value={txSearch}
                onChange={e => setTxSearch(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <select
              value={txPlanFilter}
              onChange={e => setTxPlanFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Plans</option>
              {planBreakdown.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Membership Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.slice(0, 10).map((tx) => {
                  const member = membersMap[tx.member_id]
                  return (
                    <tr key={tx.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        {member?.full_name || 'Anonymous Member'}
                        <div className="text-[10px] font-normal text-slate-500 font-mono">{member?.email || 'No email'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl font-medium">
                          {tx.plan_name || 'Standard Pass'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-400 font-mono text-sm">
                        +{Number(tx.amount || 0).toLocaleString()} EGP
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {tx.paid_at ? new Date(tx.paid_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3 mr-0.5" />
                          Paid
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
