import { useState, useEffect, useRef, useCallback } from 'react';

interface Tile {
  id: number;
  lane: number;
  y: number;
  hit: boolean;
  missed: boolean;
  targetTime?: number; // Time the tile should be tapped
}

interface Note {
  time: number; // Time in seconds from song start for the tile to be tapped
  lane: number;
}

interface BeatmapMetadata {
  songName?: string;
  artistName?: string;
  recommendedSpeed?: number;
}

interface BeatmapFile {
  metadata?: BeatmapMetadata;
  notes: Note[];
}

interface GameBoardProps {
  songId: string;
  audioUrl: string;
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

const FALL_DURATION_SECONDS = 2.0; // Time in seconds for a note to fall from top to hit line

const GameBoard: React.FC<GameBoardProps> = ({ songId, audioUrl, onGameOver }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showPerfect, setShowPerfect] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedBeatmap, setLoadedBeatmap] = useState<BeatmapFile | null>(null);
  const [isLoadingBeatmap, setIsLoadingBeatmap] = useState(true);
  const [nextNoteIndex, setNextNoteIndex] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const nextTileIdRef = useRef(1);
  const lastTileTimeRef = useRef(0);
  const boardHeight = 600;
  const tileHeight = 150;
  const lanes = 4;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate speed based on FALL_DURATION_SECONDS to ensure notes fall the boardHeight in that time
  // Assuming 60 FPS for requestAnimationFrame for frame-based speed calculation
  const speed = boardHeight / (FALL_DURATION_SECONDS * 60);

  // --- Beatmap Loading ---
  useEffect(() => {
    const loadBeatmap = async () => {
      if (!songId) return;
      setIsLoadingBeatmap(true);
      setLoadedBeatmap(null);
      setNextNoteIndex(0);
      try {
        const response = await fetch(`/beatmaps/${songId}.json`);
        if (!response.ok) {
          console.warn(`Beatmap not found for ${songId}. No beatmap will be used.`);
          setLoadedBeatmap({ notes: [] });
        } else {
          const data: BeatmapFile = await response.json();
          if (data.notes) {
            data.notes.sort((a, b) => a.time - b.time);
          }
          setLoadedBeatmap(data);
        }
      } catch (error) {
        console.error(`Error loading or parsing beatmap for ${songId}:`, error);
        setLoadedBeatmap({ notes: [] });
      } finally {
        setIsLoadingBeatmap(false);
      }
    };

    loadBeatmap();
  }, [songId]);

  // --- Audio Handling Effect ---
  useEffect(() => {
    if (!audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    if (!audioRef.current || audioRef.current.src !== new URL(audioUrl, window.location.origin).toString()) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.load();
    }

    const audio = audioRef.current;
    if (isPaused) {
      audio.pause();
    } else {
      audio.play().catch(error => console.error("Error playing audio:", error));
    }

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audioUrl, isPaused]);

  // Handle tile generation based on beatmap or random
  const generateTile = useCallback((note?: Note) => {
    let laneToUse: number;
    let tileYPosition = -tileHeight;
    let tileNoteTime: number | undefined = undefined;

    if (note && audioRef.current) {
      laneToUse = note.lane;
      tileNoteTime = note.time;
    } else {
      laneToUse = Math.floor(Math.random() * lanes);
    }

    setTiles(prev => [
      ...prev,
      {
        id: nextTileIdRef.current++,
        lane: laneToUse,
        y: tileYPosition,
        hit: false,
        missed: false,
        targetTime: tileNoteTime
      }
    ]);
  }, [lanes, tileHeight]);

  // Handle tile clicking
  const handleTileClick = (tileId: number) => {
    setTiles(prev => prev.map(tile => {
      if (tile.id === tileId && !tile.hit && !tile.missed) {
        setScore(s => s + 1 + combo);
        setCombo(c => c + 1);

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
    if (isPaused || isLoadingBeatmap) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const updateGame = () => {
      if (!audioRef.current) {
        gameLoopRef.current = requestAnimationFrame(updateGame);
        return;
      }
      const currentTime = audioRef.current.currentTime;

      let generatedFromBeatmap = false;
      if (loadedBeatmap && loadedBeatmap.notes.length > 0 && nextNoteIndex < loadedBeatmap.notes.length) {
        const nextNote = loadedBeatmap.notes[nextNoteIndex];
        // Spawn note if current time is within FALL_DURATION_SECONDS of its target hit time
        if (currentTime >= nextNote.time - FALL_DURATION_SECONDS) {
          generateTile(nextNote);
          setNextNoteIndex(prev => prev + 1);
          generatedFromBeatmap = true;
        }
      }

      if (!generatedFromBeatmap && !isLoadingBeatmap && (!loadedBeatmap || loadedBeatmap.notes.length === 0)) {
        const now = Date.now();
        if (now - lastTileTimeRef.current > (songData[songId]?.speed ? 10000 / songData[songId].speed : 700) ) {
          if (Math.random() < 0.25) {
             generateTile();
          }
          lastTileTimeRef.current = now;
        }
      }

      setTiles(prev => {
        let gameOver = false;

        const updatedTiles = prev.map(tile => {
          const tileSpeed = tile.hit ? speed * 2 : speed;
          const newY = tile.y + tileSpeed;

          if (newY > boardHeight && !tile.hit && !tile.missed) {
            if (tile.targetTime !== undefined && currentTime > tile.targetTime + 0.2) {
              gameOver = true;
              return { ...tile, missed: true };
            }
            else if (tile.targetTime === undefined) {
                gameOver = true;
                return { ...tile, missed: true };
            }
          }

          return { ...tile, y: newY };
        });

        const visibleTiles = updatedTiles.filter(tile => tile.y < boardHeight + 100);

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
        gameLoopRef.current = null;
      }
    };
  }, [generateTile, isPaused, onGameOver, score, speed, loadedBeatmap, isLoadingBeatmap, nextNoteIndex, songId, boardHeight]);

  // Pause/resume game and audio when visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentlyPaused = document.hidden;
      setIsPaused(currentlyPaused);
      if (audioRef.current) {
        if (currentlyPaused) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(error => console.error("Error resuming audio:", error));
        }
      }
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

      <div
        ref={boardRef}
        className="relative bg-gradient-to-b from-violet-900/30 to-indigo-900/30 backdrop-blur-sm rounded-lg overflow-hidden"
        style={{ width: `${lanes * 80}px`, height: `${boardHeight}px` }}
      >
        {Array.from({ length: lanes - 1 }).map((_, index) => (
          <div
            key={index}
            className="absolute top-0 bottom-0 w-px bg-white/20"
            style={{ left: `${(index + 1) * 80}px` }}
          />
        ))}

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

        {showPerfect && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pink-300 font-bold text-4xl animate-bounce">
            PERFECT!
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p>Playing: {songData[songId]?.name || "Unknown Song"}</p>
      </div>
    </div>
  );
};

export default GameBoard;
