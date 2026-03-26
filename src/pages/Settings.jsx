import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../firebase/config'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

const BackIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

export default function Settings() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  const [familyCode, setFamilyCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!user) return
      setLoading(true)
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (!snap.exists()) {
          if (!cancelled) setFamilyCode('')
          return
        }
        const currentCode = snap.data()?.familyCode || ''
        if (!cancelled) setFamilyCode(currentCode)
      } catch (err) {
        console.error('Failed to load settings:', err)
        toast.error('Could not load settings.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  async function handleSave(e) {
    e.preventDefault()
    if (!user || saving) return

    const nextCode = familyCode.trim()
    if (!nextCode) {
      toast.error('Family code cannot be empty.')
      return
    }

    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        familyCode: nextCode,
      })
      toast.success('Family code updated.')
    } catch (err) {
      console.error('Failed to save family code:', err)
      toast.error('Could not update family code.')
    }
    setSaving(false)
  }

  return (
    <div className="h-screen bg-[#FFF8F0] flex flex-col overflow-hidden">
      <header className="flex items-center gap-4 px-8 py-4 bg-white border-b border-gray-200 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <BackIcon />
          <span className="text-base">Dashboard</span>
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900">Partner connection</h2>
          <p className="text-gray-600 mt-2">
            To connect with a partner, both accounts must use the same <strong>family code</strong>.
            Update it here, then have your partner use that exact code too.
          </p>

          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            {loading ? (
              <div className="text-gray-500">Loading…</div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Family code</label>
                  <input
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value)}
                    placeholder="e.g. BANYAN123"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                    autoComplete="off"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Tip: It’s case-sensitive if you use letters — keep it consistent.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Done
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
