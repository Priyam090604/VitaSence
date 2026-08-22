const mongoose = require('mongoose')
const s = new mongoose.Schema({ userId:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, heartRate:Number, spo2:Number, temperature:Number, movement:Number, hrv:Number, healthScore:Number, heartRisk:String, strokeRisk:String, stressLevel:String },{timestamps:true})
s.index({userId:1,createdAt:-1})
module.exports = mongoose.model('VitalRecord',s)