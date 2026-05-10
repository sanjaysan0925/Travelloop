import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/gemini';
import { searchCities } from '../lib/cityData';
import AICopilot from '../components/ai/AICopilot';

const inp = { background:'#0a0a0a', border:'1px solid #1e1e1e', borderRadius:8, color:'#e5e5e5', fontFamily:'Outfit,sans-serif', fontSize:13, padding:'10px 13px', outline:'none', width:'100%', boxSizing:'border-box', transition:'border-color 0.2s' };
const btn = (x={}) => ({ fontFamily:'Outfit,sans-serif', fontWeight:700, cursor:'pointer', border:'none', borderRadius:8, transition:'all 0.2s', ...x });

const ICONS = { food:'🍜', sightseeing:'🏛️', adventure:'🧗', transport:'✈️', accommodation:'🏨', shopping:'🛍️', nature:'🌿', nightlife:'🎉', culture:'🎭', relaxation:'🧘', other:'📍' };

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const mapRef = useRef(null);
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newStop, setNewStop] = useState({ title:'', location:'', category:'sightseeing', date:'', notes:'', lat:null, lng:null });
  const [cityQ, setCityQ] = useState('');
  const [citySug, setCitySug] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [aiChat, setAiChat] = useState([]);
  const [aiIn, setAiIn] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    supabase.from('trips').select('*').eq('id', tripId).single().then(({ data }) => data && setTrip(data));
    supabase.from('itinerary_stops').select('*').eq('trip_id', tripId).order('order_index').then(({ data }) => data && setStops(data));
  }, [tripId]);

  useEffect(() => {
    if (!mapRef.current || mapReady) return;
    const lnk = document.createElement('link'); lnk.rel = 'stylesheet'; lnk.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(lnk);
    const sc = document.createElement('script'); sc.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    sc.onload = () => {
      setMapReady(true);
      window._map = window.L.map(mapRef.current, { zoomControl: false }).setView([20, 0], 2);
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(window._map);
      window.L.control.zoom({ position: 'bottomright' }).addTo(window._map);
    };
    document.body.appendChild(sc);
  }, []);

  useEffect(() => {
    if (!mapReady || !window._map) return;
    (window._marks || []).forEach(m => m.remove());
    window._marks = stops.filter(s => s.lat && s.lng).map((s, i) => {
      const icon = window.L.divIcon({ className: '', html: `<div style="width:26px;height:26px;background:hsl(22,92%,52%);border-radius:50%;border:2px solid #000;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;color:#000;box-shadow:0 0 10px rgba(255,107,0,0.5)">${i+1}</div>`, iconSize:[26,26], iconAnchor:[13,13] });
      return window.L.marker([s.lat, s.lng], { icon }).addTo(window._map).bindPopup(`<b>${s.title}</b><br><small>${s.location||''}</small>`);
    });
    const pts = stops.filter(s => s.lat && s.lng).map(s => [s.lat, s.lng]);
    if (pts.length) window._map.fitBounds(pts, { padding: [40, 40] });
  }, [stops, mapReady]);

  useEffect(() => { setCitySug(searchCities(cityQ)); }, [cityQ]);

  const selectCity = c => { setNewStop(p => ({ ...p, location: `${c.name}, ${c.country}`, lat: c.lat, lng: c.lng })); setCityQ(`${c.name}, ${c.country}`); setShowDrop(false); };

  const addStop = async () => {
    if (!newStop.title) return;
    setSaving(true);
    const { data } = await supabase.from('itinerary_stops').insert({ ...newStop, trip_id: tripId, order_index: stops.length }).select().single();
    if (data) setStops(p => [...p, data]);
    setNewStop({ title:'', location:'', category:'sightseeing', date:'', notes:'', lat:null, lng:null }); setCityQ(''); setAdding(false); setSaving(false);
  };

  const delStop = async id => { await supabase.from('itinerary_stops').delete().eq('id', id); setStops(p => p.filter(s => s.id !== id)); };

  const reorder = async newOrder => {
    setStops(newOrder);
    for (let i = 0; i < newOrder.length; i++) await supabase.from('itinerary_stops').update({ order_index: i }).eq('id', newOrder[i].id);
  };

  const sendAI = async () => {
    if (!aiIn.trim()) return;
    const q = aiIn.trim(); setAiChat(p => [...p, { role:'user', text:q }]); setAiIn(''); setAiLoading(true);
    const sys = `You are a travel planning expert. Trip: "${trip?.name}". Stops: ${stops.map(s => s.title + ' at ' + s.location).join(', ') || 'none yet'}.`;
    const ans = await askGemini(sys, q);
    setAiChat(p => [...p, { role:'ai', text:ans }]); setAiLoading(false);
  };

  if (!trip) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#444' }}>Loading…</div>;

  const HINTS = ['What should I eat?', 'Best time to visit?', 'Day-by-day plan?', 'Rough budget estimate?'];

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ height:'calc(100vh - 64px)', display:'flex', overflow:'hidden', position: 'relative' }}>
      {/* ── Background Image ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src={trip.cover_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80'} 
          className="w-full h-full object-cover opacity-60"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
      </div>

      {/* LEFT */}
      <div style={{ width:380, flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', overflow:'hidden', background:'rgba(10,10,10,0.85)', backdropFilter:'blur(20px)', zIndex: 10 }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
          <Link to="/trips" style={{ fontSize:11, color:'#444', textDecoration:'none', letterSpacing:'0.2em', textTransform:'uppercase' }}>← My Trips</Link>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontStyle:'italic', fontSize:20, color:'#fff', margin:'8px 0 4px' }}>{trip.mood_emoji||'✈️'} {trip.name}</h1>
          <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
            {[['View',`/trip/${tripId}/view`],['Budget',`/trip/${tripId}/budget`],['Notes',`/trip/${tripId}/notes`],['Packing',`/trip/${tripId}/packing`]].map(([label,path]) => (
              <Link key={label} to={path} style={{ ...btn({ padding:'5px 12px', fontSize:11, background:'#111', color:'#666', textDecoration:'none' }) }}>{label}</Link>
            ))}
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.25em', color:'#444' }}>{stops.length} Stops</span>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setAiOpen(true)} style={btn({ background:'#111', color:'var(--sig)', border:'1px solid #1e1e1e', padding:'6px 14px', fontSize:12 })}>✨ AI Copilot</button>
              <button onClick={() => setAdding(true)} style={btn({ background:'var(--sig)', color:'#000', padding:'6px 14px', fontSize:12 })}>+ Add</button>
            </div>
          </div>

          <AnimatePresence>
            {adding && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                style={{ background:'#0d0d0d', border:'1px solid #1e1e1e', borderRadius:12, padding:14, marginBottom:12 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <input placeholder="Stop title *" value={newStop.title} onChange={e => setNewStop(p => ({ ...p, title:e.target.value }))} style={inp} />
                  <div style={{ position:'relative' }}>
                    <input placeholder="Search city…" value={cityQ} onChange={e => { setCityQ(e.target.value); setShowDrop(true); }} onFocus={() => setShowDrop(true)} style={inp} />
                    {showDrop && citySug.length > 0 && (
                      <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#111', borderRadius:8, border:'1px solid #1e1e1e', zIndex:50, maxHeight:180, overflowY:'auto' }}>
                        {citySug.map(c => (
                          <button key={c.name} onClick={() => selectCity(c)} style={{ display:'block', width:'100%', padding:'9px 12px', background:'none', border:'none', color:'#ccc', textAlign:'left', cursor:'pointer', fontSize:12, fontFamily:'Outfit,sans-serif' }}
                            onMouseEnter={e => e.currentTarget.style.background='#1a1a1a'} onMouseLeave={e => e.currentTarget.style.background='none'}>
                            {c.emoji} {c.name}, {c.country}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="date" value={newStop.date} onChange={e => setNewStop(p => ({ ...p, date:e.target.value }))} style={inp} />
                  <textarea placeholder="Notes" rows={2} value={newStop.notes} onChange={e => setNewStop(p => ({ ...p, notes:e.target.value }))} style={{ ...inp, resize:'none' }} />
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                    {Object.keys(ICONS).map(cat => (
                      <button key={cat} onClick={() => setNewStop(p => ({ ...p, category:cat }))} style={btn({ padding:'4px 10px', fontSize:11, fontWeight:700, background:newStop.category===cat?'var(--sig)':'#111', color:newStop.category===cat?'#000':'#555', border:`1px solid ${newStop.category===cat?'var(--sig)':'#1e1e1e'}` })}>{ICONS[cat]} {cat}</button>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={addStop} disabled={saving||!newStop.title} style={btn({ flex:1, padding:'9px 0', fontSize:13, background:'var(--sig)', color:'#000', opacity:saving?0.6:1 })}>{saving?'Saving…':'Add Stop'}</button>
                    <button onClick={() => setAdding(false)} style={btn({ padding:'9px 14px', fontSize:13, background:'#111', color:'#666' })}>Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {stops.length === 0 && !adding && (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#333' }}><p style={{ fontSize:28 }}>🗺️</p><p style={{ fontSize:13, marginTop:8 }}>Add your first stop!</p></div>
          )}

          <Reorder.Group axis="y" values={stops} onReorder={reorder} style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:8 }}>
            {stops.map((s, i) => (
              <Reorder.Item key={s.id} value={s} style={{ cursor:'grab' }}>
                <motion.div layout style={{ background:'#0a0a0a', border:'1px solid #1a1a1a', borderRadius:10, padding:'11px 13px', display:'flex', alignItems:'flex-start', gap:10 }}
                  whileHover={{ borderColor:'var(--sig)' }}>
                  <div style={{ width:24, height:24, background:'var(--sig)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:11, color:'#000', flexShrink:0, marginTop:2 }}>{i+1}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'#e5e5e5', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ICONS[s.category]} {s.title}</div>
                    {s.location && <div style={{ fontSize:11, color:'#555', marginTop:2 }}>{s.location}</div>}
                    {s.date && <div style={{ fontSize:11, color:'#555', marginTop:2 }}>{new Date(s.date+'T00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}</div>}
                    {s.notes && <div style={{ fontSize:11, color:'#444', marginTop:4, lineHeight:1.4 }}>{s.notes}</div>}
                  </div>
                  <button onClick={() => delStop(s.id)} style={{ background:'none', border:'none', color:'#333', cursor:'pointer', fontSize:15, padding:0, flexShrink:0 }}
                    onMouseEnter={e => e.currentTarget.style.color='#ff4444'} onMouseLeave={e => e.currentTarget.style.color='#333'}>×</button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>

      {/* MAP */}
      <div style={{ flex:1, position:'relative' }}>
        <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
        {!mapReady && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#080808', color:'#333' }}>Loading map…</div>}
        
        {/* Floating AI Trigger */}
        <button
          onClick={() => setAiOpen(true)}
          style={{ position:'absolute', bottom:30, right:30, width:60, height:60, borderRadius:'50%', background:'var(--sig)', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer', zIndex:1000, boxShadow:'0 0 20px rgba(240,109,28,0.4)', transition:'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        >
          <svg style={{ width:28, height:28 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
      </div>

      <AICopilot isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </motion.div>
  );
}
