import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WeatherPanel from '../components/WeatherPanel'
import WeatherFeatured from '../components/WeatherFeatured'

export default function Weather() {
  const navigate = useNavigate()
  const [activeCityId, setActiveCityId] = useState('sarasota')

  const weatherCities = useMemo(
    () => [
      { id: 'sarasota', name: 'Sarasota, FL', lat: 27.3365805, lon: -82.5308545 },
      { id: 'thousand-oaks', name: 'Thousand Oaks, CA', lat: 34.1705609, lon: -118.8375937 },
    ],
    [],
  )

  const activeCities = useMemo(
    () => weatherCities.filter((c) => c.id === activeCityId),
    [activeCityId, weatherCities],
  )

  const activeCity = useMemo(
    () => weatherCities.find((c) => c.id === activeCityId) ?? null,
    [activeCityId, weatherCities],
  )

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Weather</h1>
          <span className="text-sm text-gray-500">Daily forecast</span>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition-colors"
        >
          Back to Dashboard
        </button>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6 flex justify-center flex-wrap gap-2">
            {weatherCities.map((c) => {
              const active = c.id === activeCityId
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCityId(c.id)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors border ${
                    active
                      ? 'bg-[#7C3AED] text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {c.name}
                </button>
              )
            })}
          </div>

          <div className="space-y-5">
            <WeatherFeatured city={activeCity} />
            <WeatherPanel cities={activeCities} />
          </div>
        </div>
      </main>
    </div>
  )
}
