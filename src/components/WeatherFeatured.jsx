import { useEffect, useMemo, useState } from 'react'
import {
  dateKeyFromUnixSeconds,
  fetchCurrentWeather,
  fetchThreeHourForecast,
  todayKeyForTimezone,
} from '../utils/openWeather'

function formatHourFromUnixSeconds(unixSeconds, timezoneOffsetSeconds = 0) {
  if (typeof unixSeconds !== 'number') return ''
  const shifted = new Date((unixSeconds + timezoneOffsetSeconds) * 1000)
  if (Number.isNaN(shifted.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    hour12: true,
    timeZone: 'UTC',
  }).format(shifted)
}

export default function WeatherFeatured({ city }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [current, setCurrent] = useState(null)
  const [hourly, setHourly] = useState([])
  const [todayRange, setTodayRange] = useState({ minF: null, maxF: null })

  const coordsReady = city?.lat != null && city?.lon != null && city?.lat !== '' && city?.lon !== ''

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!coordsReady) {
        setStatus('missing')
        setError('')
        setCurrent(null)
        setHourly([])
        setTodayRange({ minF: null, maxF: null })
        return
      }

      setStatus('loading')
      setError('')

      try {
        const [currentData, forecastData] = await Promise.all([
          fetchCurrentWeather({ lat: city.lat, lon: city.lon, units: 'imperial' }),
          fetchThreeHourForecast({ lat: city.lat, lon: city.lon, units: 'imperial' }),
        ])

        const tzOffset = typeof forecastData?.city?.timezone === 'number' ? forecastData.city.timezone : 0
        const list = forecastData?.list ?? []

        const todayKey = todayKeyForTimezone(tzOffset)
        let minF = Number.POSITIVE_INFINITY
        let maxF = Number.NEGATIVE_INFINITY

        // Seed from current conditions if available.
        const currentTemp = currentData?.main?.temp
        const currentMin = currentData?.main?.temp_min
        const currentMax = currentData?.main?.temp_max
        if (typeof currentTemp === 'number') {
          minF = Math.min(minF, currentTemp)
          maxF = Math.max(maxF, currentTemp)
        }
        if (typeof currentMin === 'number') minF = Math.min(minF, currentMin)
        if (typeof currentMax === 'number') maxF = Math.max(maxF, currentMax)

        let matchedToday = false
        for (const item of list) {
          const dt = item?.dt
          if (typeof dt !== 'number') continue
          if (dateKeyFromUnixSeconds(dt, tzOffset) !== todayKey) continue

          matchedToday = true

          const tMin = item?.main?.temp_min
          const tMax = item?.main?.temp_max
          if (typeof tMin === 'number') minF = Math.min(minF, tMin)
          if (typeof tMax === 'number') maxF = Math.max(maxF, tMax)
        }

        // If the feed has no entries for today (often late night), fall back to next 24h window.
        if (!matchedToday) {
          for (const item of list.slice(0, 8)) {
            const tMin = item?.main?.temp_min
            const tMax = item?.main?.temp_max
            if (typeof tMin === 'number') minF = Math.min(minF, tMin)
            if (typeof tMax === 'number') maxF = Math.max(maxF, tMax)
          }
        }

        const todayMin = Number.isFinite(minF) ? Math.round(minF) : null
        const todayMax = Number.isFinite(maxF) ? Math.round(maxF) : null

        const next = list.slice(0, 8).map((item) => ({
          time: formatHourFromUnixSeconds(item?.dt, tzOffset),
          tempF: typeof item?.main?.temp === 'number' ? Math.round(item.main.temp) : null,
          icon: item?.weather?.[0]?.icon ?? '',
        }))

        if (!cancelled) {
          setCurrent({
            tempF: typeof currentData?.main?.temp === 'number' ? Math.round(currentData.main.temp) : null,
            description: currentData?.weather?.[0]?.description ?? '',
            icon: currentData?.weather?.[0]?.icon ?? '',
          })
          setHourly(next)
          setTodayRange({ minF: todayMin, maxF: todayMax })
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
  }, [coordsReady, city?.lat, city?.lon])

  const title = useMemo(() => city?.name ?? 'Today', [city?.name])

  return (
    <section className="bg-white rounded-2xl px-8 py-6 shadow-sm">
      <div className="flex flex-col items-center text-center gap-2">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      {status === 'missing' && (
        <p className="mt-4 text-gray-500">Add latitude/longitude to load weather.</p>
      )}
      {status === 'loading' && <p className="mt-4 text-gray-500">Loading...</p>}
      {status === 'error' && <p className="mt-4 text-red-600">Weather error: {error}</p>}

      {status === 'success' && (
        <div className="mt-4">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-gray-900">
              {current?.tempF != null ? `${current.tempF}°` : '--'}
            </div>

            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="text-base text-gray-500 capitalize">{current?.description}</div>
              {current?.icon ? (
                <img
                  src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
                  alt={current.description || 'Weather icon'}
                  className="h-12 w-12"
                  loading="lazy"
                />
              ) : null}
            </div>

            <div className="mt-1 text-sm text-gray-500">
              <span className="font-semibold text-gray-900">
                High {todayRange?.maxF != null ? `${todayRange.maxF}°` : '--'}
              </span>
              <span className="text-gray-400"> · </span>
              <span className="font-semibold text-gray-900">
                Low {todayRange?.minF != null ? `${todayRange.minF}°` : '--'}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              <div className="min-w-20 rounded-xl border border-gray-200 px-3 py-3 text-center">
                <div className="text-xs text-gray-500">Now</div>
                {current?.icon ? (
                  <img
                    src={`https://openweathermap.org/img/wn/${current.icon}.png`}
                    alt=""
                    className="mx-auto h-8 w-8"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-8" />
                )}
                <div className="text-sm font-semibold text-gray-900">
                  {current?.tempF != null ? `${current.tempF}°` : '--'}
                </div>
              </div>

              {hourly.map((h, idx) => (
                <div
                  key={`${h.time}-${idx}`}
                  className="min-w-20 rounded-xl border border-gray-200 px-3 py-3 text-center"
                >
                  <div className="text-xs text-gray-500">{h.time}</div>
                  {h.icon ? (
                    <img
                      src={`https://openweathermap.org/img/wn/${h.icon}.png`}
                      alt=""
                      className="mx-auto h-8 w-8"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-8" />
                  )}
                  <div className="text-sm font-semibold text-gray-900">
                    {h.tempF != null ? `${h.tempF}°` : '--'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
