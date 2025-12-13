import { useState } from 'react';
import { StreetScene } from './components/StreetScene';
import { BookDemo } from './components/BookDemo';
import { AboutUs } from './components/AboutUs';
import { ContactUs } from './components/ContactUs'; // New Import
import * as THREE from 'three';

export default function App() {
  const [view, setView] = useState<'home' | 'book-demo' | 'about' | 'contact'>('home');
  const [customTexture, setCustomTexture] = useState<THREE.Texture | null>(null);

  const handleStart = (texture: THREE.Texture | null) => {
    setCustomTexture(texture);
    setView('home');
  };

  return (
    <>
      {view === 'book-demo' && (
        <BookDemo 
            onStartJourney={handleStart} 
            onBack={() => setView('home')} // "Skip" button action
        />
      )}

      {view === 'about' && (
        <AboutUs 
            onBack={() => setView('home')} 
            onBookDemo={() => setView('book-demo')}
        />
      )}

      {view === 'contact' && (
        <ContactUs onBack={() => setView('home')} />
      )}

      {view === 'home' && (
        <StreetScene 
          initialTexture={customTexture} 
          onOpenDemo={() => setView('book-demo')}
          onOpenAbout={() => setView('about')}
          // Now opens the Contact Page instead of calling phone directly
          onOpenContact={() => setView('contact')} 
        />
      )}
    </>
  );
}