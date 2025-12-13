import { useState } from 'react';
import * as THREE from 'three';
import { ChariotPreview } from './ChariotPreview';
import { motion } from 'framer-motion';

interface BookDemoProps {
  onStartJourney: (userTexture: THREE.Texture | null) => void;
  onBack: () => void; // Added back prop
}

export function BookDemo({ onStartJourney, onBack }: BookDemoProps) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', org: '' });
  const [previewTexture, setPreviewTexture] = useState<THREE.Texture | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // REPLACE THIS WITH YOUR GOOGLE SCRIPT URL
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-FM2Q9mJRbki3X9t_MxwZMM5DoBhd5jO2Lhl9qFVbIMZJDvl_mtD0jNyeYeKl9W5jPw/exec"; 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');

    if (isVideo) {
      const video = document.createElement('video');
      video.src = url;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.play();
      const vidTex = new THREE.VideoTexture(video);
      vidTex.colorSpace = THREE.SRGBColorSpace;
      vidTex.minFilter = THREE.LinearFilter;
      vidTex.magFilter = THREE.LinearFilter;
      setPreviewTexture(vidTex);
    } else {
      new THREE.TextureLoader().load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setPreviewTexture(tex);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("email", formData.email);
    data.append("org", formData.org);

    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", body: data });
      setIsSubmitting(false);
      onStartJourney(previewTexture);
    } catch (error) {
      console.error("Error", error);
      setIsSubmitting(false);
      onStartJourney(previewTexture);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-8">
      
      {/* SKIP BUTTON (Requested Feature) */}
      <button 
        onClick={onBack}
        className="fixed top-6 right-6 z-50 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all font-bold uppercase tracking-widest text-xs md:text-sm flex items-center gap-2"
      >
        <span>Skip to Home</span>
        <span>→</span>
      </button>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: 3D PREVIEW */}
        <div className="flex flex-col gap-4">
          <div className="h-[400px] lg:h-[600px] relative">
             <ChariotPreview previewTexture={previewTexture} />
             <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/20">
                <span className="text-xs font-bold text-green-400">LIVE PREVIEW</span>
             </div>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-10 rounded-2xl shadow-xl"
          >
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter">BOOK A DEMO</h1>
            <p className="text-gray-400 mb-8">Fill your details and upload your brand identity.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required name="name" onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 focus:border-green-500 outline-none transition-colors" placeholder="Name" />
                  <input required name="phone" onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 focus:border-green-500 outline-none transition-colors" placeholder="Phone" />
              </div>
              <input required type="email" name="email" onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 focus:border-green-500 outline-none transition-colors" placeholder="Email" />
              <input required name="org" onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 focus:border-green-500 outline-none transition-colors" placeholder="Organization" />

              <div className="relative border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 transition-colors cursor-pointer p-6 text-center group">
                  <input type="file" onChange={handleFileChange} accept="image/*,video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <p className="font-bold text-sm text-white group-hover:text-green-400 transition-colors">
                    {fileName ? fileName : "Upload Image / Video"}
                  </p>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full bg-green-600 hover:bg-green-500 text-white font-black text-lg py-4 rounded-xl shadow-lg uppercase tracking-widest ${isSubmitting ? 'opacity-50' : ''}`}
              >
                {isSubmitting ? 'Saving...' : 'Start Journey 🚀'}
              </button>
            </form>

            {/* CONTACT INFO (Added as requested) */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-400 space-y-2">
                <p className="uppercase font-bold tracking-widest text-xs text-gray-600 mb-2">Or Contact Directly</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <span>📍 Ahmedabad</span>
                    <a href="tel:+919904534186" className="hover:text-white transition-colors">📞 +91 9904534186</a>
                    <a href="mailto:contact@rathx.in" className="hover:text-white transition-colors">📧 contact@rathx.in</a>
                </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}