import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, full_name, plan_name } = req.body

  if (!email || !full_name) {
    return res.status(400).json({ error: 'Missing recipient details' })
  }

  try {
    // Read secret credentials safely from environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // e.g. michael.nagui.kiriakos@gmail.com
        pass: process.env.GMAIL_APP_PASS  // Your 16-character Google App Password
      }
    })

    const info = await transporter.sendMail({
      from: `"IRON GYM" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Welcome to IRON GYM! Your Pass Credentials Inside',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 24px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1; margin-bottom: 8px;">Welcome to IRON GYM, ${full_name}!</h1>
          <p style="color: #94a3b8; font-size: 14px;">Your digital gym pass is officially active.</p>
          <div style="background-color: #1e293b; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Active Plan:</strong> ${plan_name || 'Monthly Pass'}</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Account Email:</strong> ${email}</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">Log in to your Member Portal anytime to view and scan your digital QR pass at the front desk!</p>
        </div>
      `
    })

    return res.status(200).json({ success: true, messageId: info.messageId })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}