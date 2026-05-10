// src/pages/PublicTrip.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PublicTrip() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Fetch by share_token, only if is_public = true (RLS enforces this too)
    supabase.from('trips')
      .select('*, stops(*, activities(*))')
      .eq('share_token', token)
      .eq('is_public', true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setTrip(data)
      })
  }, [token])

  // ── Not found / private ────────────────────────────────────────────────────
  if (notFound) return (
    <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <h2 style={{ fontFamily: 'Syne', color: 'var(--text-primary)', marginTop: 'var(--sp-2)' }}>
        Trip not found
      </h2>
      <p>This trip is private or the link is invalid.</p>
      <button onClick={() => navigate('/')} style={{ ...sigBtnStyle, marginTop: 'var(--sp-3)' }}>
        Plan your own trip
      </button>
    </div>
  )

  if (!trip) return (
    <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
      Loading...
    </div>
  )

  const sortedStops = [...(trip.stops || [])].sort((a, b) => a.position - b.position)
  const totalCost = sortedStops.reduce((sum, stop) =>
    sum + (stop.activities?.reduce((s, a) => s + (a.cost || 0), 0) || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── Traveloop top bar (no nav links — public page) ─────────── */}
      <div style={{
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        padding: 'var(--sp-2) var(--sp-4)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--sig)' }}>
          Traveloop
        </span>
        <button onClick={() => navigate('/signup')} style={sigBtnStyle}>
          Plan your own trip →
        </button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{
        height: 280, position: 'relative',
        background: trip.cover_url
          ? `url(${trip.cover_url}) center/cover`
          : `linear-gradient(135deg, hsl(220,18%,10%) 0%, ${trip.mood_color || 'hsl(38,60%,30%)'} 100%)`
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, var(--bg-base) 0%, transparent 60%)'
        }} />
        <div style={{ position: 'absolute', bottom: 'var(--sp-4)', left: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--sp-1)', marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>{trip.mood_emoji || '✈️'}</span>
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', marginBottom: 4 }}>
            {trip.name}
          </h1>
          {trip.ai_vibe_summary && (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}>
              "{trip.ai_vibe_summary}"
            </p>
          )}
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 'var(--sp-4)', padding: 'var(--sp-3) var(--sp-4)',
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)'
      }}>
        {[
          { label: 'Stops', value: sortedStops.length },
          { label: 'Activities', value: sortedStops.reduce((s, st) => s + (st.activities?.length || 0), 0) },
          { label: 'Est. Cost', value: `$${totalCost.toFixed(0)}` },
          {
            label: 'Days', value: trip.start_date && trip.end_date
              ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)
              : '—'
          },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--sig)', fontSize: 'var(--text-lg)' }}>
              {value}
            </div>
          </div>
        ))}

        {/* Native share or clipboard copy */}
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => {
              navigator.share?.({ title: trip.name, url: window.location.href })
                ?? navigator.clipboard.writeText(window.location.href)
            }}
            style={outlineBtnStyle}
          >
            Share
          </button>
        </div>
      </div>

      {/* ── Stops Timeline ───────────────────────────────────────────── */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--sp-4)', position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', left: 'calc(var(--sp-4) + 8px)',
          top: 0, bottom: 0, width: 2, background: 'var(--border)'
        }} />

        {sortedStops.map((stop) => (
          <div key={stop.id} style={{ paddingLeft: 'var(--sp-6)', marginBottom: 'var(--sp-6)', position: 'relative' }}>
            {/* Timeline dot */}
            <div style={{
              position: 'absolute', left: 0, top: 4,
              width: 16, height: 16, borderRadius: '50%',
              background: trip.mood_color || 'var(--sig)',
              border: '3px solid var(--bg-base)'
            }} />

            <h2 style={{ fontFamily: 'Syne', fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 2 }}>
              {stop.city_name}
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }}>
              {stop.country}
            </p>

            {/* Activity cards — read only, no edit buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {stop.activities?.map(act => (
                <div key={act.id} style={actCardStyle}>
                  <div style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                    {act.name}
                  </div>
                  <div style={{ color: 'var(--sig)', fontSize: 'var(--text-xs)', fontFamily: 'Syne', fontWeight: 700, marginTop: 2 }}>
                    ${act.cost}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const sigBtnStyle = {
  background: 'var(--sig)', border: 'none', borderRadius: 8,
  color: '#000', fontFamily: 'Syne', fontWeight: 700,
  padding: '0.5rem 1rem', cursor: 'pointer'
}
const outlineBtnStyle = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 8,
  color: 'var(--text-secondary)', fontFamily: 'DM Sans',
  padding: '0.5rem 1rem', cursor: 'pointer'
}
const actCardStyle = {
  background: 'var(--bg-elevated)', borderRadius: 8,
  padding: '0.6rem 0.75rem', border: '1px solid var(--border)'
}