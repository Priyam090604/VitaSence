let interval = null
let baseHR = 72, baseSPO2 = 98, baseTemp = 37.1
module.exports = {
  start(io) {
    if (interval) return
    interval = setInterval(() => {
      baseHR += (Math.random() - 0.5) * 2; baseHR = Math.max(60, Math.min(105, baseHR))
      baseSPO2 += (Math.random() - 0.5) * 0.3; baseSPO2 = Math.max(94, Math.min(100, baseSPO2))
      baseTemp += (Math.random() - 0.5) * 0.05; baseTemp = Math.max(36.4, Math.min(37.8, baseTemp))
      const hrv = Math.round(30 + Math.sin(Date.now() / 10000) * 20 + Math.random() * 10)
      io.emit('vitals', { heartRate: Math.round(baseHR), spo2: Math.round(baseSPO2 * 10) / 10, temperature: Math.round(baseTemp * 10) / 10, movement: Math.round(Math.random() * 0.8 * 100) / 100, hrv, ts: new Date().toLocaleTimeString() })
    }, 2000)
    console.log('📡 Vitals simulator active')
  },
  stop() { if (interval) { clearInterval(interval); interval = null } }
}