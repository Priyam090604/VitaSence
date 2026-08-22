const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({ name:{type:String,required:true}, email:{type:String,required:true,unique:true,lowercase:true}, password:{type:String,required:true}, role:{type:String,enum:['patient','doctor'],default:'patient'}, age:{type:Number,default:30}, specialization:String, assignedPatients:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}] },{timestamps:true})
userSchema.pre('save',async function(next){if(!this.isModified('password'))return next();this.password=await bcrypt.hash(this.password,10);next()})
userSchema.methods.comparePassword=function(p){return bcrypt.compare(p,this.password)}
module.exports = mongoose.model('User',userSchema)