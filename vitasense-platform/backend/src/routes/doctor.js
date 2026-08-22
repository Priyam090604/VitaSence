const router = require('express').Router()
const auth = require('../middleware/auth')
const User = require('../models/User')
const Appointment = require('../models/Appointment')
const HealthReport = require('../models/HealthReport')
const VitalRecord = require('../models/VitalRecord')

// Doctor: Get all their patients (who have had appointments)
router.get('/patients', auth, async (req, res) => {
  try {
    const appts = await Appointment.find({ doctorId: req.userId })
      .distinct('patientId')
    const patients = await User.find({ _id: { $in: appts } }, 'name email age createdAt')
    res.json({ patients })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// Doctor: Get specific patient's health data
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const patient  = await User.findById(req.params.patientId, 'name email age')
    const vitals   = await VitalRecord.find({ userId: req.params.patientId }).sort({ createdAt: -1 }).limit(50)
    const reports  = await HealthReport.find({ patientId: req.params.patientId }).sort({ createdAt: -1 }).limit(10)
    const appts    = await Appointment.find({ patientId: req.params.patientId, doctorId: req.userId }).sort({ createdAt: -1 })
    res.json({ patient, vitals, reports, appointments: appts })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// Doctor: Write report / prescription for patient
router.post('/report', auth, async (req, res) => {
  try {
    const report = await HealthReport.create({ ...req.body, doctorId: req.userId })
    res.status(201).json({ success: true, report })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// Doctor stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalAppts     = await Appointment.countDocuments({ doctorId: req.userId })
    const pendingAppts   = await Appointment.countDocuments({ doctorId: req.userId, status: 'pending' })
    const completedAppts = await Appointment.countDocuments({ doctorId: req.userId, status: 'completed' })
    const uniquePatients = await Appointment.distinct('patientId', { doctorId: req.userId })
    res.json({ totalAppts, pendingAppts, completedAppts, totalPatients: uniquePatients.length })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

module.exports = router
