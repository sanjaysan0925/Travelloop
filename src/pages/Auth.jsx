import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const BG_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1920&q=85',
];

const QUOTES = [
  { line1: 'The world is', line2: 'too beautiful', line3: 'to stay home.' },
  { line1: 'Not all those', line2: 'who wander', line3: 'are lost.' },
  { line1: 'Every journey', line2: 'begins with a', line3: 'single step.' },
  { line1: 'Travel is the', line2: 'only thing you', line3: 'buy that enriches.' },
];

export default function Auth() {

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgIdx, setBgIdx] = useState(0);
  const [exiting, setExiting] = useState(false);

  const navigate = useNavigate();

  // ✅ AUTH SESSION HANDLING
  useEffect(() => {

    const checkSession = async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {

        // Clean OAuth hash token from URL
        window.history.replaceState(
          {},
          document.title,
          '/dashboard'
        );

        navigate('/dashboard', { replace: true });

      }

    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {

      if (session) {

        window.history.replaceState(
          {},
          document.title,
          '/dashboard'
        );

        navigate('/dashboard', { replace: true });

      }

    });

    return () => subscription.unsubscribe();

  }, [navigate]);

  // Background image slider
  useEffect(() => {

    const timer = setInterval(() => {

      setBgIdx((prev) => (prev + 1) % BG_IMAGES.length);

    }, 6000);

    return () => clearInterval(timer);

  }, []);

  // EMAIL LOGIN / SIGNUP
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError('');

    try {

      if (mode === 'login') {

        const { error } = await supabase.auth.signInWithPassword({

          email,
          password,

        });

        if (error) throw error;

      } else {

        const { data, error } = await supabase.auth.signUp({

          email,
          password,

        });

        if (error) throw error;

        if (data.user) {

          await supabase.from('profiles').insert({

            id: data.user.id,
            name,

          });

        }

      }

      setExiting(true);

      setTimeout(() => {

        navigate('/dashboard');

      }, 700);

    } catch (err) {

      setError(err.message);
      setLoading(false);

    }

  };

  // ✅ GOOGLE LOGIN FIXED
  const handleGoogle = async () => {

    await supabase.auth.signInWithOAuth({

      provider: 'google',

      options: {

        redirectTo: 'http://localhost:5173/auth',

      },

    });

  };

  const quote = QUOTES[bgIdx];

  return (

    <motion.div
      className="fixed inset-0 flex overflow-hidden"
      initial={{ opacity: 0 }}
      animate={exiting
        ? { opacity: 0, scale: 1.04 }
        : { opacity: 1, scale: 1 }}
      transition={{ duration: exiting ? 0.85 : 0.5 }}
    >

      {/* LEFT PANEL */}
      <div className="hidden lg:flex relative flex-1 overflow-hidden">

        <AnimatePresence mode="wait">

          <motion.img
            key={bgIdx}
            src={BG_IMAGES[bgIdx]}
            alt="destination"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
          />

        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* LOGO */}
        <div className="absolute top-10 left-12 z-10 flex items-center gap-3">

          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-black"
            style={{ background: 'var(--sig)' }}
          >
            T
          </div>

          <span className="text-2xl font-bold text-white tracking-tight">
            raveloop
          </span>

        </div>

        {/* QUOTE */}
        <div className="absolute bottom-16 left-12 z-10 max-w-lg">

          <div
            className="w-12 h-0.5 mb-6"
            style={{ background: 'var(--sig)' }}
          />

          <AnimatePresence mode="wait">

            <motion.div
              key={bgIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
            >

              <h1 className="text-6xl font-bold text-white leading-[1.1] italic">

                {quote.line1}

                <br />

                <span style={{ color: 'var(--sig)' }}>
                  {quote.line2}
                </span>

                <br />

                {quote.line3}

              </h1>

            </motion.div>

          </AnimatePresence>

        </div>

      </div>

      {/* RIGHT PANEL */}
      <motion.div
        className="w-full lg:w-[440px] flex flex-col justify-center px-10 py-14 relative overflow-hidden"
        style={{ background: '#080808' }}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-12">

          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-black"
            style={{ background: 'var(--sig)' }}
          >
            T
          </div>

          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: 'var(--sig)' }}
          >
            raveloop
          </span>

        </div>

        {/* TOGGLE */}
        <div
          className="flex rounded-xl p-1 mb-8 border border-[#1a1a1a]"
          style={{ background: '#0d0d0d' }}
        >

          {['login', 'signup'].map((m) => (

            <button
              key={m}
              onClick={() => {

                setMode(m);
                setError('');

              }}
              className="flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase"
              style={
                mode === m
                  ? { background: 'var(--sig)', color: '#000' }
                  : { color: 'var(--text-muted)' }
              }
            >

              {m === 'login'
                ? 'Sign In'
                : 'Sign Up'}

            </button>

          ))}

        </div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-medium mb-5 border"
          style={{
            background: '#111',
            borderColor: '#222',
            color: 'var(--text-primary)'
          }}
        >

          Continue with Google

        </button>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === 'signup' && (

            <input
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl"
              style={{
                background: '#111',
                border: '1px solid #1e1e1e',
                color: 'white'
              }}
            />

          )}

          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl"
            style={{
              background: '#111',
              border: '1px solid #1e1e1e',
              color: 'white'
            }}
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl"
            style={{
              background: '#111',
              border: '1px solid #1e1e1e',
              color: 'white'
            }}
          />

          {error && (

            <p style={{ color: 'red' }}>
              {error}
            </p>

          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-base"
            style={{
              background: 'var(--sig)',
              color: '#000'
            }}
          >

            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}

          </button>

        </form>

      </motion.div>

    </motion.div>

  );

}