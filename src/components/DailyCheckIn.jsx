import { useState } from 'react'
import { db } from '../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const moods = [
  { key: 'sad',     emoji: '😢', label: 'Not great',  bg: '#FEE2E2', border: '#F87171', text: '#B91C1C' },
  { key: 'neutral', emoji: '😐', label: 'Okay',       bg: '#FEF9C3', border: '#FBBF24', text: '#92400E' },
  { key: 'happy',   emoji: '😊', label: 'Great!',     bg: '#D1FAE5', border: '#34D399', text: '#065F46' },
]

export default function DailyCheckIn({ userId, onClose }) {
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSelect(mood) {
    if (submitting || done) return
    setSelected(mood.key)
    setSubmitting(true)

    const today = new Date().toISOString().slice(0, 10)
    await addDoc(collection(db, 'checkIns'), {
      userId,
      date: today,
      mood: mood.key,
      createdAt: serverTimestamp(),
    })

    setDone(true)
    setSubmitting(false)
    setTimeout(onClose, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl px-10 py-10 flex flex-col items-center gap-6 w-full max-w-md mx-4">

        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Daily Check-In
        </h2>
        <p className="text-gray-500 text-lg text-center -mt-2">
          How are you feeling today?
        </p>

        <div className="flex gap-6 mt-2">
          {moods.map((mood) => {
            const isSelected = selected === mood.key
            return (
              <button
                key={mood.key}
                onClick={() => handleSelect(mood)}
                disabled={submitting || done}
                style={{
                  backgroundColor: isSelected ? mood.bg : '#F9FAFB',
                  borderColor: isSelected ? mood.border : '#E5E7EB',
                  transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                }}
                className="flex flex-col items-center gap-2 px-5 py-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:scale-105 disabled:cursor-default"
              >
                <span className="text-6xl leading-none">{mood.emoji}</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: isSelected ? mood.text : '#6B7280' }}
                >
                  {mood.label}
                </span>
              </button>
            )
          })}
        </div>

        {done && (
          <p className="text-green-600 font-semibold text-base animate-pulse">
            Thanks! Have a great day 🌿
          </p>
        )}
      </div>
    </div>
  )
}
