import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initScene } from '../scene/sceneSetup';

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
    <div className="w-full h-screen relative overflow-hidden">
      <div ref={mountRef} id="canvas-container" className="w-full h-full" />
      <input type="file" ref={mediaInputRef} style={{display: 'none'}} accept="image/*" onChange={handleFileSelect} />

      {/* Navigation Overlay */}
      <nav className="absolute top-5 left-0 w-full z-10 pointer-events-none text-center">
        <ul className="inline-block p-0 m-0 list-none bg-white/10 backdrop-blur-md rounded-full px-6 py-2 shadow-lg">
          {['City', 'Temple', 'Airport'].map((vibe) => (
            <li 
              key={vibe} 
              className={`inline-block mx-4 font-black text-sm tracking-widest uppercase cursor-pointer pointer-events-auto transition-all duration-300 ${
                currentVibe === vibe 
                  ? 'text-white border-b-2 border-white scale-110' 
                  : 'text-gray-200 hover:text-white'
              }`}
            >
              {vibe}
            </li>
          ))}
        </ul>
      </nav>

      {/* Scroll Hint */}
      <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none animate-bounce z-10">
        <span className="text-white/80 font-bold text-xs uppercase tracking-widest bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm">
          Scroll to Travel • Click Machine to Upload
        </span>
      </div>
    </div>
  );
}