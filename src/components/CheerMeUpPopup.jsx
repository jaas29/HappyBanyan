import { useState } from 'react'

const CHEER_UP_MESSAGES = [
  "You're doing great! Keep up the amazing work!",
  "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "You are capable of amazing things.",
  "Don't watch the clock; do what it does. Keep going.",
  "The best way to predict the future is to create it.",
  "Every day is a second chance.",
  "You've got this!",
  "A little progress each day adds up to big results.",
]

export default function CheerMeUpPopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [message, setMessage] = useState("")

  const handleCheerMeUp = () => {
    const randomIndex = Math.floor(Math.random() * CHEER_UP_MESSAGES.length)
    setMessage(CHEER_UP_MESSAGES[randomIndex])
    setShowPopup(true)
  }

  const handleClosePopup = () => {
    setShowPopup(false)
  }

  return (
    <>
      <button
  onClick={handleCheerMeUp}
  className="w-full h-full opacity-0 cursor-pointer"
></button>

      {showPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 m-4 max-w-sm w-full shadow-xl relative animate-scale-in">
            <button
              onClick={handleClosePopup}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">A Little Cheer!</h3>
            <p className="text-gray-700 text-lg text-center mb-6">
              {message}
            </p>
            <button
              onClick={handleClosePopup}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
