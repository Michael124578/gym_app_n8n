import React, { Component } from 'react'
import { AlertTriangle, RefreshCw, LayoutDashboard, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Iron Gym ErrorBoundary caught component crash:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReturnToDashboard = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onResetTab) {
      this.props.onResetTab()
    } else {
      localStorage.setItem('iron_gym_active_tab', 'members')
      window.location.reload()
    }
  }

  handleHardReset = () => {
    localStorage.removeItem('iron_gym_active_tab')
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[400px] flex items-center justify-center p-6 select-none animate-in fade-in duration-300">
          <div className="max-w-lg w-full bg-slate-900/90 backdrop-blur-2xl border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="inline-flex bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-rose-400">
              <AlertTriangle className="h-8 w-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                Recovery Shield Active
              </span>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Module Encountered an Interruption
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                An unexpected component error occurred in this view. Your session and data remain safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] font-mono text-rose-300/80 text-left overflow-x-auto max-h-24">
                <code>{this.state.error.message}</code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReturnToDashboard}
                className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Return to Dashboard</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-2 border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retry View</span>
              </button>

              <button
                type="button"
                onClick={this.handleHardReset}
                className="w-full sm:w-auto px-4 py-3 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-2 border border-slate-800 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload App</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
