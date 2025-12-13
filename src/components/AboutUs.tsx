import { useEffect } from 'react';
import { motion, Variants } from 'framer-motion'; // Import Variants type

interface AboutUsProps {
  onBack: () => void;
  onBookDemo: () => void;
}

export function AboutUs({ onBack, onBookDemo }: AboutUsProps) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // --- FIX 2: Explicit Type Definition ---
  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const item: Variants = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.4 } }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white p-4 md:p-12 font-sans relative overflow-x-hidden">
      <button onClick={onBack} className="fixed top-6 right-6 z-50 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all font-bold uppercase tracking-widest text-sm">✕ Close</button>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-20 pb-20"
      >
        <motion.section variants={item} className="text-center space-y-6 pt-10">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 drop-shadow-2xl">ABOUT US</h1>
          <h2 className="text-2xl md:text-3xl font-light text-gray-300">Turning <span className="text-yellow-400 font-bold">Sunlight</span> into <span className="text-green-400 font-bold">Spotlight</span></h2>
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">RATH X is India’s pioneering green-media company transforming how brands communicate in public spaces with clean, smart, and highly visible solar technology.</p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={item} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300">
                <h3 className="text-xl font-bold text-green-400 mb-4 uppercase tracking-widest">Our Mission</h3>
                <p className="text-3xl font-serif italic text-white/90">“We turn attention into connection, and connection into memory.”</p>
            </motion.div>
            <motion.div variants={item} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300">
                <h3 className="text-xl font-bold text-green-400 mb-4 uppercase tracking-widest">Our Vision</h3>
                <p className="text-lg text-gray-300">To lead the global shift toward a clean-energy media future where impactful communication accelerates environmental progress.</p>
            </motion.div>
        </div>

        <motion.section variants={item} className="space-y-10">
            <h3 className="text-4xl font-black text-center mb-10">OUR SERVICES</h3>
            <div className="grid gap-6">
                {[
                    { title: "1. BRAND — Ad With Us", sub: "Our Platform, Your Brand", desc: "High visibility, sustainable advertising on our routes.", color: "text-green-400" },
                    { title: "2. CP (Channel Partner)", sub: "Your Place, Your Ad", desc: "Operate your own Ad Rath unit and earn revenue.", color: "text-yellow-400" },
                    { title: "3. AP (Affiliate Partner)", sub: "Our Place, You Bring the Ad", desc: "Bring advertisers, earn commission. No investment needed.", color: "text-blue-400" }
                ].map((s, i) => (
                    <motion.div key={i} whileHover={{scale: 1.02}} className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <h4 className={`text-2xl font-bold ${s.color} mb-2`}>{s.title}</h4>
                        <p className="text-sm text-gray-500 font-mono uppercase mb-2">{s.sub}</p>
                        <p className="text-gray-300">{s.desc}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>

        <motion.section variants={item} className="bg-gradient-to-r from-green-900/40 to-black p-10 rounded-3xl border border-green-500/30 text-center space-y-6">
            <h3 className="text-4xl font-black text-white">READY TO GO GREEN?</h3>
            <button onClick={onBookDemo} className="bg-green-600 hover:bg-green-500 text-white font-black text-xl px-12 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all uppercase tracking-widest">
                Book a Demo
            </button>
        </motion.section>

        <motion.footer variants={item} className="border-t border-white/10 pt-10 text-center space-y-4">
            <h4 className="text-lg font-bold text-gray-500 uppercase tracking-widest">Get In Touch</h4>
            <div className="flex flex-col md:flex-row justify-center gap-8 text-gray-300">
                <span>📍 Ahmedabad</span>
                <a href="tel:+919904534186" className="hover:text-green-400">📞 +91 9904534186</a>
                <a href="mailto:contact@rathx.in" className="hover:text-green-400">📧 contact@rathx.in</a>
            </div>
        </motion.footer>

      </motion.div>
    </div>
  );
}