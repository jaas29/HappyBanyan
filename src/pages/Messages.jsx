import { useState, useEffect, useRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, getDocs, doc, getDoc
} from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

export default function Messages() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  const [partner, setPartner] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Find the partner (other user with the same familyCode)
  useEffect(() => {
    if (!user) return

    async function findPartner() {
      try {
        const myDoc = await getDoc(doc(db, 'users', user.uid))
        if (!myDoc.exists()) {
          setLoading(false)
          return
        }

        const myData = myDoc.data()
        const familyCode = myData.familyCode

        if (!familyCode) {
          setLoading(false)
          return
        }

        const usersQuery = query(
          collection(db, 'users'),
          where('familyCode', '==', familyCode)
        )
        const snapshot = await getDocs(usersQuery)
        const partnerDoc = snapshot.docs.find(d => d.id !== user.uid)

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

  // Listen for messages in real time
  useEffect(() => {
    if (!user || !partner) return

    // Build a conversationId from sorted UIDs so both users query the same stream
    const ids = [user.uid, partner.uid].sort()
    const conversationId = ids.join('_')

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    )

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }, (err) => {
      console.error('Messages listener error:', err)
      console.error('If index needed, click this link:', err.message)
    })

    return unsub
  }, [user, partner])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !partner || sending) return

    setSending(true)
    const ids = [user.uid, partner.uid].sort()
    const conversationId = ids.join('_')

    try {
      const docRef = await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: user.uid,
        senderName: user.displayName || 'Me',
        text: text.trim(),
        timestamp: serverTimestamp(),
      })
      setText('')
      inputRef.current?.focus()
    } catch (err) {
      console.error('Send failed:', err)
      toast.error('Could not send message.')
    }
    setSending(false)
  }

  function formatTime(timestamp) {
    if (!timestamp) return ''
    const date = timestamp.toDate()
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  function formatDateLabel(timestamp) {
    if (!timestamp) return ''
    const date = timestamp.toDate()
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
  }

  // Group messages by day for date separators
  function getDateLabel(msg, idx) {
    if (!msg.timestamp) return null
    const label = formatDateLabel(msg.timestamp)
    if (idx === 0) return label
    const prev = messages[idx - 1]
    if (!prev.timestamp) return label
    const prevLabel = formatDateLabel(prev.timestamp)
    return label !== prevLabel ? label : null
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="h-screen bg-[#FFF8F0] flex items-center justify-center">
        <p className="text-lg text-gray-500">Loading messages...</p>
      </div>
    )
  }

  // --- No partner found ---
  if (!partner) {
    return (
      <div className="h-screen bg-[#FFF8F0] flex flex-col">
        <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-200">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </header>
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="text-center space-y-3">
            <p className="text-2xl font-bold text-gray-700">No partner connected yet</p>
            <p className="text-lg text-gray-500">
              Ask your family member to sign up with the same <strong>family code</strong> you used during registration.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // --- Chat view ---
  return (
    <div className="h-screen bg-[#FFF8F0] flex flex-col">

      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
          <BackIcon />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-bold text-lg">
            {partner.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{partner.name}</p>
            <p className="text-sm text-gray-400 capitalize">{partner.role}</p>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">Send a message to start the conversation!</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user.uid
          const dateLabel = getDateLabel(msg, idx)

          return (
            <div key={msg.id}>
              {dateLabel && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-500 text-sm font-medium px-4 py-1 rounded-full">
                    {dateLabel}
                  </span>
                </div>
              )}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                <div
                  className={`max-w-[75%] px-5 py-3 rounded-2xl ${
                    isMe
                      ? 'bg-[#7C3AED] text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-lg leading-relaxed">{msg.text}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'} text-right`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="px-6 py-4 bg-white border-t border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-5 py-3 rounded-full border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-12 h-12 bg-[#7C3AED] rounded-full flex items-center justify-center hover:bg-[#6D28D9] transition-colors disabled:opacity-40"
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  )
}
