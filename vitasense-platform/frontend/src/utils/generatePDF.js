import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
export function generateHealthReport(vitals, predictions, user) {
  const doc = new jsPDF()
  const now = new Date().toLocaleString()
  doc.setFillColor(10,14,26); doc.rect(0,0,210,40,'F')
  doc.setTextColor(45,212,191); doc.setFontSize(22); doc.setFont('helvetica','bold')
  doc.text('VitaSense Health Report',14,22)
  doc.setTextColor(200,200,200); doc.setFontSize(10)
  doc.text('AI-Powered Health Intelligence Platform',14,32)
  doc.setTextColor(20,20,20); doc.setFontSize(12); doc.setFont('helvetica','bold')
  doc.text('Patient Information',14,55)
  doc.setFont('helvetica','normal'); doc.setFontSize(10)
  doc.text('Name: '+(user?.name||'Patient'),14,65)
  doc.text('Generated: '+now,14,72)
  doc.text('Role: '+(user?.role||'Patient'),14,79)
  autoTable(doc,{ startY:90, head:[['Parameter','Value','Normal Range','Status']], body:[['Heart Rate',vitals.heartRate+' BPM','60-100 BPM',vitals.heartRate>100?'ABNORMAL':'NORMAL'],['SpO2',vitals.spo2+'%','95-100%',vitals.spo2<95?'ABNORMAL':'NORMAL'],['Temperature',vitals.temperature+'C','36.1-37.2C',vitals.temperature>37.5?'ELEVATED':'NORMAL'],['Health Score',vitals.healthScore+'/100','75-100',vitals.healthScore<75?'ATTENTION':'HEALTHY']], headStyles:{fillColor:[13,18,36],textColor:[45,212,191]} })
  const y = doc.lastAutoTable.finalY+15
  autoTable(doc,{ startY:y, head:[['Risk','Level','Recommendation']], body:[['Cardiac Risk',predictions?.heartRisk||'Low','Monitor trends'],['Stroke Risk',predictions?.strokeRisk||'Low','Keep SpO2>95%'],['Stress',predictions?.stressLevel||'Normal','Practice breathing']], headStyles:{fillColor:[13,18,36],textColor:[45,212,191]} })
  doc.setFontSize(8); doc.setTextColor(150)
  doc.text('For informational purposes only. Not a medical diagnosis.',14,doc.internal.pageSize.height-15)
  doc.save('vitasense-report-'+Date.now()+'.pdf')
}