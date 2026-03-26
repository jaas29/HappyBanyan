import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useRef, useState } from 'react'

import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Weather from './pages/Weather'
import Tasks from './pages/Tasks'
import Messages from './pages/Messages'
import QuickLinks from './pages/QuickLinks'
import SharedTasks from './pages/SharedTasks'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

// music
import bgMusic from './assets/music/backgroundmusic.mp3'

// 🔊 Volume ON icon
const VolumeOnIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19 5a7 7 0 0 1 0 14" />
    <path d="M15 9a3 3 0 0 1 0 6" />
  </svg>
)

// 🔇 Volume OFF icon
const VolumeOffIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
)

function App() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleMusic = () => {
    if (!isPlaying) {
      audioRef.current.volume = 0.2
      audioRef.current.play()
      setIsPlaying(true)
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  return (
    <BrowserRouter>

      {/* Hidden audio */}
      <audio ref={audioRef} loop>
        <source src={bgMusic} type="audio/mpeg" />
      </audio>

      {/* 🔊 Bottom-left toggle button */}
      <button
        onClick={toggleMusic}
        className="fixed bottom-4 left-4 bg-black/80 hover:bg-black text-white p-3 rounded-full shadow-lg z-50 transition-all active:scale-95"
      >
        {isPlaying ? <VolumeOnIcon /> : <VolumeOffIcon />}
      </button>

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <Weather />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quick-links"
          element={
            <ProtectedRoute>
              <QuickLinks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shared-tasks"
          element={
            <ProtectedRoute>
              <SharedTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App