import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initScene } from '../scene/sceneSetup';
//import { Controls } from './Controls'; // Uncomment if using Controls

type SceneControls = {
  cleanup: () => void;
  updateScreen: (tex: THREE.Texture) => void;
  scrollTo: (target: 'ABOUT' | 'DEMO' | 'CONTACT', onArrival: () => void) => void;
};

// --- FIX 1: Add onOpenContact to interface ---
interface StreetSceneProps {
  initialTexture?: THREE.Texture | null;
  onOpenDemo: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void; // <--- ADDED THIS
}

export function StreetScene({ initialTexture, onOpenDemo, onOpenAbout, onOpenContact }: StreetSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<SceneControls | null>(null);
  const [currentVibe, setCurrentVibe] = useState<string>("Welcome");
  
  const [isVideo, setIsVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleTextureApply = (texture: THREE.Texture) => {
    if (texture.image && (texture.image instanceof HTMLVideoElement)) {
      setIsVideo(true);
      setIsMuted(texture.image.muted);
      videoRef.current = texture.image;
    } else {
      setIsVideo(false);
      videoRef.current = null;
    }
    sceneRef.current?.updateScreen(texture);
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newState = !videoRef.current.muted;
      videoRef.current.muted = newState;
      setIsMuted(newState);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    const fileIsVideo = file.type.startsWith('video/');

    if (fileIsVideo) {
      const video = document.createElement('video');
      video.src = url;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.play();

      const videoTex = new THREE.VideoTexture(video);
      videoTex.colorSpace = THREE.SRGBColorSpace;
      videoTex.minFilter = THREE.LinearFilter;
      videoTex.magFilter = THREE.LinearFilter;
      
      handleTextureApply(videoTex);
    } else {
      const loader = new THREE.TextureLoader();
      loader.load(url, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          handleTextureApply(tex);
      });
    }
  };

  // --- NAVIGATION HANDLER ---
  const handleNavClick = (vibe: string) => {
      if (!sceneRef.current) return;

      if (vibe === 'About Us') {
          sceneRef.current.scrollTo('ABOUT', () => onOpenAbout());
      } 
      else if (vibe === 'Book Demo') {
          sceneRef.current.scrollTo('DEMO', () => onOpenDemo());
      }
      else if (vibe === 'Contact Us') {
          sceneRef.current.scrollTo('CONTACT', () => onOpenContact());
      }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    sceneRef.current = initScene(
      mountRef.current,
      (vibe) => setCurrentVibe(vibe),
      () => mediaInputRef.current?.click(),
      // Pass empty handlers to initScene if it calls them directly, 
      // but our logic mainly uses the handleNavClick wrapper now.
      () => handleNavClick('Book Demo'), 
      () => handleNavClick('Contact Us'),
      () => handleNavClick('About Us')
    );

    if (initialTexture) {
        handleTextureApply(initialTexture);
    }

    return () => {
      sceneRef.current?.cleanup();
    };
  }, [initialTexture]);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      <div ref={mountRef} id="canvas-container" className="w-full h-full block" />
      
      <input 
        type="file" 
        ref={mediaInputRef} 
        style={{display: 'none'}} 
        accept="image/*,video/*" 
        onChange={handleFileSelect} 
      />

      {isVideo && (
        <button
          onClick={toggleSound}
          className="absolute top-4 right-4 md:top-5 md:right-5 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 rounded-full hover:bg-white/20 transition-all shadow-lg group"
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      )}

      <nav className="absolute top-4 md:top-5 left-0 w-full z-10 pointer-events-none flex justify-center">
        <ul className="inline-flex p-1 md:p-0 list-none bg-white/10 backdrop-blur-md rounded-full px-4 py-2 md:px-6 md:py-2 shadow-lg gap-2 md:gap-4">
          {['About Us', 'Book Demo', 'Contact Us'].map((vibe) => (
            <li 
              key={vibe} 
              onClick={() => handleNavClick(vibe)} 
              className={`font-black text-[10px] md:text-sm tracking-widest uppercase cursor-pointer pointer-events-auto transition-all duration-300 px-2 ${
                currentVibe === vibe 
                  ? 'text-white border-b-2 border-white scale-105' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {vibe}
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-20 md:bottom-8 left-0 w-full text-center pointer-events-none animate-bounce z-10">
        <span className="text-white/80 font-bold text-[10px] md:text-xs uppercase tracking-widest bg-black/20 px-3 py-1 md:px-4 md:py-1 rounded-full backdrop-blur-sm">
          Scroll / Swipe to Travel
        </span>
      </div>
    </div>
  );
}