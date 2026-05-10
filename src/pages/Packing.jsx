import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/gemini';
import PageWrapper from '../components/layout/PageWrapper';

const CATEGORIES = [
  { label: 'Clothing & Gear',  icon: '👕', items: ['T-shirts','Pants','Jacket','Comfortable shoes','Sunglasses','Hat'] },
  { label: 'Toiletries',       icon: '🧴', items: ['Toothbrush','Toothpaste','Shampoo','Deodorant','Sunscreen','Moisturizer'] },
  { label: 'Electronics',      icon: '🔌', items: ['Phone charger','Power bank','Universal adapter','Earphones','Camera'] },
  { label: 'Documents',        icon: '📄', items: ['Passport','Visa printout','Travel insurance','Hotel bookings','Flight tickets'] },
  { label: 'Health & Safety',  icon: '💊', items: ['Pain relievers','Allergy medicine','Band-aids','Hand sanitizer','Masks'] },
  { label: 'Entertainment',    icon: '🎮', items: ['Book/e-reader','Travel games','Journal','Headphones'] },
];

const inpStyle = "bg-black/40 border border-white/10 rounded-xl text-white text-sm px-4 py-3 outline-none focus:border-sig/50 transition-all w-full placeholder:text-white/20";
const btnStyle = "px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50";

