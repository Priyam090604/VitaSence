export function calcHealthScore({ heartRate, spo2, temperature, hrv }) {
  let score = 100
  if (spo2<90) score-=40; else if (spo2<95) score-=20; else if (spo2<97) score-=10
  if (heartRate>120||heartRate<50) score-=25; else if (heartRate>100||heartRate<60) score-=10
  if (temperature>38.5||temperature<36) score-=20; else if (temperature>37.5) score-=8
  if (hrv<20) score-=15; else if (hrv<30) score-=7
  return Math.max(0,Math.min(100,score))
}
export function getStressLevel(hrv,heartRate) {
  const s=(100-hrv)*0.5+(heartRate-60)*0.3
  return s<30?'Low':s<60?'Medium':'High'
}
export function getRiskLevel(score) {
  if(score>=75) return{level:'LOW',label:'Healthy',color:'#22c55e',cls:'risk-low'}
  if(score>=50) return{level:'MEDIUM',label:'Monitor',color:'#f59e0b',cls:'risk-medium'}
  return{level:'HIGH',label:'Critical',color:'#ef4444',cls:'risk-high'}
}
export function predictNextVitals(history,steps=10) {
  if(history.length<5) return []
  const last=history.slice(-5)
  const avgHR=last.reduce((a,b)=>a+(b.heartRate||0),0)/last.length
  const avgSPO2=last.reduce((a,b)=>a+(b.spo2||0),0)/last.length
  const tHR=(last[last.length-1].heartRate-last[0].heartRate)/last.length
  const tSPO2=(last[last.length-1].spo2-last[0].spo2)/last.length
  return Array.from({length:steps},(_,i)=>({
    ts:'T+'+(i+1)+'m',
    heartRate:Math.round(Math.max(40,Math.min(180,avgHR+tHR*(i+1)+(Math.random()-.5)*3))),
    spo2:Math.round(Math.max(85,Math.min(100,avgSPO2+tSPO2*(i+1)+(Math.random()-.5)*.5))),
  }))
}