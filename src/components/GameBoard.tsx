import { useState, useEffect, useRef, useCallback } from 'react';

interface Tile {
  id: number;
  lane: number;
  y: number;
  hit: boolean;
  missed: boolean;
}

interface GameBoardProps {
  songId: string;
  onGameOver: (score: number) => void;
}

// Song speed data (in pixels per frame)
const songData: Record<string, { speed: number; name: string }> = {
  default: { speed: 5, name: "Default Song" },
  classic: { speed: 4, name: "Classical Melody" },
  pop: { speed: 6, name: "Pop Hit" },
  rock: { speed: 7, name: "Rock Star" },
  edm: { speed: 8, name: "EDM Beat" },
};

const GameBoard: React.FC<GameBoardProps> = ({ songId, onGameOver }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showPerfect, setShowPerfect] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const nextTileIdRef = useRef(1);
  const lastTileTimeRef = useRef(0);
  const speed = songData[songId]?.speed || 5;
  const boardHeight = 600;
  const tileHeight = 150;
  const lanes = 4;

  // Handle tile generation
  const generateTile = useCallback(() => {
    const now = Date.now();
    // Only generate a new tile if enough time has passed
    if (now - lastTileTimeRef.current < 500) return;

    lastTileTimeRef.current = now;
    const lane = Math.floor(Math.random() * lanes);

    setTiles(prev => [
      ...prev,
      {
        id: nextTileIdRef.current++,
        lane,
        y: -tileHeight,
        hit: false,
        missed: false
      }
    ]);
  }, [lanes]);

  // Handle tile clicking
  const handleTileClick = (tileId: number) => {
    setTiles(prev => prev.map(tile => {
      if (tile.id === tileId && !tile.hit && !tile.missed) {
        // Increment score and combo
        setScore(s => s + 1 + combo);
        setCombo(c => c + 1);

        // Show "Perfect" text if combo is a multiple of 5
        if ((combo + 1) % 5 === 0) {
          setShowPerfect(true);
          setTimeout(() => setShowPerfect(false), 1000);
        }

        return { ...tile, hit: true };
      }
      return tile;
    }));
  };

  // Game loop
  useEffect(() => {
    if (isPaused) return;

    const updateGame = () => {
      // Generate new tiles randomly
      if (Math.random() < 0.03) {
        generateTile();
      }

      // Update tile positions
      setTiles(prev => {
        let gameOver = false;

        const updatedTiles = prev.map(tile => {
          // If the tile has been hit, move it faster to make it disappear
          const tileSpeed = tile.hit ? speed * 2 : speed;
          const newY = tile.y + tileSpeed;

          // Mark tile as missed if it goes off the bottom of the board
          if (newY > boardHeight && !tile.hit && !tile.missed) {
            gameOver = true;
            return { ...tile, missed: true };
          }

          return { ...tile, y: newY };
        });

        // Remove tiles that are far off screen
        const visibleTiles = updatedTiles.filter(tile => tile.y < boardHeight + 100);

        // End game if a tile was missed
        if (gameOver) {
          if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
            gameLoopRef.current = null;
          }
          setTimeout(() => onGameOver(score), 500);
        }

        return visibleTiles;
      });

      gameLoopRef.current = requestAnimationFrame(updateGame);
    };

    gameLoopRef.current = requestAnimationFrame(updateGame);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [generateTile, isPaused, onGameOver, score, speed]);

  // Pause/resume game when visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 flex items-center justify-between w-full">
        <div className="text-xl font-bold">Score: {score}</div>
        {combo > 1 && <div className="text-lg">Combo: x{combo}</div>}
      </div>

      {/* Game board */}
      <div
        ref={boardRef}
        className="relative bg-gradient-to-b from-violet-900/30 to-indigo-900/30 backdrop-blur-sm rounded-lg overflow-hidden"
        style={{ width: `${lanes * 80}px`, height: `${boardHeight}px` }}
      >
        {/* Render lane dividers */}
        {Array.from({ length: lanes - 1 }).map((_, index) => (
          <div
            key={index}
            className="absolute top-0 bottom-0 w-px bg-white/20"
            style={{ left: `${(index + 1) * 80}px` }}
          />
        ))}

        {/* Render tiles */}
        {tiles.map(tile => (
          <div
            key={tile.id}
            className={`absolute w-[80px] ${
              tile.hit
                ? 'bg-green-500/50 border-green-400'
                : tile.missed
                  ? 'bg-red-500/50 border-red-400'
                  : 'bg-black border-violet-400 cursor-pointer hover:bg-black/80'
            } border-2 rounded-sm transition-colors`}
            style={{
              left: `${tile.lane * 80}px`,
              top: `${tile.y}px`,
              height: `${tileHeight}px`,
            }}
            onClick={() => !tile.hit && !tile.missed && handleTileClick(tile.id)}
          />
        ))}

        {/* Perfect combo text */}
        {showPerfect && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pink-300 font-bold text-4xl animate-bounce">
            PERFECT!
          </div>
        )}
      </div>

      {/* Song title */}
      <div className="mt-4 text-center">
        <p>Playing: {songData[songId]?.name || "Unknown Song"}</p>
      </div>
    </div>
  );
};

export default GameBoard;
