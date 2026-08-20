import React, { useState } from 'react'
import { 
  AlertTriangle, MessageSquare, Send, CheckCircle2, Clock, 
  UserCheck, Zap, ShieldAlert, Sparkles, RefreshCw, ChevronRight, Phone, Mail
} from 'lucide-react'
import { formatReadableDate } from '../utils/dateUtils'
import PillButton from './PillButton'
import PillFilter from './PillFilter'

export default function RetentionRiskRadar({ members = [], onRenewMember }) {
  const [filterMode, setFilterMode] = useState('expiring') // 'expiring' | 'expired' | 'inactive'
  const [sentAlerts, setSentAlerts] = useState({})

  const gymBranding = (() => {
    try {
      const saved = localStorage.getItem('iron_gym_branding')
      return saved ? JSON.parse(saved) : { name: 'IRON GYM', activeBranch: 'Cairo Flagship' }
    } catch (e) {
      return { name: 'IRON GYM', activeBranch: 'Cairo Flagship' }
    }
  })()

  // Calculate At-Risk Cohorts
  const today = new Date()

  const expiringSoonMembers = members.filter(m => {
    if (!m.membership_end_date) return false
    const diffDays = Math.ceil((new Date(m.membership_end_date) - today) / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 7
  })

  const expiredMembers = members.filter(m => {
    if (!m.membership_end_date) return false
    return new Date(m.membership_end_date) < today
  })

  const activeCohort = filterMode === 'expiring' 
    ? expiringSoonMembers 
    : filterMode === 'expired' 
    ? expiredMembers 
    : expiringSoonMembers.concat(expiredMembers)

  const handleSendWhatsAppAlert = (member) => {
    const cleanPhone = (member.phone || '').replace(/[^0-9]/g, '')
    const daysLeft = member.membership_end_date 
      ? Math.ceil((new Date(member.membership_end_date) - today) / (1000 * 60 * 60 * 24))
      : 0

    let textMessage = ''
    if (daysLeft > 0) {
      textMessage = `Hello ${member.full_name}, your ${member.plan_name || 'Membership Pass'} at ${gymBranding.name} (${gymBranding.activeBranch}) expires in ${daysLeft} days on ${formatReadableDate(member.membership_end_date)}. Renew today at the front desk or mobile app to maintain uninterrupted turnstile gate access!`
    } else {
      textMessage = `Hello ${member.full_name}, your membership pass at ${gymBranding.name} (${gymBranding.activeBranch}) has expired. We miss seeing you on the gym floor! Visit us today to renew your pass and get back to your training goals.`
    }

    const whatsappUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(textMessage)}`

    window.open(whatsappUrl, '_blank')
    setSentAlerts(prev => ({ ...prev, [member.id]: true }))
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl space-y-6">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
              Member Retention & At-Risk Radar
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated churn prevention engine • Identify expiring passes & send 1-click WhatsApp alerts
          </p>
        </div>

        {/* COHORT COUNTERS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <PillFilter
            active={filterMode === 'expiring'}
            onClick={() => setFilterMode('expiring')}
            theme="amber"
            count={expiringSoonMembers.length}
            size="sm"
          >
            Expiring (&le;7 Days)
          </PillFilter>

          <PillFilter
            active={filterMode === 'expired'}
            onClick={() => setFilterMode('expired')}
            theme="rose"
            count={expiredMembers.length}
            size="sm"
          >
            Expired Churn
          </PillFilter>
        </div>
      </div>

      {/* COHORT RADAR LIST */}
      {activeCohort.length === 0 ? (
        <div className="text-center py-10 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white uppercase">Radar Clear! No At-Risk Athletes Found</p>
          <p className="text-xs text-slate-400 mt-1">All registered gym members currently hold healthy active gate passes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCohort.map((member) => {
            const daysLeft = member.membership_end_date 
              ? Math.ceil((new Date(member.membership_end_date) - today) / (1000 * 60 * 60 * 24))
              : 0
            const isAlertSent = sentAlerts[member.id]

            return (
              <div 
                key={member.id}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-amber-500/40 p-4 rounded-2xl space-y-3 transition duration-200 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      daysLeft > 0 
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      {daysLeft > 0 ? `${daysLeft} Days Left` : 'Pass Expired'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {formatReadableDate(member.membership_end_date)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-white uppercase text-sm tracking-tight">
                      {member.full_name}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">{member.email}</p>
                    {member.phone && (
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">{member.phone}</p>
                    )}
                  </div>
                </div>

                {/* RETENTION ACTION BUTTONS */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <PillButton
                    onClick={() => handleSendWhatsAppAlert(member)}
                    theme={isAlertSent ? 'teal' : 'amber'}
                    icon={Send}
                    size="sm"
                  >
                    {isAlertSent ? 'Alert Sent' : 'WhatsApp'}
                  </PillButton>

                  {onRenewMember && (
                    <button
                      type="button"
                      onClick={() => onRenewMember(member)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-full text-[11px] font-bold uppercase transition cursor-pointer"
                    >
                      Renew
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
