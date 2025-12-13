import { useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

interface ContactUsProps {
  onBack: () => void;
}

export function ContactUs({ onBack }: ContactUsProps) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // --- FIX 2: Explicit Type Definition ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden flex items-center justify-center">
      
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <button 
        onClick={onBack}
        className="fixed top-6 right-6 z-50 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all font-bold uppercase tracking-widest text-sm"
      >
        ✕ Close
      </button>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-16 rounded-3xl shadow-2xl relative z-10"
      >
        <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">GET IN TOUCH</motion.h1>
        <motion.p variants={itemVariants} className="text-xl text-gray-300 mb-10 font-light">Let’s build the future of green advertising together.</motion.p>

        <div className="space-y-8">
            <motion.div variants={itemVariants} className="flex items-start gap-4">
                <div className="bg-green-500/20 p-3 rounded-full text-green-400 text-2xl">📍</div>
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Location</h3>
                    <p className="text-xl font-medium">Ahmedabad, Gujarat, India</p>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 text-2xl">📞</div>
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Mobile</h3>
                    <a href="tel:+919904534186" className="text-xl font-medium hover:text-green-400 transition-colors">+91 9904534186</a>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-4">
                <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-400 text-2xl">📧</div>
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Email</h3>
                    <a href="mailto:contact@rathx.in" className="text-xl font-medium hover:text-green-400 transition-colors">contact@rathx.in</a>
                </div>
            </motion.div>
        </div>

        <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">RATH X — Turning Sunlight into Spotlight.</p>
        </motion.div>

      </motion.div>
    </div>
  );
}