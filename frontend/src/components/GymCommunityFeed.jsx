import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Plus, Pin, AlertCircle, Calendar, CheckCircle2, X,
  Flame, Trophy, MessageSquare, ThumbsUp, Heart, Share2, Megaphone, User, Award
} from 'lucide-react'

const DEFAULT_POSTS = [
  {
    id: 'post-1',
    author: 'Iron Gym Management',
    role: 'Admin',
    isPinned: true,
    category: 'Announcement',
    timestamp: '2 hours ago',
    title: '🏆 Fall Powerlifting & Hypertrophy Challenge Announced!',
    content: 'We are kicking off our 8-week Iron Gym Winter Transformation & PR Challenge! All members are eligible. Grand prize includes 6 months of free VIP membership, custom lifting belt, and $250 in Pro Shop fuel credits. Registration is open at the front desk or via your trainer.',
    reactions: { flame: 24, clap: 18, trophy: 12 },
    comments: [
      { id: 'c1', author: 'Marcus Brody', text: 'Count me in for the deadlift bracket! 🔥' },
      { id: 'c2', author: 'Sarah Connor', text: 'Can coaches enter as well?' }
    ]
  },
  {
    id: 'post-2',
    author: 'Dmitri Volkov',
    role: 'Coach',
    isPinned: false,
    category: 'Member PR',
    timestamp: '5 hours ago',
    title: '⚡ Huge Milestone: Sarah just pulled a 140kg (308 lbs) Deadlift PR!',
    content: 'Massive shoutout to Sarah Connor for smashing her all-time deadlift PR today in the Power Pit! 6 months of disciplined linear periodization paying off. Pure grit and clean lockout.',
    reactions: { flame: 38, clap: 29, trophy: 15 },
    comments: [
      { id: 'c3', author: 'Elena Rostova', text: 'Incredible form! So inspiring 👏' },
      { id: 'c4', author: 'David Kim', text: 'Monster pull! Congrats Sarah!' }
    ]
  },
  {
    id: 'post-3',
    author: 'Iron Facility Operations',
    role: 'Admin',
    isPinned: false,
    category: 'Facility Update',
    timestamp: '1 day ago',
    title: '🛠️ 3 New Rogue Monster Power Racks Installed',
    content: 'As requested in member feedback, we have expanded Platform 2 with 3 new Rogue Monster Power Racks equipped with calibrated competition plates and safety strap systems. Enjoy your heavy lifting!',
    reactions: { flame: 45, clap: 31, trophy: 8 },
    comments: [
      { id: 'c5', author: 'Alex Vance', text: 'The new knurling on the bars is top notch.' }
    ]
  },
  {
    id: 'post-4',
    author: 'Michael Chen',
    role: 'Member',
    isPinned: false,
    category: 'Milestone',
    timestamp: '2 days ago',
    title: '🔥 Hit my 100th Check-In Milestone at Iron Gym!',
    content: 'Never thought I would stick to a fitness routine this consistently. Huge thank you to the coaching staff and the awesome community here. Down 12kg and feeling stronger than ever.',
    reactions: { flame: 52, clap: 44, trophy: 20 },
    comments: []
  }
]

