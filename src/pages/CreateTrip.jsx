<<<<<<< HEAD
// src/pages/CreateTrip.jsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { generateTripMood } from '../lib/gemini'

export default function CreateTrip() {
  const navigate = useNavigate()
  const fileRef = useRef()
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' })
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [mood, setMood] = useState(null) // { emoji, color, vibe }
  const [generatingMood, setGeneratingMood] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleGenerateMood = async () => {
    if (!form.name) { setError('Enter a trip name first'); return }
    setGeneratingMood(true)
    const result = await generateTripMood(form.name, []) // cities come later from builder
    setMood(result)
    setGeneratingMood(false)
  }

  const handleSave = async () => {
    if (!form.name) { setError('Trip name is required'); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let coverUrl = null

      if (coverFile) {
        const path = `${user.id}/${Date.now()}-${coverFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('trip-covers').upload(path, coverFile)
        if (!uploadError) {
          coverUrl = supabase.storage.from('trip-covers').getPublicUrl(uploadData.path).data.publicUrl
        }
      }

      const { data: trip, error: tripError } = await supabase.from('trips').insert({
        user_id: user.id,
        name: form.name,
        description: form.description,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        cover_url: coverUrl,
        mood_emoji: mood?.emoji || '✈️',
        mood_color: mood?.color || 'hsl(38, 92%, 58%)',
        ai_vibe_summary: mood?.vibe || null,
      }).select().single()

      if (tripError) throw tripError
      navigate(`/trip/${trip.id}/build`)   // goes to Sashidhar's ItineraryBuilder
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--sp-6) var(--sp-4)' }}>
      <h1 style={{ fontFamily: 'Syne', fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', marginBottom: 'var(--sp-4)' }}>
        Plan a new trip
      </h1>

      {/* Cover photo upload — click anywhere on the box */}
      <div
        onClick={() => fileRef.current.click()}
        style={{
          height: 200, borderRadius: 16, marginBottom: 'var(--sp-4)',
          background: coverPreview ? `url(${coverPreview}) center/cover` : 'var(--bg-elevated)',
          border: coverPreview ? 'none' : '2px dashed var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative', overflow: 'hidden'
        }}
      >
        {!coverPreview && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
            <p style={{ fontSize: 'var(--text-sm)' }}>Add a cover photo (optional)</p>
          </div>
        )}
        {coverPreview && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, hsla(220,18%,7%,0.7) 0%, transparent 50%)'
          }} />
=======
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/gemini';

async function generateTripMood(tripName) {
  const prompt = `For a trip called "${tripName}", generate a travel mood in JSON format only:
{"emoji":"<one travel emoji>","color":"hsl(<hue>,70%,55%)","vibe":"<poetic one-sentence vibe, max 12 words>"}
Return ONLY valid JSON. No markdown, no explanation.`;
  try {
    const raw = await askGemini('You are a creative travel mood generator. Return only JSON.', prompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { emoji: '✈️', color: 'hsl(22,92%,52%)', vibe: 'An unforgettable adventure awaits.' };
  }
}

/* ── Styled helpers ── */
const inp = {
  width: '100%', padding: '14px 16px', background: '#0d0d0d',
  border: '1px solid #1a1a1a', borderRadius: 12, color: '#e5e5e5',
  fontSize: 14, fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color 0.2s',
};

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#555' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CreateTrip() {
  const navigate = useNavigate();
  const fileRef  = useRef();
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const [coverFile,    setCoverFile]    = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [mood,         setMood]         = useState(null);
  const [generatingMood, setGeneratingMood] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleGenerateMood = async () => {
    if (!form.name) { setError('Enter a trip name first'); return; }
    setError('');
    setGeneratingMood(true);
    const result = await generateTripMood(form.name);
    setMood(result);
    setGeneratingMood(false);
  };

  const handleSave = async () => {
    if (!form.name) { setError('Trip name is required'); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      let coverUrl = null;
      if (coverFile) {
        const path = `${user.id}/${Date.now()}-${coverFile.name}`;
        const { data: up, error: ue } = await supabase.storage.from('trip-covers').upload(path, coverFile);
        if (!ue) coverUrl = supabase.storage.from('trip-covers').getPublicUrl(up.path).data.publicUrl;
      }

      const { data: trip, error: te } = await supabase.from('trips').insert({
        user_id:        user.id,
        name:           form.name,
        description:    form.description,
        start_date:     form.start_date || null,
        end_date:       form.end_date   || null,
        cover_url:      coverUrl,
        mood_emoji:     mood?.emoji  || '✈️',
        mood_color:     mood?.color  || 'var(--sig)',
        ai_vibe_summary: mood?.vibe  || null,
      }).select().single();
      if (te) throw te;
      navigate(`/trip/${trip.id}/build`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' }}
    >
      {/* Page heading */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'var(--sig)', marginBottom: 8 }}>
          New Adventure
        </p>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, fontStyle: 'italic', color: '#fff', lineHeight: 1.1 }}>
          Plan a new trip.
        </h1>
      </div>

      {/* Cover photo zone */}
      <div
        onClick={() => fileRef.current.click()}
        style={{
          height: 220, borderRadius: 16, marginBottom: 28, cursor: 'pointer',
          background: coverPreview ? `url(${coverPreview}) center/cover no-repeat` : '#0d0d0d',
          border: coverPreview ? 'none' : '2px dashed #222',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => !coverPreview && (e.currentTarget.style.borderColor = 'var(--sig)')}
        onMouseLeave={e => !coverPreview && (e.currentTarget.style.borderColor = '#222')}
      >
        {coverPreview && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />}
        {!coverPreview && (
          <div style={{ textAlign: 'center', color: '#444' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
            <p style={{ fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>Click to add a cover photo</p>
            <p style={{ fontSize: 11, marginTop: 4, color: '#333' }}>Optional — JPEG, PNG, WebP</p>
          </div>
        )}
        {coverPreview && (
          <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#aaa', backdropFilter: 'blur(8px)' }}>
            Click to change
          </div>
>>>>>>> 91b39e0c8ca6400c21a979ad2019d560f87855f8
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

      {/* Form fields */}
<<<<<<< HEAD
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        <label style={labelStyle}>Trip Name *</label>
        <input
          placeholder="e.g. European Summer 2025"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          style={inputStyle}
        />

        <label style={labelStyle}>Description</label>
        <textarea
          placeholder="What's the story of this trip?"
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
          <div>
            <label style={labelStyle}>Start Date</label>
            <input type="date" value={form.start_date}
              onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>End Date</label>
            <input type="date" value={form.end_date}
              onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
              style={inputStyle} />
          </div>
        </div>

        {/* AI Mood Generator box */}
        <div style={{
          background: 'var(--bg-elevated)', borderRadius: 12,
          padding: 'var(--sp-3)', border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-primary)' }}>
                ✨ AI Trip Mood
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                Generate a vibe, emoji & color palette for your trip
              </div>
            </div>
            <button onClick={handleGenerateMood} disabled={generatingMood} style={moodBtnStyle}>
              {generatingMood ? 'Thinking...' : 'Generate'}
            </button>
          </div>

          {/* Animated mood result */}
=======
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Trip Name *">
          <input
            placeholder="e.g. Cherry Blossom Japan 2025"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            style={inp}
            onFocus={e => e.target.style.borderColor = 'var(--sig)'}
            onBlur={e => e.target.style.borderColor = '#1a1a1a'}
          />
        </Field>

        <Field label="Description">
          <textarea
            placeholder="What's the story of this trip?"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            style={{ ...inp, resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = 'var(--sig)'}
            onBlur={e => e.target.style.borderColor = '#1a1a1a'}
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Start Date">
            <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
              style={inp} onFocus={e => e.target.style.borderColor = 'var(--sig)'} onBlur={e => e.target.style.borderColor = '#1a1a1a'} />
          </Field>
          <Field label="End Date">
            <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}
              style={inp} onFocus={e => e.target.style.borderColor = 'var(--sig)'} onBlur={e => e.target.style.borderColor = '#1a1a1a'} />
          </Field>
        </div>

        {/* AI Mood Generator */}
        <div style={{ background: '#0d0d0d', borderRadius: 14, padding: 20, border: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#fff', fontSize: 15 }}>✨ AI Trip Mood</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>Generate a vibe, emoji & colour palette</div>
            </div>
            <button
              onClick={handleGenerateMood}
              disabled={generatingMood}
              style={{
                background: 'none', border: '1px solid var(--sig)', borderRadius: 8,
                color: 'var(--sig)', fontWeight: 700, padding: '8px 16px', cursor: 'pointer',
                fontSize: 12, whiteSpace: 'nowrap', fontFamily: 'Outfit, sans-serif',
                opacity: generatingMood ? 0.6 : 1,
              }}
            >
              {generatingMood ? 'Generating…' : 'Generate'}
            </button>
          </div>

>>>>>>> 91b39e0c8ca6400c21a979ad2019d560f87855f8
          <AnimatePresence>
            {mood && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
<<<<<<< HEAD
                style={{ marginTop: 'var(--sp-2)', paddingTop: 'var(--sp-2)', borderTop: '1px solid var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <span style={{ fontSize: 32 }}>{mood.emoji}</span>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: mood.color, border: '2px solid var(--border)'
                  }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontStyle: 'italic', flex: 1 }}>
                    "{mood.vibe}"
                  </p>
                </div>
=======
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: 14 }}
              >
                <span style={{ fontSize: 36 }}>{mood.emoji}</span>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: mood.color, border: '2px solid #222', flexShrink: 0 }} />
                <p style={{ color: '#888', fontSize: 14, fontStyle: 'italic', flex: 1, lineHeight: 1.5 }}>"{mood.vibe}"</p>
>>>>>>> 91b39e0c8ca6400c21a979ad2019d560f87855f8
              </motion.div>
            )}
          </AnimatePresence>
        </div>

<<<<<<< HEAD
        {error && <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>{error}</p>}

        <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>
          {saving ? 'Creating trip...' : 'Create Trip & Build Itinerary →'}
        </button>
      </div>
    </div>
  )
}

// ─── Shared styles ───────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
  fontFamily: 'DM Sans', marginBottom: 4
}
const inputStyle = {
  width: '100%', padding: '0.75rem 1rem',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'DM Sans',
  fontSize: 'var(--text-base)', boxSizing: 'border-box'
}
const primaryBtnStyle = {
  background: 'var(--sig)', border: 'none', borderRadius: 10,
  color: '#000', fontFamily: 'Syne', fontWeight: 700,
  fontSize: 'var(--text-base)', padding: '0.9rem', cursor: 'pointer',
  marginTop: 'var(--sp-2)'
}
const moodBtnStyle = {
  background: 'none', border: '1px solid var(--sig)',
  borderRadius: 8, color: 'var(--sig)', fontFamily: 'Syne', fontWeight: 700,
  padding: '0.5rem 1rem', cursor: 'pointer', fontSize: 'var(--text-sm)',
  whiteSpace: 'nowrap'
}
=======
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--danger)', fontSize: 13 }}>
            ⚠ {error}
          </motion.p>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !form.name}
          style={{
            background: 'var(--sig)', border: 'none', borderRadius: 12, color: '#000',
            fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: 16,
            padding: '16px', cursor: 'pointer', marginTop: 8,
            boxShadow: saving ? 'none' : 'var(--glow-sm)',
            opacity: saving || !form.name ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          {saving ? 'Creating trip…' : 'Create Trip & Build Itinerary →'}
        </button>
      </div>
    </motion.div>
  );
}
>>>>>>> 91b39e0c8ca6400c21a979ad2019d560f87855f8
