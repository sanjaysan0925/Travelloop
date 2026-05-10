import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { motion } from 'framer-motion';

export default function Profile() {
  return (
    <PageWrapper
      title="Navigator"
      subtitle="Manage your explorer identity and preferences."
      emoji="👤"
      coverUrl="https://images.unsplash.com/photo-1499591934245-40b55745b905?auto=format&fit=crop&w=1920&q=85"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center sticky top-32">
            <div className="w-32 h-32 rounded-full bg-sig/20 border-4 border-sig/50 mx-auto mb-6 flex items-center justify-center overflow-hidden">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white italic">Elite Traveler</h2>
            <p className="text-sig text-xs font-bold uppercase tracking-widest mt-2">Level 12 Explorer</p>
            
            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-white/30 uppercase tracking-widest font-bold">Total Trips</span>
                <span className="text-white font-mono">24</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/30 uppercase tracking-widest font-bold">Countries</span>
                <span className="text-white font-mono">18</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/30 uppercase tracking-widest font-bold">Miles</span>
                <span className="text-white font-mono">42k</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings / Preferences */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-10">
            <h3 className="text-xl font-display font-bold text-white italic mb-8">Travel Preferences</h3>
            <div className="space-y-8">
              {[
                { label: 'Primary Vibe', value: 'Luxury / Boutique' },
                { label: 'Budget Mode', value: 'Comfort First' },
                { label: 'Planning Style', value: 'AI Optimized' },
                { label: 'Home Airport', value: 'LHR - London Heathrow' },
              ].map(pref => (
                <div key={pref.label} className="group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover:text-sig transition-colors">{pref.label}</label>
                  <div className="flex justify-between items-center mt-2 pb-4 border-b border-white/5">
                    <span className="text-white font-medium">{pref.value}</span>
                    <button className="text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-widest">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-10">
            <h3 className="text-xl font-display font-bold text-white italic mb-8">Passport & Security</h3>
            <button className="w-full py-4 rounded-xl border border-white/10 text-white font-bold text-sm bg-white/5 hover:bg-white/10 transition-all mb-4">
              Connect Google Account
            </button>
            <button className="w-full py-4 rounded-xl border border-red-500/20 text-red-500 font-bold text-sm bg-red-500/5 hover:bg-red-500/10 transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
