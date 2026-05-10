import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function PageWrapper({ 
  children, 
  coverUrl, 
  emoji, 
  title, 
  subtitle,
  backLink,
  backLabel = 'Back',
  actions = null
}) {
  return (
    <div className="relative min-h-screen w-full">
      {/* ── Fixed Fullscreen Background ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          src={coverUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=85'}
          className="w-full h-full object-cover"
          alt=""
        />
        {/* Sophisticated overlays: slightly lighter for better image pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
        
        {/* Signature texture */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/carbon-fibre.png")` }} 
        />
      </div>

      {/* ── Scrollable Content Layer ── */}
      <div className="relative z-10 w-full min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12 md:px-12 md:py-24">
          
          {/* Header Section */}
          <header className="mb-16">
            {backLink && (
              <Link 
                to={backLink} 
                className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 hover:text-sig transition-all mb-8 group"
              >
                <div className="w-5 h-px bg-white/20 transition-all group-hover:w-8 group-hover:bg-sig" />
                {backLabel}
              </Link>
            )}
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="flex-1">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-5xl md:text-6xl mb-6 drop-shadow-2xl"
                >
                  {emoji}
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-display font-bold italic text-white leading-tight mb-4 drop-shadow-xl"
                  style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
                >
                  {title}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/60 text-lg md:text-xl font-medium max-w-2xl leading-relaxed"
                >
                  {subtitle}
                </motion.p>
              </div>
              
              {actions && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-4"
                >
                  {actions}
                </motion.div>
              )}
            </div>
          </header>

          {/* Main Body */}
          <motion.main
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
