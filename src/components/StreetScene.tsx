import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initScene } from '../scene/sceneSetup';
//import { Controls } from './Controls'; 

type SceneControls = {
  cleanup: () => void;
  updateScreen: (tex: THREE.Texture) => void;
};

// Interface Props
interface StreetSceneProps {
  initialTexture?: THREE.Texture | null;
  onOpenDemo: () => void; 
}

export function StreetScene({ initialTexture, onOpenDemo }: StreetSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<SceneControls | null>(null);
  const [currentVibe, setCurrentVibe] = useState<string>("Welcome");
  
  // --- SOUND CONTROL STATES ---
  const [isVideo, setIsVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Helper to handle any new texture (Image or Video)
  const handleTextureApply = (texture: THREE.Texture) => {
    // 1. Check if it's a video
    if (texture.image && (texture.image instanceof HTMLVideoElement)) {
      setIsVideo(true);
      setIsMuted(texture.image.muted); // Sync state with video
      videoRef.current = texture.image;
    } else {
      setIsVideo(false);
      videoRef.current = null;
    }

    // 2. Update Scene
    sceneRef.current?.updateScreen(texture);
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from triggering scene events
    if (videoRef.current) {
      const newState = !videoRef.current.muted;
      videoRef.current.muted = newState;
      setIsMuted(newState);
    }
  };

  // Handle Internal Scene Uploads
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
      video.muted = true; // Start muted (autoplay policy)
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

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Initialize Scene ---
    sceneRef.current = initScene(
      mountRef.current,
      (vibe) => setCurrentVibe(vibe),
      () => mediaInputRef.current?.click(),
      onOpenDemo 
    );

    // --- Apply Initial Texture if exists ---
    if (initialTexture) {
        handleTextureApply(initialTexture);
    }

    return () => {
      sceneRef.current?.cleanup();
    };
  }, [initialTexture, onOpenDemo]);

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

      {/* --- SOUND TOGGLE BUTTON (Only shows if Video is active) --- */}
      {isVideo && (
        <button
          onClick={toggleSound}
          className="absolute top-4 right-4 md:top-5 md:right-5 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 rounded-full hover:bg-white/20 transition-all shadow-lg group"
          title={isMuted ? "Unmute Video" : "Mute Video"}
        >
          {isMuted ? (
            // Muted Icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L21 12m0 0l-3.75 2.25M21 12l-3.75-2.25M17.25 12h-2.25a2.25 2.25 0 00-2.25 2.25v.008c0 .414.336.75.75.75h2.25m-2.25-3h-2.25M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12l-1.5 1.5m1.5-1.5l-1.5-1.5m-3 1.5h-3m3 0v1.5m0-1.5v-1.5" /> 
              {/* Simple Cross Mute fallback path visual */}
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 5.25L6.75 9H4.5A2.25 2.25 0 002.25 11.25v1.5a2.25 2.25 0 002.25 2.25h2.25l4.5 3.75v-13.5z" />
              <line x1="16" y1="9" x2="22" y2="15" />
              <line x1="22" y1="9" x2="16" y2="15" />
            </svg>
          ) : (
            // Sound On Icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          )}
        </button>
      )}

      <nav className="absolute top-4 md:top-5 left-0 w-full z-10 pointer-events-none flex justify-center">
        <ul className="inline-flex p-1 md:p-0 list-none bg-white/10 backdrop-blur-md rounded-full px-4 py-2 md:px-6 md:py-2 shadow-lg gap-2 md:gap-4">
          {['Welcome', 'Book Demo', 'Contact us'].map((vibe) => (
            <li 
              key={vibe} 
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

      {/* <Controls isRunning={true} /> */}

      <div className="absolute bottom-20 md:bottom-8 left-0 w-full text-center pointer-events-none animate-bounce z-10">
        <span className="text-white/80 font-bold text-[10px] md:text-xs uppercase tracking-widest bg-black/20 px-3 py-1 md:px-4 md:py-1 rounded-full backdrop-blur-sm">
          Scroll / Swipe to Travel
        </span>
      </div>
    </div>
  );
}