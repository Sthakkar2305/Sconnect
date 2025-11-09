interface ControlsProps {
  isRunning: boolean;
}

export function Controls({ isRunning }: ControlsProps) {
  return (
    <div className="absolute top-4 left-4 bg-black/60 text-white p-5 rounded-xl backdrop-blur-md border border-white/20 shadow-2xl">
      <h2 className="font-bold text-xl mb-3 tracking-wide">Controls</h2>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">W</kbd>
          <span className="opacity-80">/</span>
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">↑</kbd>
          <span>Run to Temples</span>
        </li>
        <li className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">S</kbd>
          <span className="opacity-80">/</span>
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">↓</kbd>
          <span>Return to Start</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-16 text-xs opacity-70">Mouse:</span>
          <span>Orbit Camera</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-16 text-xs opacity-70">Scroll:</span>
          <span>Zoom Camera</span>
        </li>
      </ul>
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Status:</span>
          <span
            className={`text-sm font-bold ${
              isRunning ? 'text-green-400' : 'text-gray-400'
            }`}
          >
            {isRunning ? '🏇 Running' : '⏸ Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
}
