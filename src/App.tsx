import { useState } from 'react';
import { StreetScene } from './components/StreetScene';
import { BookDemo } from './components/BookDemo';
import * as THREE from 'three';

export default function App() {
  // 1. Set Initial View to 'home' (Street Scene first)
  const [view, setView] = useState<'home' | 'book-demo'>('home');
  const [customTexture, setCustomTexture] = useState<THREE.Texture | null>(null);

  const handleStart = (texture: THREE.Texture | null) => {
    setCustomTexture(texture);
    setView('home');
  };

  return (
    <>
      {view === 'book-demo' && (
        <BookDemo onStartJourney={handleStart} />
      )}

      {view === 'home' && (
        <StreetScene 
          initialTexture={customTexture} 
          onOpenDemo={() => setView('book-demo')} // Switch view on click
        />
      )}
    </>
  );
}