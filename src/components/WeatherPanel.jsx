import { useEffect, useMemo, useState } from 'react'
import {
  fetchCurrentWeather,
  fetchThreeHourForecast,
  toDailyForecast,
  todayKeyForTimezone,
} from '../utils/openWeather'

function formatDayLabel(yyyyMmDd, todayKey) {
  if (todayKey && yyyyMmDd === todayKey) return 'Today'

  const date = new Date(`${yyyyMmDd}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return yyyyMmDd

  return new Intl.DateTimeFormat(undefined, { weekday: 'long', timeZone: 'UTC' }).format(date)
}

function WeatherCity({ lat, lon }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [days, setDays] = useState([])
  const [todayKey, setTodayKey] = useState('')

  const coordsReady = lat != null && lon != null && lat !== '' && lon !== ''

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!coordsReady) {
        setStatus('missing')
        setDays([])
        setError('')
        setTodayKey('')
        return
      }

      setStatus('loading')
      setError('')

      try {
        const data = await fetchThreeHourForecast({ lat, lon, units: 'imperial' })
        const tzOffset = typeof data?.city?.timezone === 'number' ? data.city.timezone : 0
        const computedTodayKey = todayKeyForTimezone(tzOffset)
        let finalTodayKey = computedTodayKey
        let daily = toDailyForecast(data?.list ?? [], tzOffset)

        const hasToday = daily.some((d) => d.date === computedTodayKey)

        if (!hasToday) {
          try {
            const current = await fetchCurrentWeather({ lat, lon, units: 'imperial' })
            const currentTzOffset = typeof current?.timezone === 'number' ? current.timezone : tzOffset
            const currentTodayKey = todayKeyForTimezone(currentTzOffset)
            finalTodayKey = currentTodayKey
            const temp = typeof current?.main?.temp === 'number' ? Math.round(current.main.temp) : null
            daily = [
              {
                date: currentTodayKey,
                minF: temp,
                maxF: temp,
                description: current?.weather?.[0]?.description ?? '',
                icon: current?.weather?.[0]?.icon ?? '',
              },
              ...daily,
            ]
          } catch {
            // If current-weather fetch fails, fall back to forecast-only.
          }
        }

        if (!cancelled) setTodayKey(finalTodayKey)

        if (!cancelled) {
          setDays(daily.slice(0, 5))
          setStatus('success')
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message ? String(e.message) : 'Failed to load weather')
          setStatus('error')
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [coordsReady, lat, lon])

  return (
    <section className="bg-white rounded-2xl px-8 py-6 shadow-sm">
      <div className="flex items-center gap-1">
        <div className="h-10 w-10 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">5-Day Forecast</h3>
      </div>

      {status === 'missing' && (
        <p className="mt-4 text-gray-500">
          Add the latitude/longitude for this city to show weather.
        </p>
      )}

      {status === 'loading' && <p className="mt-4 text-gray-500">Loading weather...</p>}

      {status === 'error' && (
        <p className="mt-4 text-red-600">Weather error: {error}</p>
      )}

      {status === 'success' && (
        <div className="mt-4 space-y-3">
          {days.map((d) => (
            <div
              key={d.date}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {d.icon ? (
                  <img
                    src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                    alt={d.description || 'Weather icon'}
                    className="h-10 w-10"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-10" />
                )}
                <div>
                  <div className="text-sm font-semibold text-gray-900">{formatDayLabel(d.date, todayKey)}</div>
                  <div className="text-sm text-gray-500 capitalize">{d.description}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {d.maxF != null ? `${d.maxF}°` : '--'} / {d.minF != null ? `${d.minF}°` : '--'}
                </div>
                <div className="text-xs text-gray-400">high / low</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function WeatherPanel({ cities }) {
  const normalizedCities = useMemo(() => cities ?? [], [cities])

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 gap-5">
        {normalizedCities.map((c) => (
          <WeatherCity
            key={c.id}
            lat={c.lat}
            lon={c.lon}
          />
        ))}
      </div>
    </section>
  )
}
