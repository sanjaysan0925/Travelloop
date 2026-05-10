import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/gemini';
import PageWrapper from '../components/layout/PageWrapper';

/* ── Recharts loaded dynamically ── */
let RC = null;

const CATS = ['accommodation', 'food', 'transport', 'activities', 'shopping', 'misc'];
const CAT_COLORS = { accommodation:'#ff6b00', food:'#ff9a3c', transport:'#ffc270', activities:'#ff4500', shopping:'#cc3700', misc:'#662000' };
const CAT_ICONS  = { accommodation:'🏨', food:'🍜', transport:'✈️', activities:'🎟️', shopping:'🛍️', misc:'💸' };

const inpStyle = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-sig/50 transition-colors placeholder:text-white/20";
const btnStyle = "px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95";

export default function Budget() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [newExp, setNewExp] = useState({ label:'', amount:'', category:'food', date:'' });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [budget, setBudget] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [rcReady, setRcReady] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function loadData() {
      const { data: tripData } = await supabase.from('trips').select('*').eq('id', tripId).single();
      if (tripData) {
        setTrip(tripData);
        if (tripData.budget) setBudget(String(tripData.budget));
      }
      const { data: expData } = await supabase.from('expenses').select('*').eq('trip_id', tripId).order('created_at');
      if (expData) setExpenses(expData);
    }
    loadData();
  }, [tripId]);

  useEffect(() => {
    if (window.Recharts) { RC = window.Recharts; setRcReady(true); return; }
    const sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/recharts@2.12.7/umd/Recharts.js';
    sc.onload = () => { RC = window.Recharts; setRcReady(true); };
    document.body.appendChild(sc);
  }, []);

  const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const remaining = budget ? Number(budget) - total : null;

  const catData = CATS.map(c => ({
    name: c, 
    value: expenses.filter(e => e.category === c).reduce((s, e) => s + (Number(e.amount) || 0), 0), 
    color: CAT_COLORS[c],
  })).filter(d => d.value > 0);

  const dailyMap = {};
  expenses.forEach(e => { 
    const d = e.date || 'unknown'; 
    dailyMap[d] = (dailyMap[d] || 0) + (Number(e.amount) || 0); 
  });
  
  const dailyData = Object.entries(dailyMap)
    .sort(([a],[b]) => {
      if (a === 'unknown') return 1;
      if (b === 'unknown') return -1;
      return new Date(a) - new Date(b);
    })
    .map(([date, amount]) => ({ 
      date: date === 'unknown' ? '?' : new Date(date+'T00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'}), 
      amount 
    }));

  const addExpense = async () => {
    if (!newExp.label || !newExp.amount) return;
    setSaving(true);
    const { data, error } = await supabase.from('expenses').insert({ 
      ...newExp, 
      amount: Number(newExp.amount), 
      trip_id: tripId 
    }).select().single();
    
    if (data) {
      setExpenses(p => [...p, data]);
      setNewExp({ label:'', amount:'', category:'food', date:'' });
      setAdding(false);
    }
    setSaving(false);
  };

  const delExpense = async id => {
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses(p => p.filter(e => e.id !== id));
  };

  const saveBudget = async () => {
    await supabase.from('trips').update({ budget: Number(budget) }).eq('id', tripId);
  };

  const getAiAdvice = async () => {
    if (!trip) return;
    setAiLoading(true);
    const sys = `You are a travel finance advisor. Be concise, practical, and premium. Use bullet points.`;
    const prompt = `Trip: "${trip.name}". Budget: $${budget || 'not set'}. Total spent: $${total.toFixed(2)}. 
Breakdown: ${CATS.map(c => `${c}: $${expenses.filter(e=>e.category===c).reduce((s,e)=>s+(Number(e.amount)||0),0).toFixed(2)}`).join(', ')}.
Give 4-5 practical tips to manage this travel budget better for a luxury experience.`;
    const ans = await askGemini(sys, prompt);
    setAiAdvice(ans);
    setAiLoading(false);
  };

  if (!trip) return <div className="flex items-center justify-center h-screen text-white/20 font-display italic text-2xl">Loading luxury tracker...</div>;

  return (
    <PageWrapper
      title="Budget Tracker"
      subtitle={`Managing expenses for ${trip.name}`}
      emoji={trip.mood_emoji || '💰'}
      coverUrl={trip.cover_url || 'https://images.unsplash.com/photo-1434031215912-05305e367507?auto=format&fit=crop&w=1920&q=80'}
      backLink={`/trip/${tripId}/view`}
      actions={
        <button 
          onClick={() => setAdding(true)}
          className={`${btnStyle} bg-sig text-black shadow-sig-glow hover:scale-105`}
        >
          + Add Expense
        </button>
      }
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label:'Total Budget', value: budget ? `$${Number(budget).toLocaleString()}` : '—', sub:'Total cap', color:'#fff' },
            { label:'Total Spent',  value: `$${total.toFixed(2)}`, sub:`${expenses.length} items`, color:'var(--sig)' },
            { label:'Remaining',    value: remaining !== null ? `$${remaining.toFixed(2)}` : '—', sub: remaining < 0 ? 'Over budget' : 'available', color: remaining < 0 ? '#ff4444' : '#4caf50' },
            { label:'Daily Avg',    value: dailyData.length ? `$${(total/dailyData.length).toFixed(0)}` : '—', sub:'per day', color:'#888' },
          ].map(c => (
            <div key={c.label} className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">{c.label}</p>
              <p className="font-display text-3xl font-bold italic truncate" style={{ color: c.color }}>{c.value}</p>
              <p className="text-[11px] text-white/20 mt-2">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Set Budget Section */}
        <div className="flex flex-wrap gap-4 items-center bg-white/5 p-6 rounded-2xl border border-white/5">
          <div className="flex-1 min-w-[200px]">
            <input 
              placeholder="Set total budget limit" 
              value={budget} 
              onChange={e => setBudget(e.target.value)} 
              type="number" 
              className={inpStyle} 
            />
          </div>
          <button 
            onClick={saveBudget} 
            className={`${btnStyle} bg-white/10 text-white hover:bg-white/20 border border-white/10`}
          >
            Update Limit
          </button>
        </div>

        {/* Add Expense Form Modal-like */}
        <AnimatePresence>
          {adding && (
            <motion.div 
              initial={{ opacity:0, scale:0.95 }} 
              animate={{ opacity:1, scale:1 }} 
              exit={{ opacity:0, scale:0.95 }}
              className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-8"
            >
              <h3 className="font-display text-xl font-bold italic text-white mb-6">New Expense</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input placeholder="What did you buy? *" value={newExp.label} onChange={e => setNewExp(p=>({...p,label:e.target.value}))} className={inpStyle} />
                <input placeholder="Amount (USD) *" type="number" value={newExp.amount} onChange={e => setNewExp(p=>({...p,amount:e.target.value}))} className={inpStyle} />
                <input type="date" value={newExp.date} onChange={e => setNewExp(p=>({...p,date:e.target.value}))} className={inpStyle} />
                <select value={newExp.category} onChange={e => setNewExp(p=>({...p,category:e.target.value}))} className={inpStyle}>
                  {CATS.map(c => <option key={c} value={c} className="bg-black">{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={addExpense} disabled={saving||!newExp.label||!newExp.amount} className={`${btnStyle} bg-sig text-black flex-1 ${saving?'opacity-50':''}`}>
                  {saving?'Recording...':'Add Expense'}
                </button>
                <button onClick={() => setAdding(false)} className={`${btnStyle} bg-white/5 text-white/50 px-8`}>Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs & Content */}
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'overview', label: 'Analytics', icon: '📊' },
              { id: 'list', label: 'History', icon: '📋' },
              { id: 'ai', label: 'AI Advisor', icon: '✨' },
            ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id)} 
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === t.id ? 'bg-sig text-black shadow-sig-glow' : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-6">Spend by Category</p>
                  {rcReady && catData.length > 0 ? (
                    <RC.ResponsiveContainer width="100%" height={240}>
                      <RC.PieChart>
                        <RC.Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} strokeWidth={0} paddingAngle={5}>
                          {catData.map((c, i) => <RC.Cell key={i} fill={c.color} />)}
                        </RC.Pie>
                        <RC.Tooltip 
                          contentStyle={{ background:'rgba(0,0,0,0.8)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, backdropFilter:'blur(10px)' }}
                          itemStyle={{ color:'#fff', fontSize:12 }}
                        />
                      </RC.PieChart>
                    </RC.ResponsiveContainer>
                  ) : (
                    <div className="h-[240px] flex items-center justify-center text-white/10 italic text-sm">No spend data yet</div>
                  )}
                </div>

                <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-6">Daily Trend</p>
                  {rcReady && dailyData.length > 0 ? (
                    <RC.ResponsiveContainer width="100%" height={240}>
                      <RC.BarChart data={dailyData} barSize={12}>
                        <RC.XAxis dataKey="date" tick={{ fontSize:9, fill:'rgba(255,255,255,0.2)' }} axisLine={false} tickLine={false} />
                        <RC.YAxis hide />
                        <RC.Tooltip 
                           contentStyle={{ background:'rgba(0,0,0,0.8)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, backdropFilter:'blur(10px)' }}
                        />
                        <RC.Bar dataKey="amount" fill="var(--sig)" radius={[6,6,0,0]} />
                      </RC.BarChart>
                    </RC.ResponsiveContainer>
                  ) : (
                    <div className="h-[240px] flex items-center justify-center text-white/10 italic text-sm">Waiting for dates...</div>
                  )}
                </div>

                <div className="md:col-span-2 bg-black/40 border border-white/5 rounded-2xl p-8">
                  <div className="grid gap-6">
                    {CATS.map(c => {
                      const amt = expenses.filter(e=>e.category===c).reduce((s,e)=>s+(Number(e.amount)||0),0);
                      const pct = total > 0 ? (amt/total*100) : 0;
                      return (
                        <div key={c}>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{CAT_ICONS[c]} {c}</span>
                            <span className="text-xs font-mono text-white/30">${amt.toFixed(2)} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${pct}%` }} 
                              className="h-full rounded-full" 
                              style={{ background: CAT_COLORS[c] }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'list' && (
              <div className="space-y-3">
                {expenses.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-4xl mb-4">💸</p>
                    <p className="text-white/20 font-medium italic">Your expense list is empty.</p>
                  </div>
                ) : expenses.map(e => (
                  <motion.div 
                    key={e.id} 
                    layout
                    initial={{ opacity:0, y:10 }} 
                    animate={{ opacity:1, y:0 }}
                    className="group bg-black/40 hover:bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-6 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                      {CAT_ICONS[e.category]||'💸'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white mb-1">{e.label}</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/30">
                        {e.category} {e.date && `· ${new Date(e.date+'T00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-display font-bold italic text-sig">${Number(e.amount).toFixed(2)}</div>
                      <button 
                        onClick={() => delExpense(e.id)} 
                        className="text-[10px] font-bold text-white/10 hover:text-red-500 uppercase tracking-widest transition-colors mt-1"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-sig/20 flex items-center justify-center text-sig">✨</div>
                  <h3 className="font-display text-xl font-bold italic text-white">Luxury Budget Advisor</h3>
                </div>
                
                {!aiAdvice && !aiLoading && (
                  <div className="text-center py-10">
                    <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto italic">Get personalized insights on how to optimize your travel funds for a premium experience.</p>
                    <button 
                      onClick={getAiAdvice} 
                      className={`${btnStyle} bg-sig text-black shadow-sig-glow px-12`}
                    >
                      Analyze My Spending
                    </button>
                  </div>
                )}
                
                {aiLoading && (
                  <div className="space-y-4 py-10">
                    <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
                    <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse" />
                    <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse" />
                  </div>
                )}
                
                {aiAdvice && (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                    <div className="prose prose-invert max-w-none text-sm text-white/60 leading-relaxed whitespace-pre-wrap font-medium">
                      {aiAdvice}
                    </div>
                    <button 
                      onClick={getAiAdvice} 
                      disabled={aiLoading} 
                      className="mt-10 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-sig transition-colors"
                    >
                      {aiLoading ? 'Refreshing...' : 'Refresh Analysis'}
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

