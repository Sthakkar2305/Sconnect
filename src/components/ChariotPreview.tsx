import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createPlayerMachine } from '../scene/chariot';

interface ChariotPreviewProps {
  previewTexture: THREE.Texture | null;
}

export function ChariotPreview({ previewTexture }: ChariotPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    machineMat: THREE.MeshBasicMaterial | null;
  } | null>(null);

  // --- SOUND CONTROL ---
  const [isVideo, setIsVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Helper to sync state when texture changes
  useEffect(() => {
    if (previewTexture && previewTexture.image instanceof HTMLVideoElement) {
      setIsVideo(true);
      videoRef.current = previewTexture.image;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsVideo(false);
      videoRef.current = null;
    }

    // Apply texture to material
    if (sceneRef.current?.machineMat && previewTexture) {
      sceneRef.current.machineMat.map = previewTexture;
      sceneRef.current.machineMat.needsUpdate = true;
    }
  }, [previewTexture]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newState = !videoRef.current.muted;
      videoRef.current.muted = newState;
      setIsMuted(newState);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.0, 11); 
    camera.lookAt(0, 0.0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const { machineGroup, machineScreenMat } = createPlayerMachine(scene);
    
    machineGroup.position.set(0, -1.6, 0);
    machineGroup.rotation.set(0, 0, 0);
    machineGroup.scale.set(2.0, 2.0, 2.0);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      machineGroup.rotation.y += 0.005; 
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = { scene, renderer, machineMat: machineScreenMat };

    const handleResize = () => {
        if(!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* --- SOUND TOGGLE BUTTON --- */}
      {isVideo && (
        <button
          onClick={toggleSound}
          className="absolute bottom-4 right-4 z-20 bg-white/10 backdrop-blur-md border border-white/20 text-white p-2 rounded-full hover:bg-white/20 transition-all shadow-lg"
          title={isMuted ? "Unmute Preview" : "Mute Preview"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-400">
               <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L21 12m0 0l-3.75 2.25M21 12l-3.75-2.25M17.25 12h-2.25a2.25 2.25 0 00-2.25 2.25v.008c0 .414.336.75.75.75h2.25m-2.25-3h-2.25M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
               <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 5.25L6.75 9H4.5A2.25 2.25 0 002.25 11.25v1.5a2.25 2.25 0 002.25 2.25h2.25l4.5 3.75v-13.5z" />
               <line x1="16" y1="9" x2="22" y2="15" />
               <line x1="22" y1="9" x2="16" y2="15" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}