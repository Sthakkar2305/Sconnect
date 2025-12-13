interface ControlsProps {
  isRunning: boolean;
}

export function Controls({ isRunning }: ControlsProps) {
  return (
    // Responsive positioning:
    // Mobile: Bottom-left, smaller text (text-xs)
    // Desktop (md:): Top-left, normal text (text-sm)
    <div className="absolute bottom-4 left-4 md:top-4 md:left-4 md:bottom-auto z-20 max-w-[200px] md:max-w-xs bg-black/60 text-white p-3 md:p-5 rounded-xl backdrop-blur-md border border-white/20 shadow-2xl transition-all">
      <h2 className="font-bold text-sm md:text-xl mb-2 md:mb-3 tracking-wide">Controls</h2>
      <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
        {/* Hide Keyboard controls on touch devices (hidden block md:flex) */}
        {/* <li className="hidden md:flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">W</kbd>
          <span className="opacity-80">/</span>
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">↑</kbd>
          <span>Run</span>
        </li>
        <li className="hidden md:flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">S</kbd>
          <span className="opacity-80">/</span>
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">↓</kbd>
          <span>Return</span>
        </li> */}
        
        {/* Show generic touch hint on all, or specific gestures */}
        <li className="flex items-center gap-2">
          <span className="w-12 md:w-16 opacity-70">Swipe:</span>
          <span>Rotate World</span>
        </li>
      </ul>
      
      <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-white/20">
        <div className="flex items-center gap-2">
          <span className="text-[10px] md:text-xs font-medium">Status:</span>
          <span
            className={`text-xs md:text-sm font-bold ${
              isRunning ? 'text-green-400' : 'text-gray-400'
            }`}
          >
            {isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
}