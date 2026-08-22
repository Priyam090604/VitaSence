require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./src/models/User')
mongoose.connect(process.env.MONGO_URI||'mongodb://localhost:27017/vitasense').then(async()=>{
  try {
    await User.deleteMany({email:{$in:['doctor@vitasense.ai','patient@vitasense.ai']}})
    await User.create([{name:'Dr. Demo',email:'doctor@vitasense.ai',password:'demo123',role:'doctor'},{name:'Demo Patient',email:'patient@vitasense.ai',password:'demo123',role:'patient'}])
    console.log('✅ Demo accounts created')
    console.log('   Doctor:  doctor@vitasense.ai / demo123')
    console.log('   Patient: patient@vitasense.ai / demo123')
  } catch(e) { console.error(e.message) }
  process.exit()
})