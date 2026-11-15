import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [heartRate, setHeartRate] = useState(72)
  const [readings, setReadings] = useState([72])
  const resting = readings.filter((reading) => reading < 80)
  const baseline = Math.round(resting.reduce((sum, reading) => sum + reading, 0) / resting.length)
  const chartReadings = readings.slice(-10)
  const [selected, setSelected] = useState('heart')
  const sleepSeries = [7.3, 6.8, 7.5, 7.2, 6.5, 7.8, 7.3]
  const [tempSeries, setTempSeries] = useState([36.5, 36.6, 36.4, 36.7, 36.6, 36.5, 36.6, 36.7, 36.6, 36.6])
  const [pressureSeries, setPressureSeries] = useState([121, 119, 120, 122, 120, 118, 121, 120, 119, 120])
  const [oxygenSeries, setOxygenSeries] = useState([98, 97, 98, 99, 98, 97, 98, 98, 99, 98])
  const [sugarSeries, setSugarSeries] = useState([96, 98, 94, 100, 97, 95, 99, 96, 98, 97])
  const [moodSeries, setMoodSeries] = useState([4, 4, 3, 4, 5, 4, 3, 4, 4, 4])
  const moodFaces = ['😢', '😟', '😐', '🙂', '😀']
  const moodWords = ['Bad', 'Low', 'Okay', 'Good', 'Great']
  const [env, setEnv] = useState('spacecraft')
  const autoRange = (values, decimals) => {
    const lo = Math.min(...values)
    const hi = Math.max(...values)
    const span = hi - lo
    const pad = Math.max(span * 0.3, decimals === 1 ? 0.05 : 0.5)
    const factor = Math.pow(10, decimals)
    const min = Math.floor((lo - pad) * factor) / factor
    const max = Math.ceil((hi + pad) * factor) / factor
    const mid = Math.round(((min + max) / 2) * factor) / factor
    return { min, max, yLabels: [max, mid, min] }
  }
  const chartConfig = {
    heart: { title: 'Resting heart rate over time', values: chartReadings, min: 60, max: 110, yLabels: [110, 100, 80, 60], xLabel: 'last 10 readings', alertAt: 100, desc: 'Resting heart rate in beats per minute. The dashed red line marks 100 bpm — above it, the app raises an alert.', color: env === 'spacecraft' ? '#66cccc' : '#ff9c00', unit: 'bpm', xAxis: 'reading' },
    sleep: { title: 'Sleep over time', values: sleepSeries, min: 0, max: 10, yLabels: [10, 8, 4, 0], xLabel: 'last 7 nights', alertAt: null, desc: 'Hours slept each night, for the last 7 nights.', color: '#cc6699', unit: 'hours', xAxis: 'night' },
    temp: { title: 'Body temperature over time', values: tempSeries.slice(-10), xLabel: 'last 10 readings', alertAt: null, desc: 'Body temperature in degrees Celsius, last 10 readings.', color: '#6699cc', unit: '°C', xAxis: 'reading', ...autoRange(tempSeries.slice(-10), 1) },
    pressure: { title: 'Blood pressure over time', values: pressureSeries.slice(-10), xLabel: 'last 10 readings (systolic)', alertAt: null, desc: 'Systolic blood pressure in mmHg, last 10 readings.', color: '#ffcc66', unit: 'mmHg', xAxis: 'reading', ...autoRange(pressureSeries.slice(-10), 0) },
    oxygen: { title: 'Oxygenation over time', values: oxygenSeries.slice(-10), xLabel: 'last 10 readings', alertAt: null, desc: 'Blood oxygen saturation in percent, last 10 readings.', color: '#9966cc', unit: '%', xAxis: 'reading', ...autoRange(oxygenSeries.slice(-10), 0) },
    sugar: { title: 'Blood sugar over time', values: sugarSeries.slice(-10), xLabel: 'last 10 readings', alertAt: null, desc: 'Blood sugar in mg/dL, last 10 readings.', color: '#66cc99', unit: 'mg/dL', xAxis: 'reading', ...autoRange(sugarSeries.slice(-10), 0) },
    mood: { title: 'Mood over time', values: moodSeries.slice(-10), min: 1, max: 5, yLabels: [5, 3, 1], xLabel: 'last 10 check-ins', alertAt: null, desc: 'Mood check-ins, 1 (low) to 5 (great). Tap a face above to log how you feel.', color: '#ff9966', unit: '1–5', xAxis: 'check-in' },
  }[selected]
  const chartPoints = chartConfig.values.map((value, index) => `${30 + (index * 260) / Math.max(chartConfig.values.length - 1, 1)},${120 - ((value - chartConfig.min) / (chartConfig.max - chartConfig.min)) * 100}`).join(' ')
  const vitals = [
    { key: 'heart', label: 'Resting heart rate', value: `${heartRate} bpm`, color: env === 'spacecraft' ? '#66cccc' : '#ff9c00' },
    { key: 'sleep', label: 'Sleep last night', value: '7h 20m', color: '#cc6699' },
    { key: 'temp', label: 'Body temperature', value: `${tempSeries[tempSeries.length - 1]} °C`, color: '#6699cc' },
    { key: 'pressure', label: 'Blood pressure', value: `${pressureSeries[pressureSeries.length - 1]}/80 mmHg`, color: '#ffcc66' },
    { key: 'oxygen', label: 'Oxygenation', value: `${oxygenSeries[oxygenSeries.length - 1]}%`, color: '#9966cc' },
    { key: 'sugar', label: 'Blood sugar', value: `${sugarSeries[sugarSeries.length - 1]} mg/dL`, color: '#66cc99' },
  ]
  const currentVital = vitals.find((vital) => vital.key === selected) || { key: 'mood', label: 'Mood', value: moodWords[moodSeries[moodSeries.length - 1] - 1], color: '#ff9966' }
  const latestHeart = readings[readings.length - 1]
  const latestMood = moodSeries[moodSeries.length - 1]
  let mccoyNote = 'All vitals steady — crew is fit for duty.'
  if (latestHeart > 100) {
    mccoyNote = 'Elevated heart rate — rest and measure again. If it stays high, seek medical care.'
  } else if (latestHeart >= 80) {
    mccoyNote = 'Heart rate running a little high — keep an eye on it.'
  } else if (latestMood <= 2) {
    mccoyNote = "Vitals steady, but the crew's mood is low — check in with them."
  }
  // Stardate 41000 = the Enterprise-D's first year (2364); each year adds 1000.
  const now = new Date()
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  const stardate = (41000 + (now.getFullYear() - 2024) * 1000 + (dayOfYear / 365) * 1000).toFixed(1)
  const signalDelay = env === 'spacecraft' ? 'Signal to Earth: about 12 minutes each way' : 'Signal to Earth: under 1 second'
  const [showTea, setShowTea] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [vitalsMenuOpen, setVitalsMenuOpen] = useState(false)
  const [backendDown, setBackendDown] = useState(false)

  useEffect(() => {
    const load = () => {
      fetch('http://localhost:8000/readings')
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data.readings) && data.readings.length > 0) {
            setReadings(data.readings)
            setHeartRate(data.readings[data.readings.length - 1])
            if (data.readings[data.readings.length - 1] <= 100) {
              setAlertDismissed(false)
            }
          }
          if (Array.isArray(data.temperature) && data.temperature.length > 0) {
            setTempSeries(data.temperature)
          }
          if (Array.isArray(data.pressure) && data.pressure.length > 0) {
            setPressureSeries(data.pressure)
          }
          if (Array.isArray(data.oxygenation) && data.oxygenation.length > 0) {
            setOxygenSeries(data.oxygenation)
          }
          if (Array.isArray(data.sugar) && data.sugar.length > 0) {
            setSugarSeries(data.sugar)
          }
          if (Array.isArray(data.mood) && data.mood.length > 0) {
            setMoodSeries(data.mood)
          }
          setBackendDown(false)
        })
        .catch(() => {
          setBackendDown(true)
        })
    }
    load()
    const timer = setInterval(load, 15000)
    return () => clearInterval(timer)
  }, [])

  // No back end (e.g. the Vercel preview): simulate the sensor in the browser
  // so the chart keeps moving. When the back end answers again, load() turns
  // this off and the real series takes over.
  useEffect(() => {
    if (!backendDown) {
      return
    }
    const tick = () => {
      const hr = Math.floor(Math.random() * 11) + 68
      setReadings((prev) => [...prev.slice(-59), hr])
      setHeartRate(hr)
      setAlertDismissed(false)
      setTempSeries((prev) => [...prev.slice(-59), Math.round((36.4 + Math.random() * 0.3) * 10) / 10])
      setPressureSeries((prev) => [...prev.slice(-59), Math.floor(Math.random() * 5) + 118])
      setOxygenSeries((prev) => [...prev.slice(-59), Math.floor(Math.random() * 3) + 97])
      setSugarSeries((prev) => [...prev.slice(-59), Math.floor(Math.random() * 21) + 90])
    }
    tick()
    const timer = setInterval(tick, 15000)
    return () => clearInterval(timer)
  }, [backendDown])

  useEffect(() => {
    if (!showTea) {
      return
    }
    const timer = setTimeout(() => setShowTea(false), 5000)
    return () => clearTimeout(timer)
  }, [showTea])

  async function measureNow() {
    try {
      const response = await fetch('http://localhost:8000/measure', { method: 'POST' })
      const data = await response.json()
      setHeartRate(data.reading)
      setReadings(data.readings)
      setAlertDismissed(false)
    } catch {
      setHeartRate(105)
      setReadings([...readings, 105])
      setAlertDismissed(false)
    }
  }

  async function logMood(value) {
    try {
      const response = await fetch('http://localhost:8000/mood', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value }) })
      const data = await response.json()
      setMoodSeries(data.mood)
    } catch {
      setMoodSeries([...moodSeries.slice(-59), value])
    }
  }


  return (

    <div className={env === 'spacecraft' ? 'frame spacecraft' : 'frame station'}>
      <div className="toprow">
        <div className="elbow"></div>
        <div className="topbar"></div>
        <div className="elbow right"></div>
      </div>

      <div className="body">
      <div className="rail"></div>


      <section id="center">
        <div className="title-row">
          <h1>McCoy's Lab</h1>
          <div className="tea-float">
            <p className={showTea ? 'picard visible' : 'picard'}>Tea. Earl Grey. Hot.</p>
            <button type="button" className="tea" onClick={() => setShowTea(!showTea)}>☕</button>
          </div>
          <div className="ship-card">
            <span>USS Enterprise · NCC-1701-D</span>
            <span>Chief Medical Officer · Dr. Leonard McCoy</span>
            <span>{env === 'spacecraft' ? 'Sickbay · Day 2 — Spacecraft' : 'Sickbay · Day 1 — Space Station'}</span>
            <div className="env-toggle">
              <button type="button" className={env === 'station' ? 'active' : ''} onClick={() => setEnv('station')}>Space Station</button>
              <button type="button" className={env === 'spacecraft' ? 'active' : ''} onClick={() => setEnv('spacecraft')}>Spacecraft</button>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="side">
            <div className="vitals-menu">
              <button type="button" className="vitals-menu-button" style={{ borderLeftColor: currentVital.color }} onClick={() => setVitalsMenuOpen(!vitalsMenuOpen)}>
                <span>{currentVital.label}</span>
                <span className="vitals-menu-value">{currentVital.value}</span>
                <span>{vitalsMenuOpen ? '▴' : '▾'}</span>
              </button>
              {vitalsMenuOpen && (
                <div className="vitals-menu-list">
                  {vitals.map((vital) => (
                    <button key={vital.key} type="button" className={selected === vital.key ? 'selected' : ''} style={{ borderLeftColor: vital.color }} onClick={() => { setSelected(vital.key); setVitalsMenuOpen(false); }}>
                      <span>{vital.label}</span>
                      <span>{vital.value}</span>
                    </button>
                  ))}
                  <div className="vitals-menu-mood">
                    <span>Mood</span>
                    {moodFaces.map((face, index) => (
                      <button key={index} type="button" className={moodSeries[moodSeries.length - 1] === index + 1 ? 'mood-face selected' : 'mood-face'} onClick={() => { setSelected('mood'); logMood(index + 1); setVitalsMenuOpen(false); }}>{face}</button>
                    ))}
                  </div>
                </div>
              )}
              {vitalsMenuOpen && (
                <div className="vitals-menu-backdrop" onClick={() => setVitalsMenuOpen(false)} />
              )}
            </div>
            <div className="tiles">

              <div className={selected === 'heart' ? 'tile selected' : 'tile'} onClick={() => setSelected('heart')}>
                <p>Resting heart rate</p>
                <p>{heartRate} bpm</p>
                <p>Your normal: {baseline} bpm</p>
              </div>

              <div className={selected === 'sleep' ? 'tile selected' : 'tile'} onClick={() => setSelected('sleep')}>
                <p>Sleep last night</p>
                <p>7h 20m</p>
              </div>

              <div className={selected === 'temp' ? 'tile selected' : 'tile'} onClick={() => setSelected('temp')}>
                <p>Body temperature</p>
                <p>{tempSeries[tempSeries.length - 1]} °C</p>
              </div>

              <div className={selected === 'pressure' ? 'tile selected' : 'tile'} onClick={() => setSelected('pressure')}>
                <p>Blood pressure</p>
                <p>{pressureSeries[pressureSeries.length - 1]}/80 mmHg</p>
              </div>

              <div className={selected === 'oxygen' ? 'tile selected' : 'tile'} onClick={() => setSelected('oxygen')}>
                <p>Oxygenation</p>
                <p>{oxygenSeries[oxygenSeries.length - 1]}%</p>
              </div>

              <div className={selected === 'sugar' ? 'tile selected' : 'tile'} onClick={() => setSelected('sugar')}>
                <p>Blood sugar</p>
                <p>{sugarSeries[sugarSeries.length - 1]} mg/dL</p>
              </div>

            </div>
          </div>

          <div className="screen">
            {heartRate > 100 && !alertDismissed && (
              <div className="alert">
                <p>Elevated heart rate alert</p>
                <p>Rest and measure again. If it stays high, seek medical care.</p>
                <button type="button" className="alert-close" onClick={() => setAlertDismissed(true)}>✕</button>
              </div>
            )}

            <div className="history">
              <div className="history-controls">
                <div className="mood-top">
                  <span>Mood</span>
                  {moodFaces.map((face, index) => (
                    <button key={index} type="button" className={moodSeries[moodSeries.length - 1] === index + 1 ? 'selected' : ''} onClick={() => { setSelected('mood'); logMood(index + 1); }}>{face}</button>
                  ))}
                  <span className="mood-word">{moodWords[moodSeries[moodSeries.length - 1] - 1]}</span>
                </div>
                <button type="button" className="measure-icon measure-chart" onClick={measureNow} title="Measure now" aria-label="Measure now">
                  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                    <polyline points="2,12 6,12 9,5 13,19 16,12 22,12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Measure now</span>
                </button>
              </div>
              <p style={{ color: chartConfig.color }}>{chartConfig.title}</p>
              <p>{selected === 'heart' ? `Last 10 of ${readings.length} readings` : chartConfig.xLabel}</p>
              <p className="chart-desc">{chartConfig.desc}</p>
              <svg viewBox="0 0 300 160" className="chart" role="img" aria-label={chartConfig.title}>
                <text x="2" y="8" fontSize="8" fill="#b8b8cc">{chartConfig.unit}</text>
                <g transform="translate(0 5)">
                {chartConfig.yLabels.map((label) => (
                  <text key={label} x="2" y={118 - ((label - chartConfig.min) / (chartConfig.max - chartConfig.min)) * 100} fontSize="8" fill="#b8b8cc">{label}</text>
                ))}
                {chartConfig.alertAt !== null && (
                  <line x1="30" y1={120 - ((chartConfig.alertAt - chartConfig.min) / (chartConfig.max - chartConfig.min)) * 100} x2="290" y2={120 - ((chartConfig.alertAt - chartConfig.min) / (chartConfig.max - chartConfig.min)) * 100} stroke="#ff4d4d" strokeWidth="1" strokeDasharray="4 4" />
                )}
                <line x1="30" y1="20" x2="30" y2="120" stroke="#2a2a4a" strokeWidth="1" />
                {chartConfig.yLabels.map((label) => (
                  <line key={`grid-${label}`} x1="30" y1={120 - ((label - chartConfig.min) / (chartConfig.max - chartConfig.min)) * 100} x2="290" y2={120 - ((label - chartConfig.min) / (chartConfig.max - chartConfig.min)) * 100} stroke="#2a2a4a" strokeWidth="1" />
                ))}
                <polyline points={chartPoints} fill="none" stroke={env === 'spacecraft' ? '#66cccc' : '#ff9c00'} strokeWidth="2" />
                {chartConfig.values.map((value, index) => (
                  <circle key={index} cx={30 + (index * 260) / Math.max(chartConfig.values.length - 1, 1)} cy={120 - ((value - chartConfig.min) / (chartConfig.max - chartConfig.min)) * 100} r="4" fill={env === 'spacecraft' ? '#ff9c00' : '#66cccc'} />
                ))}
                {chartConfig.values.map((value, index) => (
                  index === chartConfig.values.length - 1 && (
                    <text key={index} x={30 + (index * 260) / Math.max(chartConfig.values.length - 1, 1) - 4} y={120 - ((value - chartConfig.min) / (chartConfig.max - chartConfig.min)) * 100 - 8} fontSize="8" fill="#e8e8f0" textAnchor="end">{value}</text>
                  )
                ))}
                </g>
                {chartConfig.values.map((value, index) => (
                  <text key={index} x={30 + (index * 260) / Math.max(chartConfig.values.length - 1, 1)} y="135" fontSize="8" fill="#b8b8cc" textAnchor="middle">{index + 1}</text>
                ))}
                <text x="160" y="157" fontSize="8" fill="#b8b8cc" textAnchor="middle">{chartConfig.xAxis}</text>
              </svg>
            </div>
            <div className="below-chart">
              <div className="mccoy-note">
                <p>McCoy's Note</p>
                <p>{mccoyNote}</p>
              </div>
              <div className="stardate-card">
                <p>Stardate</p>
                <p>{stardate}</p>
                <p>{signalDelay}</p>
              </div>
            </div>

          </div>
        </div>










        <button type="button" className="measure-icon measure-below" onClick={measureNow} title="Measure now" aria-label="Measure now">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <polyline points="2,12 6,12 9,5 13,19 16,12 22,12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Measure now</span>
        </button>
      </section>
      <div className="rail"></div>
      </div>
      <div className="bottomrow">
        <div className="elbow bottom"></div>
        <div className="bottombar"></div>
        <div className="elbow bottom right"></div>
      </div>
    </div>


  )
}

export default App