const router = require('express').Router()
const auth = require('../middleware/auth')
const VitalRecord = require('../models/VitalRecord')
router.post('/save', auth, async(req,res) => { try { const r=await VitalRecord.create({...req.body,userId:req.userId}); res.json({success:true,record:r}) } catch(e){res.status(500).json({message:e.message})} })
router.get('/history', auth, async(req,res) => { try { const r=await VitalRecord.find({userId:req.userId}).sort({createdAt:-1}).limit(100); res.json({records:r}) } catch(e){res.status(500).json({message:e.message})} })
module.exports = router