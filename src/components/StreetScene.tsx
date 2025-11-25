import { useEffect, useRef, useState } from 'react';
import { initScene } from '../scene/sceneSetup';
import { Controls } from './Controls';
import { Navbar } from './Navbar';

type SceneControls = {
  cleanup: () => void;
  goTo: (z: number, isTour?: boolean) => void;
};

export function StreetScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const sceneRef = useRef<SceneControls | null>(null);

  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  const visibilityRef = useRef({ showContact, showAbout, showProjects });

  useEffect(() => {
    if (!mountRef.current) return;

    const handleChariotMove = (z: number) => {
      const current = visibilityRef.current;

      // 1. Buildings/Contact (Around 0)
      const shouldShowContact = z > -20 && z < 20;
      if (shouldShowContact !== current.showContact) {
        setShowContact(shouldShowContact);
      }

      // 2. Temples/About (Around -250)
      const shouldShowAbout = z > -270 && z < -230;
      if (shouldShowAbout !== current.showAbout) {
        setShowAbout(shouldShowAbout);
      }

      // 3. Playground/Projects (Around -500)
      const shouldShowProjects = z > -520 && z < -480;
      if (shouldShowProjects !== current.showProjects) {
        setShowProjects(shouldShowProjects);
      }
    };

    sceneRef.current = initScene(
      mountRef.current,
      setIsRunning,
      handleChariotMove
    );

    return () => {
      sceneRef.current?.cleanup();
    };
  }, []);

  useEffect(() => {
    visibilityRef.current = { showContact, showAbout, showProjects };
  }, [showContact, showAbout, showProjects]);

  const handleNavClick = (section: string) => {
    if (!sceneRef.current) return;
    const { goTo } = sceneRef.current;

    switch (section) {
      case 'home':
        goTo(0, false);
        break;
      case 'about':
        goTo(-250, false);
        break;
      case 'projects':
        goTo(-500, false);
        break;
      case 'contact':
        goTo(0, false);
        break;
      case 'start':
        goTo(-760, true);
        break;
      default:
        goTo(0, false);
    }
  };

  return (
    <div className="w-full h-full relative">
      <Navbar onNavClick={handleNavClick} />
      <div ref={mountRef} className="w-full h-full" />
      <Controls isRunning={isRunning} />

      {/* TEXT OVERLAYS */}
      {showContact && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <a
            href="tel:+9184879585454"
            className="text-white text-6xl font-bold pointer-events-auto"
            style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}
          >
            Contact Us
          </a>
        </div>
      )}
      {showAbout && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <a
            href="/about"
            className="text-white text-6xl font-bold pointer-events-auto"
            style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}
          >
            About Company
          </a>
        </div>
      )}
      {showProjects && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <a
            href="/projects"
            className="text-white text-6xl font-bold pointer-events-auto"
            style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}
          >
            Our Projects
          </a>
        </div>
      )}
    </div>
  );
}