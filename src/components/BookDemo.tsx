import { useState } from 'react';
import * as THREE from 'three';
import { ChariotPreview } from './ChariotPreview';

interface BookDemoProps {
  onStartJourney: (userTexture: THREE.Texture | null) => void;
}

export function BookDemo({ onStartJourney }: BookDemoProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    org: ''
  });
  const [previewTexture, setPreviewTexture] = useState<THREE.Texture | null>(null);
  const [fileName, setFileName] = useState<string>('');

  // Handle Text Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Upload (Image or Video)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate or send data to backend here...
    
    // Start the journey with the uploaded texture
    onStartJourney(previewTexture);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-8">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT SIDE: 3D PREVIEW */}
        <div className="flex flex-col gap-4">
          <div className="h-[400px] lg:h-[600px] relative">
             <ChariotPreview previewTexture={previewTexture} />
             
             {/* Overlay Text */}
             <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/20">
                <span className="text-xs font-bold text-green-400">LIVE PREVIEW</span>
             </div>
          </div>
          <div className="text-center text-gray-400 text-sm">
            Upload your media to see it appear on the S-Connect Chariot instantly.
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="flex flex-col justify-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-10 rounded-2xl shadow-xl">
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter">BOOK A DEMO</h1>
            <p className="text-gray-400 mb-8">Fill your details and upload your brand identity.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                  <input required name="name" onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-green-500 transition-colors" placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                  <input required name="phone" onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-green-500 transition-colors" placeholder="+91 98765 43210" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input required type="email" name="email" onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-green-500 transition-colors" placeholder="john@company.com" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Organization Name</label>
                <input required name="org" onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-green-500 transition-colors" placeholder="My Brand Pvt Ltd" />
              </div>

              {/* File Upload */}
              <div className="pt-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Upload Display Media (Image/Video)</label>
                <div className="relative border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <input type="file" onChange={handleFileChange} accept="image/*,video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="p-8 text-center">
                    <div className="text-3xl mb-2">📂</div>
                    <p className="font-bold text-sm text-white group-hover:text-green-400 transition-colors">
                      {fileName ? fileName : "Click to Upload or Drag File"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, MP4</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6">
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white font-black text-xl py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all uppercase tracking-widest"
                >
                  Start Journey 🚀
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}