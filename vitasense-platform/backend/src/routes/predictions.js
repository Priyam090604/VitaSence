const router = require('express').Router()
const axios = require('axios')
router.post('/', async(req,res) => {
  try { const{data}=await axios.post(process.env.AI_SERVICE_URL+'/predict',req.body,{timeout:5000}); res.json(data) }
  catch {
    const{heart_rate:hr,spo2,temperature:temp,hrv}=req.body
    const hR=Math.min(95,Math.max(2,(hr-60)*0.9+(100-spo2)*3+(temp-36)*5))
    const sR=Math.min(95,Math.max(1,(100-spo2)*4+(temp-36)*3))
    const stR=Math.min(95,Math.max(5,(100-(hrv||45))*0.7+(hr-60)*0.4))
    res.json({heartRisk:hR>50?'High':hR>25?'Medium':'Low',strokeRisk:sR>40?'High':sR>20?'Medium':'Low',stressLevel:stR>60?'High':stR>35?'Medium':'Low',heartRiskProb:Math.round(hR),strokeRiskProb:Math.round(sR),confidence:0.78,source:'fallback'})
  }
})
module.exports = router