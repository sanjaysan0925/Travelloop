import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { supabase } from '../lib/supabase';

const SECTIONS = [
  {
    id: 0,
    type: 'hero',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=85',
    title: 'Where Will\nYou Go\nNext?',
    sub: 'AI-powered travel planning for the modern explorer',
  },
  {
    id: 1,
    type: 'dest',
    city: 'Santorini',
    country: 'Greece',
    vibe: 'Aegean paradise of white domes and cerulean sea',
    season: 'Apr – Oct',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1920&q=85',
    align: 'left',
    num: '01',
  },
  {
    id: 2,
    type: 'dest',
    city: 'Kyoto',
    country: 'Japan',
    vibe: 'Ancient temples wrapped in cherry blossom and silence',
    season: 'Mar – May',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1920&q=85',
    align: 'right',
    num: '02',
  },
  {
    id: 3,
    type: 'dest',
    city: 'Reykjavik',
    country: 'Iceland',
    vibe: 'Northern lights dancing over volcanic wilderness',
    season: 'Sep – Mar',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1920&q=85',
    align: 'center',
    num: '03',
  },
  {
    id: 4,
    type: 'dest',
    city: 'Marrakech',
    country: 'Morocco',
    vibe: 'Labyrinthine medinas alive with color and spice',
    season: 'Oct – Apr',
    image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1920&q=85',
    align: 'left',
    num: '04',
  },
  {
    id: 5,
    type: 'cta',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=85',
  },
];

