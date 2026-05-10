import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/gemini';
import PageWrapper from '../components/layout/PageWrapper';

const PROMPTS = [
  'What was the most memorable moment today?',
  'Describe a local you met.',
  'What surprised you about this place?',
  'Best food you tried today?',
  'One thing you\'d do differently?',
];

export default function Notes() {
  const { tripId } = useParams();
  const [trip,   setTrip]   = useState(null);
  const [notes,  setNotes]  = useState([]);
  const [draft,  setDraft]  = useState('');
  const [title,  setTitle]  = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const textRef = useRef();

  useEffect(() => {
    supabase.from('trips').select('*').eq('id', tripId).single().then(({ data }) => data && setTrip(data));
    supabase.from('trip_notes').select('*').eq('trip_id', tripId).order('created_at', { ascending:false }).then(({ data }) => data && setNotes(data));
  }, [tripId]);

  const saveNote = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    if (editing) {
      const { data } = await supabase.from('trip_notes').update({ title, content:draft }).eq('id', editing).select().single();
      if (data) setNotes(p => p.map(n => n.id === editing ? data : n));
      setEditing(null);
    } else {
      const { data } = await supabase.from('trip_notes').insert({ trip_id:tripId, title: title || 'Note', content:draft }).select().single();
      if (data) setNotes(p => [data, ...p]);
    }
    setDraft(''); setTitle(''); setSaving(false);
  };

  const del = async id => {
    await supabase.from('trip_notes').delete().eq('id', id);
    setNotes(p => p.filter(n => n.id !== id));
  };

  const editNote = n => {
    setEditing(n.id); setDraft(n.content); setTitle(n.title || '');
    setTimeout(() => textRef.current?.focus(), 100);
  };

  const expandWithAI = async () => {
    if (!draft.trim()) return;
    setAiLoading(true);
    const sys = `You are a creative travel journal assistant. Help expand travel journal entries poetically.`;
    const ans = await askGemini(sys, `Expand and enrich this travel journal entry for the trip "${trip?.name}": "${draft}". Keep it authentic, vivid, and under 150 words.`);
    setDraft(prev => prev + '\n\n' + ans);
    setAiLoading(false);
  };

  const usePrompt = async p => {
    setShowPrompt(false);
    if (!trip) return;
    setAiLoading(true);
    const sys = `You are a poetic travel journal writer. Write in first person, vivid and personal.`;
    const starter = await askGemini(sys, `Write a 3-sentence travel journal entry for the trip "${trip?.name}" starting with the prompt: "${p}"`);
    setDraft(prev => prev ? prev + '\n\n' + starter : starter);
    setAiLoading(false);
    textRef.current?.focus();
  };

  if (!trip) return null;

  return (
    <PageWrapper
      title="Travel Journal"
      subtitle={`Chronicle your adventures in ${trip.name}.`}
      emoji="📓"
      backLink={`/trip/${tripId}/view`}
      backLabel="Itinerary"
      coverUrl="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1920&q=85"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Section */}
        <div className="lg:col-span-7">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sticky top-24">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sig mb-6">New Entry</p>
            <input 
              placeholder="Give this moment a title..." 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="bg-transparent border-none border-b border-white/10 rounded-none w-full text-2xl font-display font-bold text-white italic mb-6 outline-none focus:border-sig transition-all placeholder:text-white/10"
            />

            <textarea 
              ref={textRef} 
              placeholder="Capture the feeling, the scents, the sounds..." 
              value={draft} 
              onChange={e => setDraft(e.target.value)}
              rows={10} 
              className="bg-transparent border-none w-full text-white/80 text-lg leading-relaxed outline-none resize-none placeholder:text-white/5 no-scrollbar mb-8"
            />

            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-all"
                >
                  💡 Prompts
                </button>
                <button 
                  onClick={expandWithAI} 
                  disabled={aiLoading || !draft.trim()}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-sig hover:bg-sig/10 transition-all disabled:opacity-30"
                >
                  {aiLoading ? '✨ Writing...' : '✨ Enrich Entry'}
                </button>
              </div>

              <AnimatePresence>
                {showPrompt && (
                  <motion.div 
                    initial={{ opacity:0, height:0 }} 
                    animate={{ opacity:1, height:'auto' }} 
                    exit={{ opacity:0, height:0 }}
                    className="flex flex-wrap gap-2 overflow-hidden"
                  >
                    {PROMPTS.map(p => (
                      <button 
                        key={p} 
                        onClick={() => usePrompt(p)}
                        className="px-4 py-2 bg-black/40 border border-white/5 rounded-lg text-xs text-white/50 hover:text-sig hover:border-sig/30 transition-all text-left italic"
                      >
                        "{p}"
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                {editing && (
                  <button 
                    onClick={() => { setEditing(null); setDraft(''); setTitle(''); }}
                    className="px-6 py-3 text-white/30 text-sm font-bold hover:text-white transition-all"
                  >
                    Discard
                  </button>
                )}
                <button 
                  onClick={saveNote} 
                  disabled={saving || !draft.trim()}
                  className="px-10 py-3 bg-sig text-black font-extrabold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  {saving ? 'Archiving...' : editing ? 'Update Journal' : 'Seal Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Entries Section */}
        <div className="lg:col-span-5">
          <div className="space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2">Archived Moments</p>
            {notes.length === 0 && (
              <div className="py-20 text-center opacity-20 italic">
                <p className="text-4xl mb-4">✍️</p>
                <p>The pages are waiting.</p>
              </div>
            )}
            {notes.map(n => (
              <motion.div 
                key={n.id} 
                initial={{ opacity:0, x: 20 }} 
                animate={{ opacity:1, x:0 }}
                className="group bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white italic group-hover:text-sig transition-colors">{n.title || 'Untitled Moment'}</h3>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">
                      {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => editNote(n)} className="p-2 text-white/40 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onClick={() => del(n.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white/50 leading-relaxed line-clamp-4 whitespace-pre-wrap">{n.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
