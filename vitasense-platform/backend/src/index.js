require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', methods: ['GET', 'POST'] }
})

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }))

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vitasense')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(e => console.warn('⚠️  MongoDB:', e.message, '(running without DB)'))

const vitalsSimulator = require('./services/vitalsSimulator')
vitalsSimulator.start(io)
app.set('io', io)

// Socket rooms for doctor notifications
io.on('connection', socket => {
  socket.on('join_doctor_room', (doctorId) => socket.join('doctor_' + doctorId))
})

// All routes
app.use('/api/auth',         require('./routes/auth'))
app.use('/api/vitals',       require('./routes/vitals'))
app.use('/api/chat',         require('./routes/chat'))
app.use('/api/emergency',    require('./routes/emergency'))
app.use('/api/predictions',  require('./routes/predictions'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/ambulance',    require('./routes/ambulance'))
app.use('/api/doctor',       require('./routes/doctor'))

// ESP32 data ingestion — receives real sensor data
app.post('/api/esp32/data', (req, res) => {
  const data = req.body
  const processed = {
    heartRate: Math.round(data.heartRate || data.hr || 75),
    spo2: Math.round(data.spo2 || 98),
    temperature: parseFloat((data.temperature || 37.1).toFixed(1)),
    movement: parseFloat((data.movement || 0.3).toFixed(3)),
    hrv: Math.round(data.hrv || 45),
    ts: new Date().toLocaleTimeString()
  }
  io.emit('vitals', processed)
  if (processed.spo2 < 90 || processed.heartRate > 120) {
    io.emit('emergency', { message: `SpO₂: ${processed.spo2}% HR: ${processed.heartRate}`, vitals: processed })
    require('./services/emailService').sendEmergencyAlert(processed).catch(console.error)
  }
  res.json({ success: true, processed })
})

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`🚀 VitaSense Backend on port ${PORT}`))
