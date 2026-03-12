import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/config'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.')
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
        <p className="text-lg text-gray-500 text-center mb-8">Welcome back! Log in to continue.</p>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label className="block text-base font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7C3AED] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <Link to="/forgot-password" className="text-[#7C3AED] text-base font-medium hover:underline block">
            Forgot password?
          </Link>
          <p className="text-base text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#7C3AED] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
