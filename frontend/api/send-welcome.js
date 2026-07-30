import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { email, full_name, plan_name } = await req.json()
    const appUrl = process.env.PUBLIC_APP_URL || 'https://your-gym-app.vercel.app'

    const data = await resend.emails.send({
      from: 'IRON GYM Operations <onboarding@yourdomain.com>',
      to: [email],
      subject: 'Official Welcome & Account Confirmation — IRON GYM',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; background-color: #020617; color: #f8fafc; padding: 40px 20px;">
          <table align="center" width="100%" style="max-width: 600px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px;">
            <tr>
              <td>
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px;">IRON <span style="color: #6366f1;">GYM</span></h1>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">OFFICIAL MEMBERSHIP CONFIRMATION</p>
                <hr style="border-color: #1e293b; margin: 20px 0;" />
                
                <p style="color: #e2e8f0; font-size: 15px;">Dear <strong>${full_name}</strong>,</p>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                  Thank you for joining <strong>IRON GYM</strong>. Your <strong>${plan_name}</strong> membership is now active. You may log in to access your digital gate pass and manage your training routines.
                </p>

                <div style="background-color: #020617; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin: 20px 0;">
                  <p style="margin: 4px 0; color: #f8fafc; font-size: 13px;"><strong>Member Name:</strong> ${full_name}</p>
                  <p style="margin: 4px 0; color: #f8fafc; font-size: 13px;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 4px 0; color: #818cf8; font-size: 13px;"><strong>Plan:</strong> ${plan_name}</p>
                </div>

                <a href="${appUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 12px; display: inline-block; text-transform: uppercase;">
                  Log In to Member Terminal
                </a>

                <p style="color: #64748b; font-size: 11px; margin-top: 30px;">
                  If you have any questions regarding your facility access, please contact staff at the front desk.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}