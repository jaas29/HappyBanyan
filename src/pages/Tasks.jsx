import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, where, serverTimestamp, increment,
} from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import toast from 'react-hot-toast'

// Constants 

const CATEGORIES = [
  { id: 'medicine',    label: 'Medicine',    color: '#EF4444', bg: '#FEE2E2' },
  { id: 'appointment', label: 'Appointment', color: '#3B82F6', bg: '#DBEAFE' },
  { id: 'grocery',     label: 'Grocery',     color: '#10B981', bg: '#D1FAE5' },
  { id: 'personal',    label: 'Personal',    color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'other',       label: 'Other',       color: '#F59E0B', bg: '#FEF3C7' },
]

const BLANK_FORM = {
  title: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  time: '',
  category: 'personal',
}

function formatTime(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function weekRange() {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function formatDate(dateStr) {
  // dateStr = "YYYY-MM-DD"
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function getCat(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[4]
}

// Icons

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// Task Card 

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const cat = getCat(task.category)
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4 border-l-4"
      style={{ borderLeftColor: cat.color }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task)}
        className="mt-1 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
        style={{
          borderColor: cat.color,
          backgroundColor: task.completed ? cat.color : 'transparent',
        }}
      >
        {task.completed && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: cat.bg, color: cat.color }}
          >
            {cat.label}
          </span>
          <span className="text-xs text-gray-400">{formatDate(task.date)}</span>
          {task.time && (
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {formatTime(task.time)}
            </span>
          )}
        </div>
        <p className={`text-lg font-semibold text-gray-800 ${task.completed ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-base text-gray-500 mt-0.5 leading-snug">{task.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

// Task Form Modal

function TaskModal({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(initial || BLANK_FORM)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {initial ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              placeholder="What do you need to do?"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              placeholder="Optional details..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-base font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              />
            </div>
            <div className="w-36">
              <label className="block text-base font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => set('category', cat.id)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all border-2"
                  style={{
                    backgroundColor: form.category === cat.id ? cat.color : cat.bg,
                    color: form.category === cat.id ? 'white' : cat.color,
                    borderColor: cat.color,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-base font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.title.trim()}
              className="flex-1 py-3 rounded-xl bg-[#10B981] text-white text-base font-semibold hover:bg-[#059669] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Tasks Page

export default function Tasks() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [viewMode, setViewMode] = useState('daily') // 'daily' | 'weekly'
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null) // null = adding new
  const [saving, setSaving] = useState(false)

  // Real-time Firestore listener
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      // sort by date, then by time within the same date
      data.sort((a, b) => {
        if (a.date < b.date) return -1
        if (a.date > b.date) return 1
        // same date: tasks with a time come before tasks without
        if (a.time && !b.time) return -1
        if (!a.time && b.time) return 1
        if (a.time && b.time) return a.time < b.time ? -1 : a.time > b.time ? 1 : 0
        return 0
      })
      setTasks(data)
    })
    return unsub
  }, [user])

  // Filtered tasks by view 
  const today = todayStr()
  const week = weekRange()

  const visibleTasks =
    viewMode === 'daily'
      ? tasks.filter((t) => t.date === today)
      : tasks.filter((t) => week.includes(t.date))

  // group by date for weekly view
  const grouped = {}
  visibleTasks.forEach((t) => {
    if (!grouped[t.date]) grouped[t.date] = []
    grouped[t.date].push(t)
  })
  const sortedDates = Object.keys(grouped).sort()

  // Handlers 

  function openAdd() {
    setEditingTask(null)
    setShowModal(true)
  }

  function openEdit(task) {
    setEditingTask(task)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingTask(null)
  }

  async function handleSave(form) {
    if (!user) return
    setSaving(true)
    try {
      const cat = getCat(form.category)
      if (editingTask) {
        await updateDoc(doc(db, 'tasks', editingTask.id), {
          title: form.title.trim(),
          description: form.description.trim(),
          date: form.date,
          time: form.time || '',
          category: form.category,
          color: cat.color,
        })
        toast.success('Task updated!')
      } else {
        await addDoc(collection(db, 'tasks'), {
          userId: user.uid,
          title: form.title.trim(),
          description: form.description.trim(),
          date: form.date,
          time: form.time || '',
          category: form.category,
          color: cat.color,
          completed: false,
          createdAt: serverTimestamp(),
        })
        toast.success('Task added!')
      }
      closeModal()
    } catch {
      toast.error('Something went wrong.')
    }
    setSaving(false)
  }

  async function handleToggle(task) {
    const nowCompleted = !task.completed
    try {
      await updateDoc(doc(db, 'tasks', task.id), { completed: nowCompleted })
      // update completedTasks counter on user doc
      await updateDoc(doc(db, 'users', user.uid), {
        completedTasks: increment(nowCompleted ? 1 : -1),
      })
      if (nowCompleted) toast.success('Task done! 🌱 Your tree grew!')
    } catch {
      toast.error('Could not update task.')
    }
  }

  async function handleDelete(task) {
    try {
      await deleteDoc(doc(db, 'tasks', task.id))
      if (task.completed) {
        await updateDoc(doc(db, 'users', user.uid), {
          completedTasks: increment(-1),
        })
      }
      toast.success('Task deleted.')
    } catch {
      toast.error('Could not delete task.')
    }
  }

  // Render

  const completedToday = tasks.filter((t) => t.date === today && t.completed).length
  const totalToday = tasks.filter((t) => t.date === today).length

  return (
    <div className="min-h-screen bg-[#FFF8F0]">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <BackIcon />
          <span className="text-base">Dashboard</span>
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <h1 className="text-2xl font-bold text-gray-900 flex-1">My Tasks</h1>

        {/* Daily / Weekly toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {['daily', 'weekly'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-5 py-2 rounded-lg text-base font-semibold capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-white text-[#10B981] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>

      {/* Summary bar */}
      <div className="bg-[#D1FAE5] px-8 py-4 flex items-center gap-4">
        <div className="text-[#166534]">
          <span className="font-bold text-xl">
            {completedToday} / {totalToday}
          </span>
          <span className="text-base ml-2">tasks completed today</span>
        </div>
        {totalToday > 0 && completedToday === totalToday && (
          <span className="text-[#166534] font-semibold text-base">
            🎉 All done! Your tree is celebrating!
          </span>
        )}
      </div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-6 py-8 space-y-4 pb-28">
        {viewMode === 'daily' ? (
          <>
            <p className="text-gray-500 text-base font-medium">
              {formatDate(today)}
            </p>
            {visibleTasks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">🌱</p>
                <p className="text-xl font-medium">No tasks for today</p>
                <p className="text-base mt-1">Tap + to add your first task!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {sortedDates.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">🌱</p>
                <p className="text-xl font-medium">No tasks this week</p>
                <p className="text-base mt-1">Tap + to plan your week!</p>
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date}>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2 mt-4">
                    {date === today ? `Today · ${formatDate(date)}` : formatDate(date)}
                  </p>
                  <div className="space-y-3">
                    {grouped[date].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#10B981] rounded-full shadow-lg flex items-center justify-center hover:bg-[#059669] active:scale-95 transition-all"
      >
        <PlusIcon />
      </button>

      {/* Modal */}
      {showModal && (
        <TaskModal
          initial={
            editingTask
              ? {
                  title: editingTask.title,
                  description: editingTask.description || '',
                  date: editingTask.date,
                  time: editingTask.time || '',
                  category: editingTask.category,
                }
              : BLANK_FORM
          }
          onSave={handleSave}
          onClose={closeModal}
          loading={saving}
        />
      )}
    </div>
  )
}
