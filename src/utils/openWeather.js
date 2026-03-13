function pad2(n) {
  return String(n).padStart(2, '0')
}

export function dateKeyFromUnixSeconds(unixSeconds, timezoneOffsetSeconds = 0) {
  const shifted = new Date((Number(unixSeconds) + Number(timezoneOffsetSeconds)) * 1000)
  if (Number.isNaN(shifted.getTime())) return ''
  const y = shifted.getUTCFullYear()
  const m = pad2(shifted.getUTCMonth() + 1)
  const d = pad2(shifted.getUTCDate())
  return `${y}-${m}-${d}`
}

export function todayKeyForTimezone(timezoneOffsetSeconds = 0) {
  const nowSeconds = Math.floor(Date.now() / 1000)
  return dateKeyFromUnixSeconds(nowSeconds, timezoneOffsetSeconds)
}

export function toDailyForecast(threeHourList, timezoneOffsetSeconds = 0) {
  const byDate = new Map()

  for (const item of threeHourList ?? []) {
    const dt = item?.dt
    if (typeof dt !== 'number') continue

    const datePart = dateKeyFromUnixSeconds(dt, timezoneOffsetSeconds)
    if (!datePart) continue

    const shifted = new Date((dt + timezoneOffsetSeconds) * 1000)
    const minutes = shifted.getUTCHours() * 60 + shifted.getUTCMinutes()

    const existing = byDate.get(datePart) ?? {
      date: datePart,
      minF: Number.POSITIVE_INFINITY,
      maxF: Number.NEGATIVE_INFINITY,
      pickDistanceMinutes: Number.POSITIVE_INFINITY,
      description: '',
      icon: '',
    }

    const tempMin = item?.main?.temp_min
    const tempMax = item?.main?.temp_max

    if (typeof tempMin === 'number') existing.minF = Math.min(existing.minF, tempMin)
    if (typeof tempMax === 'number') existing.maxF = Math.max(existing.maxF, tempMax)

    const distanceToNoon = Math.abs(minutes - 12 * 60)

    if (distanceToNoon < existing.pickDistanceMinutes) {
      existing.pickDistanceMinutes = distanceToNoon
      existing.description = item?.weather?.[0]?.description ?? ''
      existing.icon = item?.weather?.[0]?.icon ?? ''
    }

    byDate.set(datePart, existing)
  }

  return Array.from(byDate.values())
    .map((d) => ({
      ...d,
      minF: Number.isFinite(d.minF) ? Math.round(d.minF) : null,
      maxF: Number.isFinite(d.maxF) ? Math.round(d.maxF) : null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function fetchThreeHourForecast({ lat, lon, units = 'imperial' }) {
  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_OPENWEATHERMAP_API_KEY')
  }

  if (lat == null || lon == null || lat === '' || lon === '') {
    throw new Error('Missing latitude/longitude')
  }

  const url = new URL('https://api.openweathermap.org/data/2.5/forecast')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lon))
  url.searchParams.set('units', units)
  url.searchParams.set('appid', apiKey)

  const res = await fetch(url)
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.message ? String(data.message) : `OpenWeather error ${res.status}`
    throw new Error(message)
  }

  return data
}

export async function fetchCurrentWeather({ lat, lon, units = 'imperial' }) {
  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_OPENWEATHERMAP_API_KEY')
  }

  if (lat == null || lon == null || lat === '' || lon === '') {
    throw new Error('Missing latitude/longitude')
  }

  const url = new URL('https://api.openweathermap.org/data/2.5/weather')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lon))
  url.searchParams.set('units', units)
  url.searchParams.set('appid', apiKey)

  const res = await fetch(url)
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.message ? String(data.message) : `OpenWeather error ${res.status}`
    throw new Error(message)
  }

  return data
}
