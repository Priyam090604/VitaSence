const router = require('express').Router()
const auth = require('../middleware/auth')
const Ambulance = require('../models/Ambulance')
const User = require('../models/User')
const { sendEmergencyAlert } = require('../services/emailService')

// Patient: Request ambulance
router.post('/request', auth, async (req, res) => {
  try {
    const { location, vitals, hospitalName } = req.body
    const patient = await User.findById(req.userId)

    const ambulance = await Ambulance.create({
      patientId: req.userId,
      patientName: patient.name,
      status: 'dispatched',
      patientLocation: location,
      ambulanceLocation: {
        lat: (location?.lat || 22.5726) + 0.02,
        lng: (location?.lng || 88.3639) + 0.01
      },
      vitals,
      hospitalName: hospitalName || 'City General Hospital',
      estimatedArrival: Math.floor(Math.random() * 8) + 4  // 4-12 min
    })

    // Send emergency email
    if (vitals) sendEmergencyAlert({ ...vitals, ambulanceRequested: true }).catch(console.error)

    // Notify via socket
    req.app.get('io')?.emit('ambulance_dispatched', {
      ambulanceId: ambulance.ambulanceId,
      patientName: patient.name,
      estimatedArrival: ambulance.estimatedArrival
    })

    res.status(201).json({ success: true, ambulance })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// Patient: Track my ambulance (with simulated movement)
router.get('/track/:id', auth, async (req, res) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id)
    if (!ambulance) return res.status(404).json({ message: 'Not found' })

    // Simulate ambulance moving toward patient
    const minutesElapsed = (Date.now() - ambulance.createdAt) / 60000
    const progress = Math.min(1, minutesElapsed / ambulance.estimatedArrival)
    const patLat = ambulance.patientLocation?.lat || 22.5726
    const patLng = ambulance.patientLocation?.lng || 88.3639
    const ambStartLat = ambulance.ambulanceLocation?.lat || patLat + 0.02
    const ambStartLng = ambulance.ambulanceLocation?.lng || patLng + 0.01

    // Interpolate toward patient
    const currentLat = ambStartLat + (patLat - ambStartLat) * progress + (Math.random() - 0.5) * 0.001
    const currentLng = ambStartLng + (patLng - ambStartLng) * progress + (Math.random() - 0.5) * 0.001
    const remaining  = Math.max(0, Math.ceil(ambulance.estimatedArrival - minutesElapsed))
    const status     = progress >= 0.95 ? 'arrived' : progress >= 0.3 ? 'en_route' : 'dispatched'

    res.json({
      ambulance: {
        ...ambulance.toObject(),
        ambulanceLocation: { lat: currentLat, lng: currentLng },
        estimatedArrival: remaining,
        status,
        progress: Math.round(progress * 100)
      }
    })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// Patient: My ambulance requests
router.get('/my', auth, async (req, res) => {
  try {
    const requests = await Ambulance.find({ patientId: req.userId }).sort({ createdAt: -1 })
    res.json({ requests })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

module.exports = router