/* ── Section component ── */
function FullSection({ s, onVisible }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5 });

  useEffect(() => {
    if (inView) onVisible(s.id);
  }, [inView, s.id, onVisible]);

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
  };
  const lineVariants = {
    hidden: { scaleX: 0 },
    show:   { scaleX: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 } },
  };

  /* ── HERO ── */
  if (s.type === 'hero') {
    return (
      <section
        ref={ref}
        className="relative overflow-hidden flex items-end"
        style={{ height: '100vh', scrollSnapAlign: 'start' }}
      >
        <motion.img
          src={s.image} alt="hero"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={inView ? { scale: 1 } : { scale: 1.1 }}
          transition={{ duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* Layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        {/* Orange accent line top */}
        <motion.div
          className="absolute top-0 left-0 h-[3px] origin-left"
          style={{ background: 'var(--sig)', width: '100%' }}
          variants={lineVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        />

        <div className="relative z-10 w-full px-8 md:px-20 pb-20 md:pb-28">
          <motion.p
            variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.6 } } }}
            initial="hidden" animate={inView ? 'show' : 'hidden'}
            className="text-xs font-semibold uppercase tracking-[0.4em] mb-5"
            style={{ color: 'var(--sig)' }}
          >
            Traveloop — AI Travel Planner
          </motion.p>

          <motion.h1
            variants={textVariants} initial="hidden" animate={inView ? 'show' : 'hidden'}
            className="font-display font-bold text-white leading-[1.0]"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', whiteSpace: 'pre-line' }}
          >
            {s.title}
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8, delay: 0.4 } } }}
            initial="hidden" animate={inView ? 'show' : 'hidden'}
            className="mt-5 text-lg max-w-md"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            {s.sub}
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.55 } } }}
            initial="hidden" animate={inView ? 'show' : 'hidden'}
            className="mt-8 flex gap-4 flex-wrap"
          >
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105"
              style={{ background: 'var(--sig)', color: '#000', boxShadow: 'var(--glow-md)' }}
            >
              Begin Planning
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 border hover:border-sig/50"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', borderColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
            >
              Explore Destinations
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-10 z-10 flex flex-col items-center gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.4)', writingMode: 'vertical-rl' }}>Scroll</span>
          <motion.div
            className="w-px h-12 origin-top"
            style={{ background: 'linear-gradient(to bottom, var(--sig), transparent)' }}
            animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </section>
    );
  }

  /* ── DESTINATION ── */
  if (s.type === 'dest') {
    const isLeft   = s.align === 'left';
    const isCenter = s.align === 'center';

    return (
      <section
        ref={ref}
        className="relative overflow-hidden flex items-end"
        style={{ height: '100vh', scrollSnapAlign: 'start' }}
      >
        <motion.img
          src={s.image} alt={s.city}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08 }}
          animate={inView ? { scale: 1 } : { scale: 1.08 }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />
        {!isCenter && (
          <div className={`absolute inset-0 bg-gradient-to-${isLeft ? 'r' : 'l'} from-black/70 to-transparent`} />
        )}

        {/* Section number — top right */}
        <div
          className="absolute top-24 right-10 font-display font-bold select-none pointer-events-none"
          style={{ fontSize: '9rem', color: 'rgba(255,255,255,0.04)', lineHeight: 1 }}
        >
          {s.num}
        </div>

        {/* Text block */}
        <div
          className={`relative z-10 w-full px-8 md:px-20 pb-20 md:pb-28 ${
            isCenter ? 'flex flex-col items-center text-center' :
            isLeft   ? '' : 'flex flex-col items-end text-right'
          }`}
        >
          <motion.div
            className="h-0.5 mb-5 origin-left"
            style={{
              background: 'var(--sig)',
              width: 48,
              transformOrigin: isCenter ? 'center' : isLeft ? 'left' : 'right',
            }}
            variants={lineVariants}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
          />

          <motion.p
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5, delay: 0.1 } } }}
            initial="hidden" animate={inView ? 'show' : 'hidden'}
            className="text-xs font-semibold uppercase tracking-[0.4em] mb-3"
            style={{ color: 'var(--sig)' }}
          >
            {s.country} — {s.season}
          </motion.p>

          <motion.h2
            variants={textVariants} initial="hidden" animate={inView ? 'show' : 'hidden'}
            className="font-display font-bold italic text-white leading-none"
            style={{ fontSize: 'clamp(4rem, 10vw, 9rem)' }}
          >
            {s.city}
          </motion.h2>

          <motion.p
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8, delay: 0.5 } } }}
            initial="hidden" animate={inView ? 'show' : 'hidden'}
            className="mt-4 text-base max-w-sm"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {s.vibe}
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.65 } } }}
            initial="hidden" animate={inView ? 'show' : 'hidden'}
            className="mt-7"
          >
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', color: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--sig)'; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = 'var(--sig)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              Plan {s.city}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  /* ── FINAL CTA ── */
  return (
    <section
      ref={ref}
      className="relative overflow-hidden flex items-center justify-center"
      style={{ height: '100vh', scrollSnapAlign: 'start' }}
    >
      <img src={s.image} alt="cta" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/80" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, hsla(22,92%,52%,0.12) 0%, transparent 65%)' }} />

      <div className="relative z-10 text-center max-w-3xl px-6">
        <motion.p
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          initial="hidden" animate={inView ? 'show' : 'hidden'}
          transition={{ duration: 0.5 }}
          className="text-xs font-semibold uppercase tracking-[0.4em] mb-6"
          style={{ color: 'var(--sig)' }}
        >Your Journey Awaits</motion.p>

        <motion.h2
          variants={textVariants} initial="hidden" animate={inView ? 'show' : 'hidden'}
          className="font-display font-bold italic text-white leading-tight"
          style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
        >
          Every great<br />trip starts with<br />
          <span style={{ color: 'var(--sig)' }}>a single plan.</span>
        </motion.h2>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.5 } } }}
          initial="hidden" animate={inView ? 'show' : 'hidden'}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
        >
          <Link
            to="/trips/new"
            className="px-10 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105"
            style={{ background: 'var(--sig)', color: '#000', boxShadow: 'var(--glow-lg)' }}
          >
            Start Planning Free
          </Link>
          <Link
            to="/trips"
            className="px-10 py-4 rounded-xl font-semibold text-base border transition-all duration-200 hover:border-sig/50"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)' }}
          >
            View My Trips
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const [activeSection, setActiveSection] = useState(0);
  const mainRef = useRef(null);

  const scrollTo = (id) => {
    const el = document.getElementById(`section-${id}`);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* ── Top Navbar ── */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-8 py-6 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto">
          <Link to="/" className="text-xl font-display font-bold text-white tracking-tighter">
            TRAVELOOP<span style={{ color: 'var(--sig)' }}>.</span>
          </Link>
        </div>
        <div className="flex gap-6 items-center pointer-events-auto">
          <Link to="/explore" className="text-xs font-semibold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Explore</Link>
          <Link to="/trips" className="text-xs font-semibold uppercase tracking-widest text-white/50 hover:text-white transition-colors">My Trips</Link>
          <Link 
            to="/auth" 
            className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 bg-sig text-black hover:scale-105 shadow-sig-glow"
          >
            Sign In
          </Link>
        </div>
      </nav>
      {SECTIONS.map(s => (
        <div key={s.id} id={`section-${s.id}`}>
          <FullSection s={s} onVisible={setActiveSection} />
        </div>
      ))}

      {/* ── Dot Navigation ── */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 hidden md:flex">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="rounded-full transition-all duration-400"
            style={{
              width:   activeSection === s.id ? 10 : 6,
              height:  activeSection === s.id ? 10 : 6,
              background: activeSection === s.id ? 'var(--sig)' : 'rgba(255,255,255,0.25)',
              boxShadow: activeSection === s.id ? 'var(--glow-xs)' : 'none',
            }}
          />
        ))}
      </div>

      {/* ── Section counter ── */}
      <div
        className="fixed bottom-8 left-8 z-50 hidden md:flex items-center gap-2"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        <span className="text-lg font-display font-bold" style={{ color: activeSection > 0 ? 'var(--sig)' : 'rgba(255,255,255,0.35)' }}>
          {String(activeSection + 1).padStart(2, '0')}
        </span>
        <div className="w-10 h-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
        <span className="text-sm">{String(SECTIONS.length).padStart(2, '0')}</span>
      </div>
    </motion.div>
  );
}
