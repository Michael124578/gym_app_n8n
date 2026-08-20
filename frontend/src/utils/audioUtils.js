// Centralized Web Audio Synthesizer & Haptic Vibration Utility

// Trigger haptic vibration on mobile devices
export const triggerHaptic = (pattern = 40) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch (e) {
      // Ignore vibration errors on unsupported hardware
    }
  }
}

// Play a melodic 2-tone chime (Rest timer completion / PR unlock)
export const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.setValueAtTime(880, now + 0.15) // A5
    
    gain1.gain.setValueAtTime(0.25, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    
    osc1.start(now)
    osc1.stop(now + 0.6)
  } catch (e) {
    console.debug('Audio chime playback error:', e)
  }
}

// Play a tri-tone success chime
export const playSuccessChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.08)
      gain.gain.setValueAtTime(0.18, now + idx * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.08)
      osc.stop(now + idx * 0.08 + 0.45)
    })
  } catch (e) {
    console.debug('Audio success chime playback error:', e)
  }
}

// Play a low error buzz (Access denied / validation error)
export const playErrorBuzz = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.35)
  } catch (e) {
    console.debug('Audio error buzz playback error:', e)
  }
}
