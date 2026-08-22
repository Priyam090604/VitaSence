import { useState, useRef, useCallback } from 'react'
export function useVoice(onResult) {
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)
  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = false
    rec.onresult = (e) => { onResult(e.results[0][0].transcript); setListening(false) }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recRef.current = rec; rec.start(); setListening(true)
  }, [onResult])
  const stop = useCallback(() => { recRef.current?.stop(); setListening(false) }, [])
  return { listening, start, stop }
}