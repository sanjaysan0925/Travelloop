import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PageWrapper from '../components/layout/PageWrapper';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function TripCard({ trip }) {
  const accentColor = trip.mood_color || 'var(--sig)';
  const glowColor   = trip.mood_color
    ? `${trip.mood_color}33`
    : 'hsla(38,92%,58%,0.15)';

  return (
    <motion.div
      variants={cardVariants}
      className="group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-400"
      style={{ transition: 'box-shadow 0.35s ease, border-color 0.35s ease, transform 0.35s ease' }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 0 35px ${glowColor}, 0 8px 40px rgba(0,0,0,0.6)`;
        e.currentTarget.style.borderColor = `${accentColor}77`;
        e.currentTarget.style.transform = 'translateY(-6px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Link to={`/trip/${trip.id}/view`} className="block">
        <div className="h-48 relative overflow-hidden bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          {trip.cover_url ? (
            <img
              src={trip.cover_url}
              alt={trip.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display font-extrabold text-white/10" style={{ fontSize: '6rem' }}>
                {trip.name?.[0] ?? 'T'}
              </span>
            </div>
          )}
          <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-sig/80 text-black px-4 py-2 rounded-full shadow-lg">
              Explore →
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: accentColor }} />
            <h3 className="font-display font-bold text-xl text-white group-hover:text-sig transition-colors duration-300">
              {trip.name}
            </h3>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
            {trip.start_date
              ? new Date(trip.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Dates Pending'}
            {trip.end_date ? ` — ${new Date(trip.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
          </p>
          <p className="mt-4 text-xs text-white/60 line-clamp-2 leading-relaxed">
            {trip.ai_vibe_summary || 'No vibe summary yet. Start building your itinerary.'}
          </p>
        </div>
      </Link>

      <div className="flex gap-2 px-6 pb-6 overflow-x-auto no-scrollbar">
        {[
          { label: 'Build', sub: 'build' },
          { label: 'Budget', sub: 'budget' },
          { label: 'Packing', sub: 'packing' }
        ].map(({ label, sub }) => (
          <Link 
            key={sub} 
            to={`/trip/${trip.id}/${sub}`}
            className="text-[9px] font-bold uppercase tracking-widest text-white/30 border border-white/10 px-3 py-1.5 rounded-lg hover:border-sig hover:text-sig transition-all"
          >
            {label}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('trips')
          .select('*, stops(count)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setTrips(data);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  return (
    <PageWrapper
      title="My Expeditions"
      subtitle="Your collection of past adventures and future dreams."
      emoji="🗺️"
      coverUrl="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1920&q=85"
      actions={
        <Link
          to="/trips/new"
          className="px-8 py-3 bg-sig text-black font-bold text-sm rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
          style={{ boxShadow: 'var(--glow-sm)' }}
        >
          + New Trip
        </Link>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 rounded-2xl border border-white/5 bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/30 backdrop-blur-md border border-white/10 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sig/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.065M15 20.25l-1.5-1.5M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-display font-bold text-white mb-4 italic">The map is blank...</h3>
            <p className="text-white/40 max-w-md mx-auto mb-10 text-lg">
              Every legend starts with a single step. Use the AI Copilot to chart your first course.
            </p>
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-3 px-10 py-4 bg-sig text-black font-extrabold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Plan Your First Trip
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
        </motion.div>
      )}
    </PageWrapper>
  );
}
