// Central route registry — import this in index.js
module.exports = (app) => {
  app.use('/api/auth',         require('./auth'))
  app.use('/api/vitals',       require('./vitals'))
  app.use('/api/chat',         require('./chat'))
  app.use('/api/emergency',    require('./emergency'))
  app.use('/api/predictions',  require('./predictions'))
  app.use('/api/appointments', require('./appointments'))
  app.use('/api/ambulance',    require('./ambulance'))
  app.use('/api/doctor',       require('./doctor'))
}
