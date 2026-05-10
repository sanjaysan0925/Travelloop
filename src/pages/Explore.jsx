import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { motion } from 'framer-motion';

const DESTINATIONS = [
  { name: 'Swiss Alps', category: 'Adventure', image: 'https://images.unsplash.com/photo-1531219572328-a0171b4448a3?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tokyo', category: 'Urban', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bora Bora', category: 'Relaxation', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Machu Picchu', category: 'History', image: 'https://images.unsplash.com/photo-1587590227264-0ac64ce63ce8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sahara Desert', category: 'Experience', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80' },
  { name: 'Amalfi Coast', category: 'Scenic', image: 'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&w=800&q=80' },
];

export default function Explore() {
  return (
    <PageWrapper
      title="Discovery"
      subtitle="Unlock the world's most hidden gems and iconic escapes."
      emoji="🌍"
      coverUrl="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=85"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DESTINATIONS.map((dest, i) => (
          <motion.div
            key={dest.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer"
          >
            <img 
              src={dest.image} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt={dest.name} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="text-[9px] font-bold uppercase tracking-widest text-sig mb-1 block">{dest.category}</span>
              <h3 className="text-xl font-display font-bold text-white italic">{dest.name}</h3>
            </div>
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-12 p-12 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl text-center">
        <h3 className="text-2xl font-display font-bold text-white italic mb-4">Want a custom recommendation?</h3>
        <p className="text-white/40 mb-8 max-w-md mx-auto">Our AI is ready to scout the perfect destination based on your personality and preferences.</p>
        <button className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
          Ask AI Concierge
        </button>
      </div>
    </PageWrapper>
  );
}
