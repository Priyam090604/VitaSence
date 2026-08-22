const jwt = require('jsonwebtoken')
module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ','')
    if (!token) return res.status(401).json({ message: 'No token' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET||'vitasense_secret')
    req.userId = decoded.userId; req.user = decoded; next()
  } catch { res.status(401).json({ message: 'Invalid token' }) }
}