const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const sign = (userId,role) => jwt.sign({userId,role}, process.env.JWT_SECRET||'vitasense_secret', {expiresIn:'7d'})
router.post('/signup', async (req,res) => {
  try {
    const{name,email,password,role}=req.body
    if(await User.findOne({email})) return res.status(400).json({message:'Email already registered'})
    const user=await User.create({name,email,password,role})
    const token=sign(user._id,user.role)
    res.status(201).json({token,user:{id:user._id,name:user.name,email:user.email,role:user.role}})
  } catch(e){res.status(500).json({message:e.message})}
})
router.post('/login', async (req,res) => {
  try {
    const{email,password}=req.body
    const user=await User.findOne({email})
    if(!user||!(await user.comparePassword(password))) return res.status(401).json({message:'Invalid credentials'})
    const token=sign(user._id,user.role)
    res.json({token,user:{id:user._id,name:user.name,email:user.email,role:user.role}})
  } catch(e){res.status(500).json({message:e.message})}
})
module.exports = router