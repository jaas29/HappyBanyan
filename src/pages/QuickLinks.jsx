import { useNavigate } from 'react-router-dom'

// import logos
import youtubeLogo from '../assets/logos/youtube.png'
import wwdLogo from '../assets/logos/wwd.jpg'
import wikipediaLogo from '../assets/logos/wikipedia.webp'
import weatherLogo from '../assets/logos/weathercom.png'
import nytimesLogo from '../assets/logos/Nytimes.png'
import googleLogo from '../assets/logos/google.webp'
import bbcLogo from '../assets/logos/bbcnews.webp'
import amazonLogo from '../assets/logos/amazon.png'

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const LINKS = [
  { label: 'New York Times', url: 'https://www.nytimes.com', color: '#1a1a1a', logo: nytimesLogo },
  { label: 'WWD',            url: 'https://wwd.com',         color: '#c41230', logo: wwdLogo },
  { label: 'Weather.com',    url: 'https://weather.com',     color: '#2b5eaa', logo: weatherLogo },

  // adjusted colors for contrast
  { label: 'YouTube',        url: 'https://www.youtube.com', color: '#1f1f1f', logo: youtubeLogo },
  { label: 'Google',         url: 'https://www.google.com',  color: '#e8f0fe', logo: googleLogo },

  { label: 'Wikipedia',      url: 'https://www.wikipedia.org', color: '#3366cc', logo: wikipediaLogo },
  { label: 'Amazon',         url: 'https://www.amazon.com',  color: '#FF9900', logo: amazonLogo },
  { label: 'BBC News',       url: 'https://www.bbc.com/news', color: '#bb1919', logo: bbcLogo },
]

export default function QuickLinks() {
  const navigate = useNavigate()

  return (
    <div className="h-screen bg-[#FFF8F0] flex flex-col overflow-hidden">

      {/* Header */}
      <header className="flex items-center gap-4 px-8 py-4 bg-white border-b border-gray-200 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <BackIcon />
          <span className="text-base">Dashboard</span>
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <h1 className="text-2xl font-bold text-gray-900">Quick Links</h1>
      </header>

      {/* Grid */}
      <main className="flex-1 overflow-y-auto px-10 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 max-w-3xl mx-auto">
          {LINKS.map(({ label, url, color, logo }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: color }}
              className="rounded-2xl py-6 px-4 flex flex-col items-center justify-center text-white font-bold text-sm text-center leading-snug hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <img
                src={logo}
                alt={label}
                className="w-10 h-10 object-contain mb-2 bg-white p-1 rounded"
              />
              {label}
            </a>
          ))}
        </div>
      </main>
    </div>
  )
}