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

    if (!members || members.length === 0) {
      return res.status(200).json({ success: true, message: 'No active members to notify.', emailsSent: 0 })
    }

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

    const appUrl = process.env.PUBLIC_APP_URL || 'https://your-gym-app.vercel.app'
    let emailsSent = 0

    // 4. Dispatch Professional Weekly Recaps
    for (const member of members) {
      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('checked_in_at')
        .eq('member_id', member.id)
        .gte('checked_in_at', sevenDaysAgo.toISOString())

      const visitCount = checkIns ? checkIns.length : 0

      // Dynamic Encouragement Message based on attendance
      let statusMessage = "Consistency is key to long-term athletic progress. We look forward to seeing you at the facility this coming week."
      if (visitCount >= 4) {
        statusMessage = "Outstanding performance this week! Your dedication to your training schedule is commendable."
      } else if (visitCount >= 1) {
        statusMessage = "Solid effort maintaining your training routine this week. Keep building momentum into next week!"
      }

      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Weekly Attendance & Activity Report — IRON GYM</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 40px 20px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
            
            <!-- HEADER -->
            <tr>
              <td style="padding: 32px 40px; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #1e293b; text-align: left;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                  IRON <span style="color: #6366f1;">GYM</span>
                </h1>
                <p style="margin: 4px 0 0 0; font-size: 11px; font-family: monospace; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">
                  Weekly Performance & Attendance Summary
                </p>
              </td>
            </tr>

            <!-- BODY CONTENT -->
            <tr>
              <td style="padding: 40px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                <p style="margin-top: 0; font-size: 16px; font-weight: 700; color: #ffffff;">
                  Dear ${member.full_name},
                </p>
                
                <p>
                  Here is your official facility attendance recap for the past 7 days.
                </p>

                <!-- ATTENDANCE STATS CARD -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #020617; border: 1px solid #334155; border-radius: 12px; margin: 24px 0; padding: 24px; text-align: center;">
                  <tr>
                    <td style="font-size: 12px; font-family: monospace; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px;">
                      7-Day Visit Log
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 42px; font-weight: 900; color: #10b981; line-height: 1; padding: 8px 0;">
                      ${visitCount}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; font-weight: 700; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${visitCount === 1 ? 'Completed Visit' : 'Completed Visits'}
                    </td>
                  </tr>
                </table>

                <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 24px;">
                  ${statusMessage}
                </p>

                <!-- BUTTON CTA -->
                <table border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                  <tr>
                    <td align="center" style="border-radius: 10px; background: linear-gradient(90deg, #6366f1, #4f46e5);">
                      <a href="${appUrl}" target="_blank" style="font-size: 12px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                        View Performance Portal &rarr;
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-t: 1px solid #1e293b; padding-top: 16px;">
                  Log in to your member dashboard to review your workout streak, personal records (PRs), and assigned training programs.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding: 24px 40px; background-color: #020617; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; font-family: monospace; color: #64748b;">
                <p style="margin: 0 0 4px 0;">IRON GYM • Gate Systems & Performance Analytics</p>
                <p style="margin: 0;">This is an automated operational report sent to active facility members.</p>
              </td>
            </tr>

          </table>
        </body>
        </html>
      `

      await transporter.sendMail({
        from: `"IRON GYM Operations" <${process.env.GMAIL_USER}>`,
        to: member.email,
        subject: `Weekly Attendance & Activity Report — IRON GYM`,
        html: htmlTemplate
      })

      emailsSent++
    }

    return res.status(200).json({ success: true, emailsSent })
  } catch (error) {
    console.error('Cron job error:', error)
    return res.status(500).json({ error: error.message })
  }
}