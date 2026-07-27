import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, QrCode, LogOut, Users } from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('scanner');
  const [members, setMembers] = useState([]);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchRecentCheckIns();
  }, []);

  useEffect(() => {
    if (activeTab !== 'scanner') return;

    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.pause(true);
        processCheckIn(decodedText).then(() => {
          setTimeout(() => scanner.resume(), 3000);
        });
      },
      () => {}
    );

    return () => {
      scanner.clear().catch((err) => console.error("Scanner clear failure:", err));
    };
  }, [activeTab]);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*, subscriptions(*)');
    if (!error && data) setMembers(data);
  };

  const fetchRecentCheckIns = async () => {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*, members(full_name, status)')
      .order('checked_in_at', { ascending: false })
      .limit(6);
    if (!error && data) setRecentCheckIns(data);
  };

  const processCheckIn = async (qrToken) => {
    setScanResult(null);
    try {
      const { data: member, error } = await supabase
        .from('members')
        .select('*, subscriptions(*)')
        .eq('qr_code_token', qrToken)
        .single();

      if (error || !member) {
        setScanResult({ success: false, message: 'Invalid or Unrecognized QR Pass' });
        return;
      }

      const activeSub = member.subscriptions?.find(s => s.status === 'active');
      const isEligible = member.status === 'active' && activeSub;

      await supabase.from('check_ins').insert([
        {
          member_id: member.id,
          access_granted: !!isEligible,
          notes: isEligible ? 'Access Granted' : 'Membership Inactive'
        }
      ]);

      setScanResult({
        success: !!isEligible,
        memberName: member.full_name,
        plan: activeSub ? activeSub.plan_name : 'No Active Plan',
        message: isEligible ? 'Access Granted — Welcome!' : 'Access Denied — Membership Inactive'
      });

      fetchRecentCheckIns();
    } catch (err) {
      setScanResult({ success: false, message: 'Server processing error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">IRON GYM Admin</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'scanner' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Scanner
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'members' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Members
            </button>
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 transition"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'scanner' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-200">Front Desk Access Scanner</h2>
              <div id="reader" className="w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900"></div>

              {scanResult && (
                <div className={`mt-6 p-4 rounded-lg border flex items-center space-x-4 ${
                  scanResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}>
                  {scanResult.success ? (
                    <CheckCircle className="h-8 w-8 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-8 w-8 text-rose-400 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{scanResult.memberName || 'Scan Status'}</h3>
                    <p className="text-sm opacity-90">{scanResult.message}</p>
                    {scanResult.plan && <p className="text-xs mt-1 opacity-75">Plan: {scanResult.plan}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-200">Recent Check-Ins</h2>
              <div className="space-y-3">
                {recentCheckIns.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-slate-200">{item.members?.full_name}</p>
                      <p className="text-xs text-slate-500">{new Date(item.checked_in_at).toLocaleTimeString()}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      item.access_granted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.access_granted ? 'Granted' : 'Denied'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-6">Member Directory</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900 text-slate-300 uppercase text-xs border-b border-slate-800">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-900/50">
                      <td className="p-4 font-medium text-slate-200">{m.full_name}</td>
                      <td className="p-4">{m.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          m.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4">{m.subscriptions?.[0]?.plan_name || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}