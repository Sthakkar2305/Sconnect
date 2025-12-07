import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initScene } from '../scene/sceneSetup';
import { Controls } from './Controls'; // Assuming you have this imported

type SceneControls = {
  cleanup: () => void;
  updateScreen: (tex: THREE.Texture) => void;
};

export function StreetScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<SceneControls | null>(null);
  const [currentVibe, setCurrentVibe] = useState<string>("City");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        sceneRef.current?.updateScreen(tex);
    });
  };

  useEffect(() => {
    if (!mountRef.current) return;

    sceneRef.current = initScene(
      mountRef.current,
      (vibe) => setCurrentVibe(vibe),
      () => mediaInputRef.current?.click()
    );

    return () => {
      sceneRef.current?.cleanup();
    };
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      <div ref={mountRef} id="canvas-container" className="w-full h-full block" />
      <input type="file" ref={mediaInputRef} style={{display: 'none'}} accept="image/*" onChange={handleFileSelect} />

      {/* Responsive Nav: Scales down on mobile, adds padding */}
      <nav className="absolute top-4 md:top-5 left-0 w-full z-10 pointer-events-none flex justify-center">
        <ul className="inline-flex p-1 md:p-0 list-none bg-white/10 backdrop-blur-md rounded-full px-4 py-2 md:px-6 md:py-2 shadow-lg gap-2 md:gap-4">
          {['City', 'Temple', 'Beach'].map((vibe) => (
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

      {/* Controls Component (Added here for completeness) */}
      <Controls isRunning={true} />

      {/* Scroll Hint: Hidden on very small screens if it overlaps, or smaller font */}
      <div className="absolute bottom-20 md:bottom-8 left-0 w-full text-center pointer-events-none animate-bounce z-10">
        <span className="text-white/80 font-bold text-[10px] md:text-xs uppercase tracking-widest bg-black/20 px-3 py-1 md:px-4 md:py-1 rounded-full backdrop-blur-sm">
          Scroll / Swipe to Travel
        </span>
      </div>
    </div>
  );
}