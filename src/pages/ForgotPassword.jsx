import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase/config'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess(true)
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.')
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
        <p className="text-lg text-gray-500 text-center mb-8">
          Enter your email and we'll send you a reset link.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-base">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 text-green-700 px-4 py-4 rounded-xl text-base">
              Reset email sent! Check your inbox.
            </div>
            <Link
              to="/login"
              className="inline-block bg-[#7C3AED] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#6D28D9] transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7C3AED] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-base text-gray-500">
          Remember your password?{' '}
          <Link to="/login" className="text-[#7C3AED] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
