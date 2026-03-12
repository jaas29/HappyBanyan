import { Navigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase/config'

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <p className="text-2xl text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return children
}