export default function Packing() {
  const { tripId } = useParams();
  const [trip,    setTrip]    = useState(null);
  const [items,   setItems]   = useState({});
  const [checked, setChecked] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiItems, setAiItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newCat,  setNewCat]  = useState('Clothing & Gear');

  useEffect(() => {
    supabase.from('trips').select('*').eq('id', tripId).single().then(({ data }) => data && setTrip(data));
    supabase.from('packing_items').select('*').eq('trip_id', tripId).then(({ data }) => {
      if (data) {
        const map = {};
        const ch  = {};
        data.forEach(d => { 
          if (!map[d.category]) map[d.category] = [];
          map[d.category].push({ id:d.id, name:d.name });
          if (d.checked) ch[d.id] = true;
        });
        setItems(map); setChecked(ch);
      }
    });
  }, [tripId]);

  useEffect(() => {
    if (Object.keys(items).length === 0 && trip) {
      const defaultMap = {};
      CATEGORIES.forEach(cat => { defaultMap[cat.label] = cat.items.map(name => ({ id: null, name })); });
      setItems(defaultMap);
    }
  }, [trip]);

  const toggle = async (id, catLabel, itemName) => {
    const key = id || `${catLabel}_${itemName}`;
    setChecked(p => ({ ...p, [key]: !p[key] }));
    if (id) await supabase.from('packing_items').update({ checked: !checked[id] }).eq('id', id);
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    const { data } = await supabase.from('packing_items').insert({ trip_id:tripId, name:newItem.trim(), category:newCat, checked:false }).select().single();
    const entry = data ? { id:data.id, name:data.name } : { id:null, name:newItem.trim() };
    setItems(p => ({ ...p, [newCat]: [...(p[newCat]||[]), entry] }));
    setNewItem('');
  };

  const generateAIPacking = async () => {
    if (!trip) return;
    setAiLoading(true);
    const sys = `You are a travel packing expert. Return ONLY a JSON array of strings. No markdown, no explanation.`;
    const prompt = `Trip: "${trip.name}". Destination vibe: ${trip.ai_vibe_summary || 'Unknown'}.
Generate 8 unique packing items specifically for this trip that aren't common essentials. Think of specialty gear or localized needs. Return: ["item1","item2",...]`;
    const raw = await askGemini(sys, prompt);
    try {
      const clean = raw.replace(/```json|```/g,'').trim();
      setAiItems(JSON.parse(clean));
    } catch { setAiItems(['Compact umbrella','Travel towel','Padlock','Offline maps']); }
    setAiLoading(false);
  };

  const addAIItem = async (name) => {
    const { data } = await supabase.from('packing_items').insert({ trip_id:tripId, name, category:'AI Suggestions', checked:false }).select().single();
    const entry = data ? { id:data.id, name } : { id:null, name };
    setItems(p => ({ ...p, 'AI Suggestions': [...(p['AI Suggestions']||[]), entry] }));
    setAiItems(p => p.filter(i => i !== name));
  };

  const allItems  = Object.values(items).flat();
  const doneCount = allItems.filter(i => checked[i.id || `${Object.entries(items).find(([,v])=>v.includes(i))?.[0]}_${i.name}`]).length;
  const pct = allItems.length > 0 ? Math.round(doneCount / allItems.length * 100) : 0;

  if (!trip) return null;

  return (
    <PageWrapper
      title="Packing Master"
      subtitle={`Preparing for your expedition to ${trip.name}.`}
      emoji="🎒"
      backLink={`/trip/${tripId}/view`}
      backLabel="Itinerary"
      coverUrl="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1920&q=85"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: List and Add */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Progress Card */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="text-8xl font-display font-bold">{pct}%</span>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sig mb-1">Status</p>
                  <h3 className="text-2xl font-display font-bold text-white italic">{doneCount} / {allItems.length} Packed</h3>
                </div>
                <span className="text-3xl font-display font-bold text-sig italic">{pct}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-sig shadow-[0_0_15px_rgba(var(--sig-rgb),0.5)]" 
                />
              </div>
              {pct === 100 && (
                <p className="mt-4 text-sm text-sig font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  Expedition ready. All gear secured.
                </p>
              )}
            </div>
          </div>

          {/* Add Item Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                placeholder="New custom item..." 
                className={inpStyle}
                value={newItem} 
                onChange={e => setNewItem(e.target.value)} 
                onKeyDown={e => e.key==='Enter' && addItem()} 
              />
              <div className="flex gap-4">
                <select 
                  className={`${inpStyle} md:w-48`}
                  value={newCat} 
                  onChange={e => setNewCat(e.target.value)}
                >
                  {[...CATEGORIES.map(c=>c.label),'AI Suggestions'].map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                </select>
                <button 
                  onClick={addItem}
                  className={`${btnStyle} bg-sig text-black hover:scale-105`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* AI Suggestions Box */}
          <AnimatePresence>
            {aiItems.length > 0 && (
              <motion.div 
                initial={{ opacity:0, y: 20 }} 
                animate={{ opacity:1, y:0 }} 
                exit={{ opacity:0, scale: 0.95 }}
                className="bg-sig/10 border border-sig/30 rounded-2xl p-6 relative"
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sig">AI Recommended Gear</p>
                  <button onClick={() => setAiItems([])} className="text-sig/50 hover:text-sig">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiItems.map(item => (
                    <button 
                      key={item} 
                      onClick={() => addAIItem(item)} 
                      className="px-4 py-2 bg-black/40 border border-sig/20 rounded-lg text-xs text-white/80 hover:bg-sig hover:text-black hover:border-sig transition-all"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Packing Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(items).map(([catLabel, catItems]) => {
              const catDone = catItems.filter(i => checked[i.id || `${catLabel}_${i.name}`]).length;
              const cat = CATEGORIES.find(c => c.label === catLabel);
              return (
                <div key={catLabel} className="bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat?.icon || '✨'}</span>
                      <h4 className="font-bold text-white text-sm">{catLabel}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{catDone} / {catItems.length}</span>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {catItems.map((item, ii) => {
                      const key = item.id || `${catLabel}_${item.name}`;
                      const done = checked[key];
                      return (
                        <button 
                          key={ii} 
                          onClick={() => toggle(item.id, catLabel, item.name)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                            done 
                              ? 'bg-sig/20 border-sig/40 text-sig line-through opacity-60' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                          }`}
                        >
                          {done && '✓ '}{item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <button 
              onClick={generateAIPacking} 
              disabled={aiLoading}
              className="w-full group relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:border-sig/40 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sig/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-sig/10 flex items-center justify-center mb-4 text-sig">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h4 className="text-lg font-display font-bold text-white mb-2 italic">AI Smart Pack</h4>
                <p className="text-xs text-white/40 leading-relaxed mb-4">
                  Let AI analyze your destination and vibes to suggest essential items you might miss.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sig">
                  {aiLoading ? 'Analyzing Itinerary...' : 'Analyze Trip →'}
                </div>
              </div>
            </button>

            <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
              <h4 className="text-white font-bold text-sm mb-4">Packing Tips</h4>
              <ul className="space-y-4">
                {[
                  { t: 'Roll, Don\'t Fold', d: 'Maximize space and minimize wrinkles.' },
                  { t: 'Packing Cubes', d: 'Organize items by category for easy access.' },
                  { t: 'Essential Kit', d: 'Keep meds and docs in your carry-on.' }
                ].map((tip, i) => (
                  <li key={i}>
                    <p className="text-xs font-bold text-white/70 mb-0.5">{tip.t}</p>
                    <p className="text-[10px] text-white/30">{tip.d}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
