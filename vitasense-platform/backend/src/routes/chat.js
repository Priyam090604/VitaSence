const router = require('express').Router()
const axios = require('axios')
const FALLBACK=(msg,v)=>{const l=msg.toLowerCase();if(l.includes('heart')||l.includes('hr'))return `Heart rate: ${v.heartRate} BPM. ${v.heartRate>100?'Elevated — please rest.':'Within normal 60-100 BPM range.'}`;if(l.includes('spo2')||l.includes('oxygen'))return `SpO₂: ${v.spo2}%. ${v.spo2<95?'Below normal (95-100%) — seek attention.':'Excellent!'} Not medical advice.`;if(l.includes('temperature'))return `Temperature: ${v.temperature}°C. ${v.temperature>37.5?'Slightly elevated.':'Normal.'} Not medical advice.`;if(l.includes('stress'))return 'Stress tips: 4-7-8 breathing, short walks, limit caffeine.';return `Your vitals look ${v.spo2>=95&&v.heartRate<=100?'good':'to need monitoring'} (HR:${v.heartRate}, SpO₂:${v.spo2}%). Consult a healthcare professional.\n\n`}
router.post('/', async(req,res)=>{
  const{message,vitals={},sessionId}=req.body
  try{
    const apiKey=process.env.GEMINI_API_KEY
    if(!apiKey) throw new Error('No key')
    const prompt=`You are VitaBot, a compassionate AI health assistant. Patient vitals: HR:${vitals.heartRate} BPM, SpO₂:${vitals.spo2}%, Temp:${vitals.temperature}°C. Question: "${message}". Reply in 2-3 short paragraphs.`
    const{data}=await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,{contents:[{parts:[{text:prompt}]}]},{timeout:10000})
    const response=data.candidates?.[0]?.content?.parts?.[0]?.text||FALLBACK(message,vitals)
    res.json({response,source:'gemini'})
  }catch{res.json({response:FALLBACK(message,vitals),source:'fallback'})}
})
module.exports = router