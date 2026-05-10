<<<<<<< HEAD
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
=======
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const ICONS = { food:'🍜', sightseeing:'🏛️', adventure:'🧗', transport:'✈️', accommodation:'🏨', shopping:'🛍️', nature:'🌿', nightlife:'🎉', culture:'🎭', relaxation:'🧘', other:'📍' };

function groupByDate(stops) {
  const groups = {};
  stops.forEach(s => {
    const key = s.date || 'unscheduled';
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });
  return Object.entries(groups).sort(([a], [b]) => {
    if (a === 'unscheduled') return 1;
    if (b === 'unscheduled') return -1;
    return new Date(a) - new Date(b);
  });
}

export default function ItineraryView() {
  const { tripId } = useParams();
  const [trip,  setTrip]  = useState(null);
  const [stops, setStops] = useState([]);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.from('trips').select('*').eq('id', tripId).single().then(({ data }) => {
      if (data) { setTrip(data); setShareEnabled(data.is_public || false); }
    });
    supabase.from('itinerary_stops').select('*').eq('trip_id', tripId).order('order_index').then(({ data }) => data && setStops(data));
  }, [tripId]);

  useEffect(() => {
    if (shareEnabled) setShareLink(`${window.location.origin}/share/${tripId}`);
  }, [shareEnabled, tripId]);

  const toggleShare = async () => {
    setToggling(true);
    const next = !shareEnabled;
    await supabase.from('trips').update({ is_public: next }).eq('id', tripId);
    setShareEnabled(next);
    setToggling(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const days = groupByDate(stops);
  const duration = trip?.start_date && trip?.end_date
    ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000) + 1
    : null;

  if (!trip) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#444' }}>Loading…</div>;

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
      style={{ maxWidth:720, margin:'0 auto', padding:'32px 20px 80px' }}>

      {/* Hero header */}
      <div style={{ borderRadius:16, overflow:'hidden', marginBottom:28, position:'relative', height:200,
        background: trip.cover_url ? `url(${trip.cover_url}) center/cover no-repeat` : 'linear-gradient(135deg, #111 0%, #1a0a00 100%)' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)' }} />
        <div style={{ position:'absolute', bottom:20, left:24 }}>
          <span style={{ fontSize:36 }}>{trip.mood_emoji || '✈️'}</span>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontStyle:'italic', fontSize:'clamp(1.6rem,4vw,2.4rem)', color:'#fff', margin:'6px 0 4px', lineHeight:1.1 }}>{trip.name}</h1>
          {duration && <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{duration} days · {stops.length} stops</p>}
          {trip.ai_vibe_summary && <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', fontStyle:'italic', marginTop:4 }}>"{trip.ai_vibe_summary}"</p>}
        </div>
      </div>

      {/* Actions row */}
      <div style={{ display:'flex', gap:10, marginBottom:28, flexWrap:'wrap' }}>
        <Link to={`/trip/${tripId}/build`} style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:12, padding:'8px 16px', background:'#111', color:'#666', borderRadius:8, textDecoration:'none', border:'1px solid #1e1e1e' }}>← Edit Itinerary</Link>
        <Link to={`/trip/${tripId}/budget`} style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:12, padding:'8px 16px', background:'#111', color:'#666', borderRadius:8, textDecoration:'none', border:'1px solid #1e1e1e' }}>💰 Budget</Link>
        <Link to={`/trip/${tripId}/notes`} style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:12, padding:'8px 16px', background:'#111', color:'#666', borderRadius:8, textDecoration:'none', border:'1px solid #1e1e1e' }}>📓 Notes</Link>

        {/* Share toggle */}
        <button onClick={toggleShare} disabled={toggling}
          style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:12, padding:'8px 16px', cursor:'pointer', border:'none', borderRadius:8, transition:'all 0.2s',
            background: shareEnabled ? 'var(--sig)' : '#111', color: shareEnabled ? '#000' : '#666', opacity: toggling ? 0.6 : 1 }}>
          {toggling ? '…' : shareEnabled ? '🔗 Public — Copy Link' : '🔒 Make Public'}
        </button>
      </div>

      {/* Share link banner */}
      <AnimatePresence>
        {shareEnabled && shareLink && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            style={{ background:'#0d0d0d', border:'1px solid #1e1e1e', borderRadius:12, padding:'14px 18px', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:12, color:'#888', flex:1, fontFamily:'monospace', wordBreak:'break-all' }}>{shareLink}</span>
            <button onClick={copy} style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:12, padding:'7px 14px', background: copied?'#1a2a1a':'#111', color: copied?'#4caf50':'#888', border:`1px solid ${copied?'#4caf50':'#1e1e1e'}`, borderRadius:8, cursor:'pointer', whiteSpace:'nowrap' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {days.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#333' }}>
          <p style={{ fontSize:32 }}>🗺️</p>
          <p style={{ marginTop:8 }}>No stops yet — <Link to={`/trip/${tripId}/build`} style={{ color:'var(--sig)' }}>add them in the builder</Link>.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
          {days.map(([date, dayStops], dayIdx) => (
            <motion.div key={date} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: dayIdx * 0.06 }}>
              {/* Day label */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div style={{ background:'var(--sig)', borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:800, color:'#000', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  {date === 'unscheduled' ? 'Unscheduled' : (() => {
                    const d = new Date(date + 'T00:00');
                    return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
                  })()}
                </div>
                <div style={{ flex:1, height:1, background:'#111' }} />
                <span style={{ fontSize:11, color:'#333' }}>{dayStops.length} stop{dayStops.length!==1?'s':''}</span>
              </div>

              {/* Stops */}
              <div style={{ paddingLeft:12, borderLeft:'2px solid #111', display:'flex', flexDirection:'column', gap:12 }}>
                {dayStops.map((s, si) => (
                  <motion.div key={s.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: dayIdx * 0.06 + si * 0.04 }}
                    style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:12, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
                    <div style={{ fontSize:22, flexShrink:0, marginTop:1 }}>{ICONS[s.category] || '📍'}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:'#e5e5e5' }}>{s.title}</div>
                      {s.location && <div style={{ fontSize:12, color:'#555', marginTop:3 }}>📌 {s.location}</div>}
                      {s.notes && <div style={{ fontSize:12, color:'#444', marginTop:6, lineHeight:1.5, borderTop:'1px solid #111', paddingTop:6 }}>{s.notes}</div>}
                    </div>
                    <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#333', flexShrink:0, marginTop:4 }}>{s.category}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
>>>>>>> 91b39e0c8ca6400c21a979ad2019d560f87855f8
