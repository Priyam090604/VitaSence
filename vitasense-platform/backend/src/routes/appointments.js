const router = require('express').Router()
const auth = require('../middleware/auth')
const Appointment = require('../models/Appointment')
const User = require('../models/User')

// Patient: Book appointment
router.post('/book', auth, async (req, res) => {
  try {
    const { doctorId, date, time, reason, vitals } = req.body
    const patient = await User.findById(req.userId)
    const doctor  = await User.findById(doctorId)
    if (!doctor || doctor.role !== 'doctor')
      return res.status(404).json({ message: 'Doctor not found' })

    const appt = await Appointment.create({
      patientId:    req.userId,
      doctorId,
      patientName:  patient.name,
      doctorName:   doctor.name,
      date, time, reason,
      vitalsAtTime: vitals || {}
    })

    // Notify via socket if available
    req.app.get('io')?.to('doctor_' + doctorId).emit('new_appointment', {
      message: `New appointment from ${patient.name}`,
      appointment: appt
    })

    res.status(201).json({ success: true, appointment: appt })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// Patient: My appointments
router.get('/my', auth, async (req, res) => {
  try {
    const appts = await Appointment.find({ patientId: req.userId })
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 })
    res.json({ appointments: appts })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// Doctor: All appointments for me
router.get('/doctor', auth, async (req, res) => {
  try {
    const appts = await Appointment.find({ doctorId: req.userId })
      .populate('patientId', 'name email age')
      .sort({ createdAt: -1 })
    res.json({ appointments: appts })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// Doctor: Update appointment status / add notes
router.patch('/:id', auth, async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
    res.json({ success: true, appointment: appt })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

// Get all doctors (for patient to browse)
router.get('/doctors', auth, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }, 'name email specialization')
    res.json({ doctors })
  } catch (e) { res.status(500).json({ message: e.message }) }
})

module.exports = router
