import React from 'react'
import MemberList from '../components/MemberList'
import QRScanner from '../components/QRScanner'
import AdminAnalytics from '../components/AdminAnalytics'
import EquipmentMaintenance from '../components/EquipmentMaintenance'
import TrainerManagement from '../components/TrainerManagement'

export default function AdminDashboard({ activeTab = 'members', session, refreshTrigger, onRefreshNeeded }) {
  return (
    <div className="w-full space-y-6">
      {activeTab === 'members' && (
        <MemberList refreshTrigger={refreshTrigger} />
      )}

      {activeTab === 'scanner' && (
        <QRScanner onScanComplete={onRefreshNeeded} />
      )}

      {activeTab === 'analytics' && (
        <AdminAnalytics />
      )}

      {activeTab === 'maintenance' && (
        <EquipmentMaintenance userRole="admin" />
      )}

      {activeTab === 'trainers' && (
        <TrainerManagement session={session} userRole="admin" />
      )}
    </div>
  )
}