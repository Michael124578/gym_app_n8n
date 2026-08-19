import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, Send, User, Award, ShieldCheck, 
  Sparkles, Flame, Check, CheckCheck, Clock, 
  Video, Paperclip, ChevronRight, Search, Circle
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function CoachingChat({ session, userRole }) {
  // CLIENTS ROSTER FOR TRAINER VIEW
  const [clients, setClients] = useState([
    { id: 'c1', name: 'Alex Johnson', plan: 'VIP 1-on-1 Coaching', lastMsg: 'Sent my bench press video!', time: '10:42 AM', unread: 1, online: true },
    { id: 'c2', name: 'Elena Rostova', plan: 'Hypertrophy Track', lastMsg: 'Hit 70kg on squats today 🎉', time: 'Yesterday', unread: 0, online: false },
    { id: 'c3', name: 'Marcus Vance', plan: 'Fat Loss Recomp', lastMsg: 'Macros logged for the week', time: 'Mon', unread: 0, online: true },
  ])

  const [activeContact, setActiveContact] = useState({
    id: 't1',
    name: userRole === 'trainer' ? 'Alex Johnson' : 'Coach Marcus Steele',
    role: userRole === 'trainer' ? 'Client' : 'Head Strength & Hypertrophy Coach',
    online: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'
  })

  // CHAT MESSAGES
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('iron_gym_coaching_chat')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return [
      { id: 'm1', sender: 'coach', text: 'Hey! Ready for your Upper Body Hypertrophy session today? Remember to focus on the 3-second eccentric on bench press.', timestamp: '09:30 AM', isCoach: true },
      { id: 'm2', sender: 'member', text: 'Awesome! Felt great, hit 90kg for 6 reps on the top set @ RPE 9.', timestamp: '10:15 AM', isCoach: false },
      { id: 'm3', sender: 'coach', text: 'Outstanding progressive overload! Add 2.5kg next week. How are your post-workout macros looking?', timestamp: '10:18 AM', isCoach: true },
    ]
  })

  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('iron_gym_coaching_chat', JSON.stringify(messages))
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: userRole === 'trainer' ? 'coach' : 'member',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCoach: userRole === 'trainer'
    }

    setMessages(prev => [...prev, newMsg])
    setInputText('')

    // Simulated coach response if member sent message
    if (userRole !== 'trainer') {
      setTimeout(() => {
        const autoReply = {
          id: `reply-${Date.now()}`,
          sender: 'coach',
          text: 'Got your update! Form cues looking solid. Keep hitting that protein goal and let’s crush leg day tomorrow. 💪',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCoach: true
        }
        setMessages(prev => [...prev, autoReply])
      }, 1500)
    }
  }

  const sendQuickChip = (chipText) => {
    setInputText(chipText)
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            <MessageSquare className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span>1-on-1 Dedicated Coaching & Form Check Terminal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            Coach Direct Messaging
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time direct communication with your dedicated personal trainer for weekly check-ins, routine adjustments, and video form analysis.
          </p>
        </div>
      </div>

      {/* CHAT CONTAINER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* LEFT ROSTER PANEL (FOR TRAINERS OR MULTI-COACHES) */}
        <div className="lg:col-span-4 bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
                {userRole === 'trainer' ? 'Active Client Roster' : 'Your Assigned Coach'}
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Live Channel
              </span>
            </div>

            {/* CONTACTS LIST */}
            <div className="space-y-2">
              {userRole === 'trainer' ? (
                clients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setActiveContact({ id: c.id, name: c.name, role: c.plan, online: c.online })}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      activeContact.name === c.name
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/20">
                          {c.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {c.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{c.name}</h4>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">{c.lastMsg}</span>
                      </div>
                    </div>

                    <div className="text-right text-[10px] font-mono text-slate-500">
                      <span>{c.time}</span>
                      {c.unread > 0 && (
                        <span className="bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-full block mt-1">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-indigo-600/30">
                      MS
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase">{activeContact.name}</h4>
                      <span className="text-[10px] font-mono text-indigo-300 block">{activeContact.role}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center"><Circle className="h-2.5 w-2.5 text-emerald-400 fill-emerald-400 mr-1.5" /> Online Now</span>
                    <span className="font-mono text-indigo-400">Avg Reply: &lt;10m</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block mb-1">Weekly Check-in Day</span>
            <p className="text-[11px]">Next progress review scheduled for <strong className="text-white">Sunday at 6:00 PM</strong>.</p>
          </div>
        </div>

        {/* RIGHT ACTIVE CHAT PANEL */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full bg-slate-900/40">
          
          {/* CHAT HEADER */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                {activeContact.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-white">{activeContact.name}</h3>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  Active Coaching Session
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-xl">
              ENCRYPTED TERMINAL
            </span>
          </div>

          {/* MESSAGES SCROLL CONTAINER */}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[450px] scrollbar-thin">
            {messages.map((msg) => {
              const isMe = userRole === 'trainer' ? msg.isCoach : !msg.isCoach
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md rounded-2xl p-4 shadow-xl text-xs space-y-1.5 ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-600/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center justify-end space-x-1 text-[9px] font-mono ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div className="px-6 py-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">Quick Cues:</span>
            {[
              '🎥 Review my form video link',
              '🥗 Weekly nutrition check-in',
              '🏆 Hit a new PR on Bench today!',
              '⚖️ Down 1.2kg on morning weigh-in'
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendQuickChip(chip)}
                className="shrink-0 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium rounded-xl border border-slate-800 transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeContact.name}...`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs p-3 rounded-2xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  )
}
