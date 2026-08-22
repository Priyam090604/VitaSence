const router = require('express').Router()
const{sendEmergencyAlert}=require('../services/emailService')
router.post('/alert', async(req,res) => {
  try { const{vitals,type}=req.body; await sendEmergencyAlert(vitals); req.app.get('io')?.emit('emergency',{message:`Emergency alert triggered (${type})`,vitals}); res.json({success:true}) }
  catch(e){res.status(500).json({success:false,message:e.message})}
})
module.exports = router