import React from 'react';
import { QrCode, LogOut } from 'lucide-react';

export default function Navbar({ title = 'IRON GYM', subtitle, onLogout }) {
  return (
    <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <QrCode className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>

      {onLogout && (
        <button
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg bg-slate-900 border border-slate-800 transition"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </header>
  );
}