import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Headphones, Play, Pause, Disc, Volume2, 
  Flame, Radio, Music, ExternalLink, Zap, Heart
} from 'lucide-react'

const PLAYLIST_STATIONS = [
  {
    id: 'phonk',
    title: 'Gym Phonk & Brazilian Drift',
    genre: 'High BPM / PR Adrenaline',
    bpm: '145 - 160 BPM',
    color: 'from-violet-600 to-indigo-600',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWY64Hb7Za0F?utm_source=generator&theme=0',
    spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DWWY64Hb7Za0F',
    description: 'Relentless drift phonk, aggressive 808s, and raw basslines built for heavy PR attempts and max-effort singles.',
    tag: '⚡ MAX PR'
  },
  {
    id: 'hardstyle',
    title: 'Hardstyle & Rawstyle Energy',
    genre: 'Euphoric & Reverse Bass',
    bpm: '150 - 165 BPM',
    color: 'from-amber-600 to-rose-600',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0pH2SQT0Z2f?utm_source=generator&theme=0',
    spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DX0pH2SQT0Z2f',
    description: 'High-octane reverse bass kicks and euphoric drops to power through grueling leg days and HIIT conditioning.',
    tag: '🔥 PUMP'
  },
  {
    id: 'hiphop',
    title: 'Heavy Hip-Hop & Rap Pump',
    genre: 'East/West Coast Hard Beats',
    bpm: '90 - 130 BPM',
    color: 'from-emerald-600 to-teal-600',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76t638V6494?utm_source=generator&theme=0',
    spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DX76t638V6494',
    description: 'Hard-hitting lyrical flow, booming subs, and gritty underground rap to keep your mind locked in the zone.',
    tag: '🥊 FOCUS'
  },
  {
    id: 'metal',
    title: 'Heavy Metal & Metalcore Riffs',
    genre: 'Aggressive Guitars & Breakdowns',
    bpm: '130 - 170 BPM',
    color: 'from-rose-700 to-slate-800',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcfZ6moR6J06?utm_source=generator&theme=0',
    spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DXcfZ6moR6J06',
    description: 'Bone-crushing breakdowns, double-kick blast beats, and intense driving metal for barbaric deadlift sessions.',
    tag: '🦾 TITAN'
  },
  {
    id: 'synthwave',
    title: 'Cyberpunk & Darksynth',
    genre: 'Retro Dystopian Electronic',
    bpm: '120 - 140 BPM',
    color: 'from-cyan-600 to-indigo-700',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    description: 'Hypnotic dark electro arpeggiators and cyberpunk soundscapes for machine isolation supersets.',
    tag: '🌌 NEON'
  },
  {
    id: 'lofi',
    title: 'Warm-up & Mobility Lo-Fi Beats',
    genre: 'Mellow Chillhop & Recovery',
    bpm: '75 - 90 BPM',
    color: 'from-indigo-600 to-slate-800',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0',
    spotifyLink: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
    description: 'Smooth vinyl texture and relaxing jazz-hop for dynamic warmups, hip openers, and post-workout sauna relaxation.',
    tag: '🧘 WARMUP'
  }
]

export default function WorkoutMusicHub() {
  const [selectedStation, setSelectedStation] = useState(PLAYLIST_STATIONS[0])

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Headphones className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>High-Octane Audio Stations & Playlists</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Workout Beats & Music Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Curated audio soundtracks categorized by BPM, training intensity, and genre to fuel your workouts.
            </p>
          </div>

          {/* EQUALIZER ANIMATION */}
          <div className="flex items-end space-x-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800 h-16 self-start sm:self-auto shadow-xl">
            <span className="w-1.5 bg-indigo-500 rounded-full h-8 animate-pulse" />
            <span className="w-1.5 bg-violet-500 rounded-full h-12 animate-bounce" />
            <span className="w-1.5 bg-cyan-400 rounded-full h-6 animate-pulse" />
            <span className="w-1.5 bg-indigo-400 rounded-full h-10 animate-bounce" />
            <span className="w-1.5 bg-rose-500 rounded-full h-7 animate-pulse" />
          </div>
        </div>
      </div>

      {/* ACTIVE STATION EMBED PLAYER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-tr ${selectedStation.color} text-white shadow-lg`}>
              <Disc className="h-6 w-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                {selectedStation.genre} • {selectedStation.bpm}
              </span>
              <h2 className="text-xl font-black uppercase text-white">
                {selectedStation.title}
              </h2>
            </div>
          </div>

          <a
            href={selectedStation.spotifyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 self-start sm:self-auto"
          >
            <span>Open in Spotify App</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* EMBEDDED STREAMING PLAYER */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
          <iframe
            src={selectedStation.embedUrl}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={selectedStation.title}
            className="w-full"
          />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          💡 {selectedStation.description}
        </p>
      </div>

      {/* ALL AUDIO GENRE STATIONS GRID */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold block mb-4">
          Select Workout Sound Station
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLAYLIST_STATIONS.map((station) => {
            const isCurrent = selectedStation.id === station.id
            return (
              <div
                key={station.id}
                onClick={() => setSelectedStation(station)}
                className={`p-6 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group ${
                  isCurrent
                    ? 'bg-slate-900 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-slate-950 text-indigo-400 border border-slate-800">
                      {station.tag}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{station.bpm}</span>
                  </div>

                  <h3 className="text-lg font-black uppercase text-white group-hover:text-indigo-400 transition">
                    {station.title}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-1">{station.genre}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <span className={isCurrent ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                    {isCurrent ? '▶ Now Playing' : 'Click to Load Station'}
                  </span>
                  <div className={`p-2 rounded-xl transition ${
                    isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'
                  }`}>
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
