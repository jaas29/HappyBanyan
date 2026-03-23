import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import DailyCheckIn from '../components/DailyCheckIn'


// Icons


const LogoutIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

// Tile icons (white, larger for desktop)
const MessageIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const TaskIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

const CloudIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
)

const LinkIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const SharedTasksIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const HeartIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

// Sidebar nav icons
const HomeNavIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24"
    fill={active ? '#7C3AED' : 'none'}
    stroke={active ? '#7C3AED' : '#9CA3AF'}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" stroke={active ? 'white' : '#9CA3AF'} fill={active ? 'white' : 'none'} />
  </svg>
)

const MsgNavIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#7C3AED' : '#9CA3AF'}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const TasksNavIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#7C3AED' : '#9CA3AF'}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <polyline points="3 6 4 7 6 5" />
    <polyline points="3 12 4 13 6 11" />
    <polyline points="3 18 4 19 6 17" />
  </svg>
)

const SettingsNavIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#7C3AED' : '#9CA3AF'}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

// Data

const tiles = [
  { label: 'Messages',     color: '#7C3AED', Icon: MessageIcon     },
  { label: 'My Tasks',     color: '#10B981', Icon: TaskIcon         },
  { label: 'Weather',      color: '#3B82F6', Icon: CloudIcon        },
  { label: 'Quick Links',  color: '#F59E0B', Icon: LinkIcon         },
  { label: 'Shared Tasks', color: '#EC4899', Icon: SharedTasksIcon  },
  { label: 'Cheer Me Up!', color: '#EAB308', Icon: HeartIcon        },
]

const navItems = [
  { label: 'Home',     Icon: HomeNavIcon,     active: true  },
  { label: 'Messages', Icon: MsgNavIcon,      active: false },
  { label: 'Tasks',    Icon: TasksNavIcon,    active: false },
  { label: 'Settings', Icon: SettingsNavIcon, active: false },
]

// Dashboard

export default function Dashboard() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()
  const [showCheckIn, setShowCheckIn] = useState(false)

  useEffect(() => {
    if (!user) return
    const today = new Date().toISOString().slice(0, 10)
    const q = query(
      collection(db, 'checkIns'),
      where('userId', '==', user.uid),
      where('date', '==', today)
    )
    getDocs(q).then((snap) => {
      if (snap.empty) setShowCheckIn(true)
    })
  }, [user])

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="h-screen bg-[#FFF8F0] flex flex-col overflow-hidden">

      {showCheckIn && (
        <DailyCheckIn userId={user?.uid} onClose={() => setShowCheckIn(false)} />
      )}

      {/* ── Top Header ── */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">Happy Banyan</span>
        </div>
        <span className="text-2xl font-semibold text-gray-700">
          Hi, {user?.displayName || user?.email || 'Friend'}!
        </span>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 font-medium">
          <LogoutIcon />
          <span className="text-base">Log out</span>
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col py-8 px-4 gap-2 shrink-0">
          {navItems.map(({ label, Icon, active }) => (
            <button
              key={label}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors ${
                active
                  ? 'bg-purple-50 text-[#7C3AED]'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon active={active} />
              {label}
            </button>
          ))}
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto px-10 py-8 space-y-6">

          {/* Banyan Card */}
          <div className="bg-[#d1fae5] rounded-2xl px-10 py-8 flex items-center gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold text-gray-900">Your Banyan</h2>
              <p className="text-[#166534] text-lg">Your Banyan is fully grown!</p>
              <div className="mt-3 bg-white rounded-full px-6 py-2 inline-block shadow-sm self-start">
                <span className="font-semibold text-gray-800 text-base">Tasks Completed: 10</span>
              </div>
            </div>
          </div>

          {/* Feature Tiles */}
          <div className="grid grid-cols-3 gap-5">
            {tiles.map(({ label, color, Icon }) => (
              <button
                key={label}
                onClick={() => {
                  if (label === 'Messages') navigate('/messages')
                  if (label === 'Weather') navigate('/weather')
                  if (label === 'My Tasks') navigate('/tasks')
                  if (label === 'Quick Links') navigate('/quick-links')
                  if (label === 'Shared Tasks') navigate('/shared-tasks')
                }}
                style={{ backgroundColor: color }}
                className="rounded-2xl py-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
              >
                <Icon />
                <span className="text-white font-bold text-xl text-center leading-snug px-2">
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Daily Quote */}
          <div className="bg-white rounded-2xl px-8 py-6 text-center shadow-sm">
            <p className="text-xl text-gray-500 italic">"Every day you growth better!"</p>
          </div>

        </main>
      </div>
    </div>
  )
}
