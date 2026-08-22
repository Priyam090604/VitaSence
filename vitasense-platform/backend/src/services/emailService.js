const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST||'smtp.gmail.com', port: parseInt(process.env.SMTP_PORT||'587'), secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
async function sendEmergencyAlert(vitals) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) { console.log('📧 Emergency alert (mock):', vitals.heartRate, vitals.spo2); return }
  const html = `<div style="font-family:Arial;max-width:600px"><div style="background:#dc2626;padding:20px;border-radius:8px 8px 0 0"><h1 style="color:white;margin:0">🚨 MEDICAL EMERGENCY ALERT</h1></div><div style="background:#1e293b;padding:20px;color:#e2e8f0"><p>Critical vitals on VitaSense:</p><p>❤️ Heart Rate: ${vitals.heartRate} BPM</p><p>💧 SpO₂: ${vitals.spo2}%</p><p>🌡️ Temperature: ${vitals.temperature}°C</p><p style="color:#f87171"><strong>Check on the patient immediately. Call emergency services if needed.</strong></p></div></div>`
  await transporter.sendMail({ from: `"VitaSense Emergency" <${process.env.SMTP_USER}>`, to: process.env.EMERGENCY_EMAIL||process.env.SMTP_USER, subject: '🚨 EMERGENCY ALERT', html })
}
module.exports = { sendEmergencyAlert }