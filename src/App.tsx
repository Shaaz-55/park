/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  RotateCcw, 
  Home as HomeIcon, 
  Circle, 
  Square, 
  Triangle, 
  Star, 
  Gamepad2,
  Trophy,
  Skull
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';

// --- Types ---
type GameState = 'HOME' | 'RED_LIGHT_GREEN_LIGHT' | 'IDENTIFY_CHANGES';
type PlayStatus = 'IDLE' | 'PLAYING' | 'WON' | 'ELIMINATED' | 'MEMORIZING';

// --- Constants ---
const SHAPES = [Circle, Square, Triangle, Star];
const COLORS = [
  'text-red-500', 
  'text-blue-500', 
  'text-green-500', 
  'text-yellow-500', 
  'text-purple-500', 
  'text-orange-500'
];

// --- Components ---

const SquidGameDoll = ({ isRedLight }: { isRedLight: boolean }) => {
  return (
    <motion.div 
      className="relative w-24 h-48 flex flex-col items-center"
      animate={{ rotateY: isRedLight ? 0 : 180 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Back of the doll (visible when rotated) */}
      <div 
        className="absolute inset-0 flex flex-col items-center"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        <div className="w-16 h-16 bg-zinc-900 rounded-full" />
        <div className="w-4 h-2 bg-[#f8e3d4] -mt-1" />
        <div className="w-16 h-20 bg-orange-500 rounded-t-lg" />
        <div className="flex gap-2 -mt-1">
          <div className="w-4 h-14 bg-white" />
          <div className="w-4 h-14 bg-white" />
        </div>
      </div>

      {/* Front of the doll */}
      <div 
        className="absolute inset-0 flex flex-col items-center"
        style={{ backfaceVisibility: 'hidden' }}
      >
        {/* Hair Pigtails */}
        <div className="absolute top-8 -left-2 w-6 h-6 bg-zinc-900 rounded-full" />
        <div className="absolute top-8 -right-2 w-6 h-6 bg-zinc-900 rounded-full" />

        {/* Head */}
        <div className="relative w-14 h-16 bg-[#f8e3d4] rounded-2xl border-2 border-zinc-300 overflow-hidden flex flex-col items-center pt-4 shadow-sm">
          {/* Hair Bangs */}
          <div className="absolute top-0 w-full h-6 bg-zinc-900 rounded-b-lg" />
          
          {/* Eyes */}
          <div className="flex gap-3 mt-2 relative z-10">
            <div className={cn("w-2 h-2 bg-zinc-900 rounded-full transition-all duration-300", isRedLight && "bg-red-600 shadow-[0_0_8px_red]")} />
            <div className={cn("w-2 h-2 bg-zinc-900 rounded-full transition-all duration-300", isRedLight && "bg-red-600 shadow-[0_0_8px_red]")} />
          </div>
          
          {/* Mouth */}
          <div className="w-3 h-1.5 bg-red-500 rounded-full mt-3" />
        </div>

        {/* Neck */}
        <div className="w-4 h-2 bg-[#f8e3d4] -mt-1" />

        {/* Body */}
        <div className="relative w-16 h-20">
          {/* Yellow Shirt */}
          <div className="absolute inset-0 bg-yellow-400 rounded-t-lg" />
          {/* Orange Dress */}
          <div className="absolute top-4 inset-x-0 bottom-0 bg-orange-500 rounded-t-md border-t-2 border-orange-600" />
          {/* Dress Straps */}
          <div className="absolute top-0 left-2 w-3 h-5 bg-orange-500" />
          <div className="absolute top-0 right-2 w-3 h-5 bg-orange-500" />
        </div>

        {/* Legs */}
        <div className="flex gap-2 -mt-1">
          <div className="w-4 h-14 flex flex-col">
            <div className="h-4 bg-[#f8e3d4]" />
            <div className="h-8 bg-white" />
            <div className="h-2 bg-zinc-900 rounded-b-sm" />
          </div>
          <div className="w-4 h-14 flex flex-col">
            <div className="h-4 bg-[#f8e3d4]" />
            <div className="h-8 bg-white" />
            <div className="h-2 bg-zinc-900 rounded-b-sm" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Button = ({ 
  onClick, 
  children, 
  className, 
  variant = 'primary' 
}: { 
  onClick: () => void; 
  children: React.ReactNode; 
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-8 py-6 rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3 min-w-[200px]",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

// --- Game 1: Red Light Green Light ---
const RedLightGreenLight = ({ onBack }: { onBack: () => void }) => {
  const [status, setStatus] = useState<PlayStatus>('PLAYING');
  const [isRedLight, setIsRedLight] = useState(true);
  const [playerPosition, setPlayerPosition] = useState(0);
  const finishLine = 90; // percentage
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const startLightCycle = useCallback(() => {
    const nextInterval = isRedLight ? Math.random() * 2000 + 1000 : Math.random() * 3000 + 2000;
    gameLoopRef.current = setTimeout(() => {
      setIsRedLight(prev => !prev);
    }, nextInterval);
  }, [isRedLight]);

  useEffect(() => {
    if (status === 'PLAYING') {
      startLightCycle();
    }
    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, [isRedLight, status, startLightCycle]);

  const handleMove = useCallback(() => {
    if (status !== 'PLAYING') return;

    if (isRedLight) {
      setStatus('ELIMINATED');
      return;
    }

    setPlayerPosition(prev => {
      const next = prev + 5;
      if (next >= finishLine) {
        setStatus('WON');
        confetti();
        return finishLine;
      }
      return next;
    });
  }, [isRedLight, status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleMove();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  const resetGame = () => {
    setPlayerPosition(0);
    setIsRedLight(true);
    setStatus('PLAYING');
  };

  return (
    <div className={cn(
      "fixed inset-0 flex flex-col items-center justify-center transition-colors duration-500",
      isRedLight ? "bg-red-100" : "bg-green-100"
    )}>
      <div className="absolute top-8 left-8">
        <Button onClick={onBack} variant="secondary" className="px-4 py-3 text-lg min-w-fit">
          <HomeIcon size={24} /> Back
        </Button>
      </div>

      <div className="text-center mb-12">
        <h2 className={cn(
          "text-6xl font-black uppercase tracking-widest mb-4",
          isRedLight ? "text-red-600" : "text-green-600"
        )}>
          {isRedLight ? "Red Light!" : "Green Light!"}
        </h2>
        <p className="text-2xl text-zinc-600 font-medium">Press Right Arrow Key to Move</p>
      </div>

      <div className="relative w-full max-w-5xl h-64 bg-white/50 rounded-3xl border-4 border-dashed border-zinc-300 overflow-hidden shadow-inner">
        {/* Finish Line */}
        <div className="absolute right-[10%] top-0 bottom-0 w-2 bg-zinc-800 flex flex-col justify-around py-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-full h-2 bg-white" />
          ))}
        </div>

        {/* Player */}
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
          animate={{ left: `${playerPosition}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <ArrowRight size={32} />
          </div>
          <span className="mt-2 font-bold text-blue-600">YOU</span>
        </motion.div>

        {/* Doll */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <SquidGameDoll isRedLight={isRedLight} />
          <span className="mt-2 font-bold text-orange-600">DOLL</span>
        </div>
      </div>

      <AnimatePresence>
        {status !== 'PLAYING' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <div className="bg-white rounded-[40px] p-12 text-center max-w-xl w-full shadow-2xl">
              {status === 'WON' ? (
                <>
                  <Trophy size={80} className="text-yellow-500 mx-auto mb-6" />
                  <h3 className="text-5xl font-black text-zinc-900 mb-4">Yayy !!! You won.</h3>
                  <p className="text-2xl text-zinc-600 mb-10">You reached the finish line safely!</p>
                  <div className="flex flex-col gap-4">
                    <Button onClick={resetGame} variant="success">Play Again</Button>
                    <Button onClick={onBack} variant="secondary">Back to Home</Button>
                  </div>
                </>
              ) : (
                <>
                  <Skull size={80} className="text-red-500 mx-auto mb-6" />
                  <h3 className="text-5xl font-black text-zinc-900 mb-4">Eliminated!</h3>
                  <p className="text-2xl text-zinc-600 mb-10">You moved during a Red Light.</p>
                  <div className="flex flex-col gap-4">
                    <Button onClick={resetGame} variant="danger">Try Again</Button>
                    <Button onClick={onBack} variant="secondary">Back to Home</Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Game 2: Identify Changes ---
const IdentifyChanges = ({ onBack }: { onBack: () => void }) => {
  const [status, setStatus] = useState<PlayStatus>('MEMORIZING');
  const [timer, setTimer] = useState(5);
  const [grid, setGrid] = useState<{ id: number; shape: any; color: string }[]>([]);
  const [changedIndex, setChangedIndex] = useState<number | null>(null);

  const generateGrid = useCallback(() => {
    const newGrid = [];
    for (let i = 0; i < 9; i++) {
      newGrid.push({
        id: i,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }
    setGrid(newGrid);
    setStatus('MEMORIZING');
    setTimer(5);
    setChangedIndex(null);
  }, []);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'MEMORIZING' && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (status === 'MEMORIZING' && timer === 0) {
      // Change one random shape
      const indexToChange = Math.floor(Math.random() * grid.length);
      setChangedIndex(indexToChange);
      setGrid(prev => {
        const next = [...prev];
        const current = next[indexToChange];
        let newShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        let newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        // Ensure it actually changes
        while (newShape === current.shape && newColor === current.color) {
          newShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
          newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
        
        next[indexToChange] = { ...current, shape: newShape, color: newColor };
        return next;
      });
      setStatus('PLAYING');
    }
    return () => clearInterval(interval);
  }, [status, timer, grid.length]);

  const handleShapeClick = (index: number) => {
    if (status !== 'PLAYING') return;
    if (index === changedIndex) {
      setStatus('WON');
      confetti();
    }
  };

  const resetGame = () => {
    generateGrid();
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-50">
      <div className="absolute top-8 left-8">
        <Button onClick={onBack} variant="secondary" className="px-4 py-3 text-lg min-w-fit">
          <HomeIcon size={24} /> Back
        </Button>
      </div>

      <div className="text-center mb-12 max-w-2xl px-6">
        <h2 className="text-5xl font-black text-zinc-900 mb-4">Identify the Change</h2>
        {status === 'MEMORIZING' ? (
          <div className="space-y-4">
            <p className="text-3xl text-blue-600 font-bold">Memorize the grid!</p>
            <div className="text-7xl font-black text-zinc-800">{timer}</div>
          </div>
        ) : (
          <p className="text-3xl text-emerald-600 font-bold">Which shape changed?</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6 p-8 bg-white rounded-[40px] shadow-xl border-4 border-zinc-200">
        {grid.map((item, index) => {
          const Icon = item.shape;
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShapeClick(index)}
              className={cn(
                "w-32 h-32 rounded-3xl flex items-center justify-center transition-all",
                status === 'PLAYING' ? "hover:bg-zinc-100 cursor-pointer" : "cursor-default",
                "bg-zinc-50 border-2 border-zinc-100"
              )}
            >
              <Icon size={64} className={item.color} strokeWidth={3} />
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {status === 'WON' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <div className="bg-white rounded-[40px] p-12 text-center max-w-xl w-full shadow-2xl">
              <Trophy size={80} className="text-yellow-500 mx-auto mb-6" />
              <h3 className="text-5xl font-black text-zinc-900 mb-4">Yayy !!! You won.</h3>
              <p className="text-2xl text-zinc-600 mb-10">You correctly identified the changed shape!</p>
              <div className="flex flex-col gap-4">
                <Button onClick={resetGame} variant="success">Play Again</Button>
                <Button onClick={onBack} variant="secondary">Back to Home</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [gameState, setGameState] = useState<GameState>('HOME');

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-blue-100">
      <AnimatePresence mode="wait">
        {gameState === 'HOME' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className="text-center mb-16">
              <div className="inline-flex p-4 bg-blue-100 rounded-3xl mb-6 text-blue-600">
                <Gamepad2 size={64} />
              </div>
              <h1 className="text-7xl font-black text-zinc-900 tracking-tight mb-4">Fun & Easy Games</h1>
              <p className="text-3xl text-zinc-500 font-medium">Simple games for everyone to enjoy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGameState('RED_LIGHT_GREEN_LIGHT')}
                className="group relative bg-white p-10 rounded-[40px] shadow-xl border-4 border-transparent hover:border-red-400 transition-all text-left overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-50 rounded-full group-hover:scale-110 transition-transform" />
                <h2 className="text-4xl font-black text-zinc-900 mb-4 relative">Red Light Green Light</h2>
                <p className="text-2xl text-zinc-500 relative">Move carefully when the light is green. Don't get caught!</p>
                <div className="mt-8 flex items-center gap-2 text-red-600 font-bold text-xl relative">
                  Play Now <ArrowRight size={24} />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGameState('IDENTIFY_CHANGES')}
                className="group relative bg-white p-10 rounded-[40px] shadow-xl border-4 border-transparent hover:border-blue-400 transition-all text-left overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full group-hover:scale-110 transition-transform" />
                <h2 className="text-4xl font-black text-zinc-900 mb-4 relative">Identify Changes</h2>
                <p className="text-2xl text-zinc-500 relative">Memorize the grid and find the one shape that changes.</p>
                <div className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-xl relative">
                  Play Now <ArrowRight size={24} />
                </div>
              </motion.button>
            </div>
            
            <footer className="mt-20 text-zinc-400 text-xl font-medium">
              Designed for accessibility and fun.
            </footer>
          </motion.div>
        )}

        {gameState === 'RED_LIGHT_GREEN_LIGHT' && (
          <motion.div 
            key="game1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RedLightGreenLight onBack={() => setGameState('HOME')} />
          </motion.div>
        )}

        {gameState === 'IDENTIFY_CHANGES' && (
          <motion.div 
            key="game2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <IdentifyChanges onBack={() => setGameState('HOME')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
