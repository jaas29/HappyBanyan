import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import {
  collection, query, where, onSnapshot, doc, getDoc, getDocs
} from 'firebase/firestore'
import { auth, db } from '../firebase/config'

// Constants

const CATEGORIES = [
  { id: 'medicine',    label: 'Medicine',    color: '#EF4444', bg: '#FEE2E2' },
  { id: 'appointment', label: 'Appointment', color: '#3B82F6', bg: '#DBEAFE' },
  { id: 'grocery',     label: 'Grocery',     color: '#10B981', bg: '#D1FAE5' },
  { id: 'personal',    label: 'Personal',    color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'other',       label: 'Other',       color: '#F59E0B', bg: '#FEF3C7' },
]

function getCat(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[4]
}

function formatTime(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// Icons

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

// Task Card (read-only)

function TaskCard({ task }) {
  const cat = getCat(task.category)
  const timeLabel = formatTime(task.time)

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${task.completed ? 'opacity-60' : ''}`}
      style={{ borderColor: cat.color }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Completion indicator */}
          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center`}
            style={{ borderColor: task.completed ? cat.color : '#D1D5DB', backgroundColor: task.completed ? cat.color : 'transparent' }}>
            {task.completed && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-gray-900 text-base truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: cat.color, backgroundColor: cat.bg }}>
                {cat.label}
              </span>
              {timeLabel && (
                <span className="text-xs text-gray-500">{timeLabel}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main page

export default function SharedTasks() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  const [partner, setPartner] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('today') // 'today' | 'upcoming'

  // Find partner
  useEffect(() => {
    if (!user) return

    async function findPartner() {
      try {
        const myDoc = await getDoc(doc(db, 'users', user.uid))
        if (!myDoc.exists()) { setLoading(false); return }

        const { familyCode } = myDoc.data()
        if (!familyCode) { setLoading(false); return }

        const snap = await getDocs(query(collection(db, 'users'), where('familyCode', '==', familyCode)))
        const partnerDoc = snap.docs.find(d => d.id !== user.uid)
        if (partnerDoc) {
          setPartner({ uid: partnerDoc.id, ...partnerDoc.data() })
        }
      } catch (err) {
        console.error('Error finding partner:', err)
      }
      setLoading(false)
    }

    findPartner()
  }, [user])

  // Listen to partner's tasks in real time
  useEffect(() => {
    if (!partner) return

    const q = query(collection(db, 'tasks'), where('userId', '==', partner.uid))
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        if (a.time && b.time) return a.time.localeCompare(b.time)
        if (a.time) return -1
        if (b.time) return 1
        return 0
      })
      setTasks(data)
    })

    return () => unsub()
  }, [partner])

  const today = todayStr()

  const filteredTasks = view === 'today'
    ? tasks.filter(t => t.date === today)
    : tasks.filter(t => t.date > today)

  // Group by date for upcoming view
  const grouped = filteredTasks.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = []
    acc[t.date].push(t)
    return acc
  }, {})

  const completed = filteredTasks.filter(t => t.completed).length

  return (
    <div className="h-screen bg-[#FFF8F0] flex flex-col overflow-hidden">

      {/* Header */}
      <header className="flex items-center gap-4 px-8 py-4 bg-white border-b border-gray-200 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <BackIcon />
          <span className="text-base font-medium">Back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shared Tasks</h1>
          {partner && (
            <p className="text-sm text-gray-500">{partner.name}'s tasks — read only</p>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-6 space-y-4">

        {loading && (
          <div className="flex justify-center pt-16">
            <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !partner && (
          <div className="text-center pt-16 text-gray-400 text-lg">
            No partner connected yet.
          </div>
        )}

        {!loading && partner && (
          <>
            {/* View toggle + summary */}
            <div className="flex items-center justify-between">
              <div className="flex bg-white rounded-xl border border-gray-200 p-1 gap-1">
                {['today', 'upcoming'].map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize ${
                      view === v ? 'bg-[#EC4899] text-white' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {v === 'today' ? 'Today' : 'Upcoming'}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {completed}/{filteredTasks.length} completed
              </span>
            </div>

            {/* Tasks */}
            {view === 'today' ? (
              filteredTasks.length === 0 ? (
                <p className="text-center text-gray-400 pt-12">No tasks for today.</p>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map(t => <TaskCard key={t.id} task={t} />)}
                </div>
              )
            ) : (
              Object.keys(grouped).length === 0 ? (
                <p className="text-center text-gray-400 pt-12">No upcoming tasks.</p>
              ) : (
                <div className="space-y-5">
                  {Object.keys(grouped).sort().map(date => (
                    <div key={date}>
                      <p className="text-sm font-semibold text-gray-500 mb-2">{formatDate(date)}</p>
                      <div className="space-y-3">
                        {grouped[date].map(t => <TaskCard key={t.id} task={t} />)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  )
}
