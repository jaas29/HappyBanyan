import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('caretaker')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: name })

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        role,
        groupId: null,
        completedTasks: 0,
        createdAt: serverTimestamp(),
      })

      navigate('/')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Happy Banyan</h1>
        <p className="text-lg text-gray-500 text-center mb-8">Create your account</p>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
              placeholder="Olivia"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
              placeholder="olivia@email.com"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">I am a...</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole('caretaker')}
                className={`flex-1 py-3 rounded-xl text-base font-semibold transition-colors ${
                  role === 'caretaker'
                    ? 'bg-[#7C3AED] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Caretaker
              </button>
              <button
                type="button"
                onClick={() => setRole('elder')}
                className={`flex-1 py-3 rounded-xl text-base font-semibold transition-colors ${
                  role === 'elder'
                    ? 'bg-[#10B981] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Elder
              </button>
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7C3AED] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-base text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#7C3AED] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
