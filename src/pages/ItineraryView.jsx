// src/pages/ItineraryView.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

// Maps activity type → emoji icon
const TYPE_EMOJIS = {
  sightseeing: '👁️',
  food: '🍜',
  adventure: '🧗',
  transport: '✈️',
  stay: '🏨',
  shopping: '🛍️'
}

export default function ItineraryView() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Load the trip with all stops and activities
  useEffect(() => {
    supabase.from('trips')
      .select('*, stops(*, activities(*))')
      .eq('id', tripId)
      .single()
      .then(({ data }) => { setTrip(data); setLoading(false) })
  }, [tripId])

  // Toggle public/private
  const togglePublic = async () => {
    const { data } = await supabase.from('trips')
      .update({ is_public: !trip.is_public })
      .eq('id', tripId).select().single()
    setTrip(data)
  }

  // Copy sharable link to clipboard
  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${trip.share_token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Sum all activity costs across all stops
  const totalCost = trip?.stops?.reduce((sum, stop) =>
    sum + (stop.activities?.reduce((s, a) => s + (a.cost || 0), 0) || 0), 0) || 0

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
      Loading...
    </div>
  )
  if (!trip) return <div>Trip not found</div>

  // Sort stops by position field (set by Sashidhar's builder)
  const sortedStops = [...(trip.stops || [])].sort((a, b) => a.position - b.position)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* ── Hero Cover Image ─────────────────────────────────────────── */}
      <div style={{
        height: 320, position: 'relative',
        background: trip.cover_url
          ? `url(${trip.cover_url}) center/cover`
          : `linear-gradient(135deg, hsl(220,18%,10%) 0%, ${trip.mood_color || 'hsl(38,60%,30%)'} 100%)`,
        marginBottom: 'var(--sp-4)'
      }}>
        {/* Dark overlay for text legibility */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, var(--bg-base) 0%, transparent 60%)'
        }} />
        {/* Trip title + vibe quote overlay */}
        <div style={{ position: 'absolute', bottom: 'var(--sp-4)', left: 'var(--sp-4)', right: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>{trip.mood_emoji || '✈️'}</span>
            <span style={{
              background: trip.mood_color || 'var(--sig)', color: '#000',
              padding: '2px 10px', borderRadius: 20,
              fontSize: 'var(--text-xs)', fontFamily: 'Syne', fontWeight: 700
            }}>
              {sortedStops.length} stops
            </span>
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

      {/* ── Action Bar ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 'var(--sp-2)',
        padding: '0 var(--sp-4)', marginBottom: 'var(--sp-4)', flexWrap: 'wrap'
      }}>
        <button onClick={() => navigate(`/trip/${tripId}/build`)} style={outlineBtnStyle}>
          ✏️ Edit Itinerary
        </button>
        <button onClick={togglePublic} style={outlineBtnStyle}>
          {trip.is_public ? '🔒 Make Private' : '🌐 Make Public'}
        </button>
        {trip.is_public && (
          <button onClick={copyShareLink} style={sigBtnStyle}>
            {copied ? '✓ Copied!' : '🔗 Copy Share Link'}
          </button>
        )}
        <div style={{ marginLeft: 'auto', fontFamily: 'Syne', fontWeight: 700, color: 'var(--sig)', padding: '0.6rem 0' }}>
          Total: ${totalCost.toFixed(0)}
        </div>
      </div>

      {/* ── Vertical Timeline ────────────────────────────────────────── */}
      <div style={{ padding: '0 var(--sp-4)', position: 'relative' }}>
        {/* The vertical line running down the left */}
        <div style={{
          position: 'absolute', left: 'calc(var(--sp-4) + 8px)',
          top: 0, bottom: 0, width: 2, background: 'var(--border)'
        }} />

        {sortedStops.map((stop, i) => (
          <motion.div
            key={stop.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            style={{ paddingLeft: 'var(--sp-6)', marginBottom: 'var(--sp-6)', position: 'relative' }}
          >
            {/* Timeline dot */}
            <div style={{
              position: 'absolute', left: 0, top: 4,
              width: 16, height: 16, borderRadius: '50%',
              background: trip.mood_color || 'var(--sig)',
              border: '3px solid var(--bg-base)',
              boxShadow: `0 0 12px ${trip.mood_color || 'var(--sig-glow)'}`
            }} />

            {/* Stop header: city name + date range */}
            <div style={{ marginBottom: 'var(--sp-2)' }}>
              <h2 style={{ fontFamily: 'Syne', fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 2 }}>
                {stop.city_name}
              </h2>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {stop.country}
                {stop.start_date && ` · ${stop.start_date}`}
                {stop.end_date && ` → ${stop.end_date}`}
              </div>
            </div>

            {/* Activity cards grid */}
            {stop.activities?.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 'var(--sp-1)'
              }}>
                {stop.activities.map(act => (
                  <div key={act.id} style={activityCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 16 }}>{TYPE_EMOJIS[act.type] || '📌'}</span>
                      <span style={{ color: 'var(--sig)', fontSize: 'var(--text-sm)', fontFamily: 'Syne', fontWeight: 700 }}>
                        ${act.cost}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'DM Sans', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
                      {act.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>
                      {act.type}{act.duration_hours ? ` · ${act.duration_hours}h` : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>
                No activities added yet.
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const activityCardStyle = {
  background: 'var(--bg-elevated)', borderRadius: 10,
  padding: '0.75rem', border: '1px solid var(--border)'
}
const outlineBtnStyle = {
  background: 'none', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text-secondary)',
  fontFamily: 'DM Sans', padding: '0.6rem 1rem', cursor: 'pointer'
}
const sigBtnStyle = {
  background: 'var(--sig)', border: 'none', borderRadius: 8,
  color: '#000', fontFamily: 'Syne', fontWeight: 700,
  padding: '0.6rem 1rem', cursor: 'pointer'
}