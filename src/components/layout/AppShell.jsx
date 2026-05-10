import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const NAV_LINKS = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'My Trips', path: '/trips' },
  { name: 'Explore', path: '/explore' },
  { name: 'Profile', path: '/profile' },
];

export default function AppShell() {

  const [scrolled, setScrolled] = useState(false);

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const isDash = pathname === '/dashboard';

  // AUTH SESSION
  useEffect(() => {

    const getUser = async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);

    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {

      setUser(session?.user ?? null);

    });

    return () => subscription.unsubscribe();

  }, []);

  // LOGIN / LOGOUT
  const handleAuthAction = async () => {

    if (user) {

      await supabase.auth.signOut();

      navigate('/auth');

    } else {

      navigate('/auth');

    }

  };

  // NAVBAR SCROLL EFFECT
  useEffect(() => {

    const el = document.getElementById('main-scroll');

    if (!el) return;

    const onScroll = () => setScrolled(el.scrollTop > 60);

    el.addEventListener('scroll', onScroll);

    return () => el.removeEventListener('scroll', onScroll);

  }, [pathname]);

  return (

    <div
      className="relative min-h-screen"
      style={{ background: 'var(--bg-base)' }}
    >

      {/* TOP NAVBAR */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background:
            scrolled || !isDash
              ? 'rgba(8,8,8,0.88)'
              : 'transparent',

          backdropFilter:
            scrolled || !isDash
              ? 'blur(20px)'
              : 'none',

          borderBottom:
            scrolled || !isDash
              ? '1px solid rgba(255,255,255,0.06)'
              : 'none',
        }}
      >

        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center h-[72px]">

          {/* LOGO */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 mr-12 shrink-0"
          >

            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-black text-sm"
              style={{
                background: 'var(--sig)',
                boxShadow: 'var(--glow-xs)'
              }}
            >
              T
            </div>

            <span
              className="font-display text-xl font-bold tracking-tight"
              style={{ color: 'var(--sig)' }}
            >
              raveloop
            </span>

          </NavLink>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1 flex-1">

            {NAV_LINKS.map(({ name, path }) => (

              <NavLink
                key={name}
                to={path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-secondary hover:text-primary'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { color: 'var(--sig)' }
                    : {}
                }
              >

                {name}

              </NavLink>

            ))}

          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center ml-auto gap-4">

            {/* LOGIN / LOGOUT */}
            <button
              onClick={handleAuthAction}
              className="px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border border-sig/30 hover:border-sig hover:bg-sig/10"
              style={{
                color: 'var(--sig)',
                background: 'rgba(255,255,255,0.03)',
                boxShadow: 'var(--glow-xs)',
              }}
            >

              {user ? 'LOGOUT' : 'LOGIN'}

            </button>

            {/* FULL USER NAME */}
            {user && (

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-2 rounded-full border flex items-center justify-center text-sm font-bold transition-colors"
                style={{
                  background: '#111',
                  borderColor: '#222',
                  color: 'var(--sig)',
                  maxWidth: '240px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >

                {
                  user?.user_metadata?.full_name
                  || user?.user_metadata?.name
                  || user?.email
                }

              </motion.div>

            )}

          </div>

        </div>

      </header>

      {/* MAIN CONTENT */}
      <main
        id="main-scroll"
        style={
          isDash
            ? {
                height: '100vh',
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
              }
            : {
                minHeight: '100vh',
                overflowY: 'auto',
                paddingTop: '72px',
              }
        }
      >

        {isDash ? (

          <Outlet />

        ) : (

          <div className="max-w-6xl mx-auto px-6 py-8 md:px-10 md:py-12 pb-24 md:pb-16">

            <Outlet />

          </div>

        )}

      </main>

      {/* MOBILE NAV */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-3 border-t"
        style={{
          background: 'rgba(8,8,8,0.96)',
          backdropFilter: 'blur(20px)',
          borderColor: '#1a1a1a',
        }}
      >

        {NAV_LINKS.map(({ name, path }) => (

          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                isActive
                  ? ''
                  : 'text-secondary'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { color: 'var(--sig)' }
                : {}
            }
          >

            <span className="text-base">

              {name.charAt(0)}

            </span>

            {name}

          </NavLink>

        ))}

      </nav>

    </div>

  );

}