export default function GymCommunityFeed({ session, userRole }) {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('iron_gym_community_posts')
    return saved ? JSON.parse(saved) : DEFAULT_POSTS
  })

  const [activeTab, setActiveTab] = useState('all') // 'all', 'announcements', 'prs'
  const [newCommentText, setNewCommentText] = useState({})
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  // New Post Form
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postCategory, setPostCategory] = useState('Announcement')
  const [postPinned, setPostPinned] = useState(false)

  const currentUserName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Iron Athlete'

  useEffect(() => {
    localStorage.setItem('iron_gym_community_posts', JSON.stringify(posts))
  }, [posts])

  const handleReact = (postId, reactionKey) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const curReactions = { ...p.reactions }
        curReactions[reactionKey] = (curReactions[reactionKey] || 0) + 1
        return { ...p, reactions: curReactions }
      }
      return p
    }))
  }

  const handleAddComment = (postId) => {
    const text = (newCommentText[postId] || '').trim()
    if (!text) return

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...(p.comments || []),
            { id: `c-${Date.now()}`, author: currentUserName, text }
          ]
        }
      }
      return p
    }))

    setNewCommentText(prev => ({ ...prev, [postId]: '' }))
  }

  const handleCreatePost = (e) => {
    e.preventDefault()
    if (!postTitle.trim() || !postContent.trim()) return

    const newPost = {
      id: `post-${Date.now()}`,
      author: currentUserName,
      role: userRole === 'admin' ? 'Admin' : userRole === 'trainer' ? 'Coach' : 'Member',
      isPinned: userRole === 'admin' ? postPinned : false,
      category: postCategory,
      timestamp: 'Just now',
      title: postTitle.trim(),
      content: postContent.trim(),
      reactions: { flame: 1, clap: 1, trophy: 0 },
      comments: []
    }

    setPosts(prev => [newPost, ...prev])
    setIsPostModalOpen(false)
    setPostTitle('')
    setPostContent('')
  }

  const filteredPosts = posts.filter(p => {
    if (activeTab === 'announcements') return p.category === 'Announcement' || p.category === 'Facility Update'
    if (activeTab === 'prs') return p.category === 'Member PR' || p.category === 'Milestone'
    return true
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Megaphone className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">COMMUNITY FEED & PR RADAR</h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              LIVE BROADCAST
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Stay tuned to gym updates, celebrate member PR milestones, and engage with the Iron Gym athlete community
          </p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Post Update</span>
        </button>
      </div>

      {/* TABS */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        {[
          { id: 'all', label: 'All Updates', icon: Flame },
          { id: 'announcements', label: 'Gym Announcements', icon: Megaphone },
          { id: 'prs', label: 'PRs & Milestones', icon: Trophy }
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* FEED POSTS */}
      <div className="space-y-5">
        {filteredPosts.map(post => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-slate-950/80 backdrop-blur-xl border rounded-3xl p-6 shadow-xl space-y-4 ${
              post.isPinned ? 'border-indigo-500/50 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950' : 'border-slate-800/80'
            }`}
          >
            {/* POST HEADER */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{post.author}</span>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.2 rounded-full border ${
                      post.role === 'Admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      post.role === 'Coach' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {post.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{post.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {post.isPinned && (
                  <span className="flex items-center space-x-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full font-mono">
                    <Pin className="h-3 w-3" />
                    <span>PINNED</span>
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl">
                  {post.category}
                </span>
              </div>
            </div>

            {/* CONTENT */}
            <div className="space-y-2">
              <h3 className="text-base font-black text-white">{post.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{post.content}</p>
            </div>

            {/* REACTIONS BAR */}
            <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleReact(post.id, 'flame')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 rounded-xl text-xs text-slate-300 hover:text-amber-400 transition"
              >
                <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-mono font-bold">{post.reactions.flame || 0}</span>
              </button>

              <button
                onClick={() => handleReact(post.id, 'clap')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/30 rounded-xl text-xs text-slate-300 hover:text-indigo-400 transition"
              >
                <span>👏</span>
                <span className="font-mono font-bold">{post.reactions.clap || 0}</span>
              </button>

              <button
                onClick={() => handleReact(post.id, 'trophy')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 rounded-xl text-xs text-slate-300 hover:text-emerald-400 transition"
              >
                <Trophy className="h-4 w-4 text-emerald-400" />
                <span className="font-mono font-bold">{post.reactions.trophy || 0}</span>
              </button>
            </div>

            {/* COMMENTS SECTION */}
            {post.comments && post.comments.length > 0 && (
              <div className="space-y-2 pt-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-900">
                {post.comments.map(c => (
                  <div key={c.id} className="text-xs flex items-start space-x-2">
                    <span className="font-bold text-indigo-400 shrink-0">{c.author}:</span>
                    <span className="text-slate-300">{c.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* COMMENT INPUT */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                placeholder="Write a supportive comment or congratulations..."
                value={newCommentText[post.id] || ''}
                onChange={e => setNewCommentText({ ...newCommentText, [post.id]: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => handleAddComment(post.id)}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CREATE POST MODAL */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <Megaphone className="h-5 w-5 text-indigo-400" />
                  <span>SHARE GYM BROADCAST OR PR</span>
                </h3>
                <button onClick={() => setIsPostModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Headline / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New 200kg Squat PR or Weekend Workshop Notice"
                    value={postTitle}
                    onChange={e => setPostTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Post Category</label>
                    <select
                      value={postCategory}
                      onChange={e => setPostCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Announcement">Announcement</option>
                      <option value="Member PR">Member PR</option>
                      <option value="Facility Update">Facility Update</option>
                      <option value="Milestone">Milestone</option>
                    </select>
                  </div>

                  {userRole === 'admin' && (
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="pinPost"
                        checked={postPinned}
                        onChange={e => setPostPinned(e.target.checked)}
                        className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="pinPost" className="text-slate-300 font-bold cursor-pointer">
                        Pin to top of feed
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Update Body</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Write details, encouragement, or equipment updates..."
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
                  >
                    Broadcast Post
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
