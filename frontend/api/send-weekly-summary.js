import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req, res) {
  // 1. Verify Vercel Cron or Admin Trigger
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` && req.method !== 'POST') {
    return res.status(401).json({ error: 'Unauthorized cron request' })
  }

  try {
    // 2. Fetch Active Members
    const { data: members, error: memberErr } = await supabase
      .from('members')
      .select('id, full_name, email')
      .eq('status', 'active')

    if (memberErr) throw memberErr

    // 3. Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
      }
    })

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    let emailsSent = 0

    // 4. Send Weekly Summary to Each Member
    for (const member of members) {
      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('checked_in_at')
        .eq('member_id', member.id)
        .gte('checked_in_at', sevenDaysAgo.toISOString())

      const visitCount = checkIns ? checkIns.length : 0

      await transporter.sendMail({
        from: `"IRON GYM" <${process.env.GMAIL_USER}>`,
        to: member.email,
        subject: `🔥 Your Weekly IRON GYM Recap: ${visitCount} Visits!`,
        html: `
          <div style="font-family: Arial, sans-serif; bg-color: #0f172a; background-color: #0f172a; color: #ffffff; padding: 24px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1; margin-bottom: 8px;">Weekly Recap: ${member.full_name}</h1>
            <p style="color: #94a3b8; font-size: 14px;">Here is your physical attendance summary for the past 7 days:</p>
            <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #334155; text-center;">
              <h2 style="font-size: 36px; color: #10b981; margin: 0;">${visitCount} ${visitCount === 1 ? 'Visit' : 'Visits'}</h2>
              <p style="color: #cbd5e1; font-size: 12px; margin-top: 4px;">Log in to your portal to view your streak and PRs!</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">IRON GYM Automated Performance Engine</p>
          </div>
        `
      })
      emailsSent++
    }

    return res.status(200).json({ success: true, emailsSent })
  } catch (error) {
    console.error('Cron error:', error)
    return res.status(500).json({ error: error.message })
  }
}