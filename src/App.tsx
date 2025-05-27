import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import SongSelection from './components/SongSelection';
import GameOver from './components/GameOver';

const App = () => {
  const [gameState, setGameState] = useState<'selection' | 'playing' | 'gameOver'>('selection');
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedSong, setSelectedSong] = useState<string | null>(null);

  // Load high score from local storage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('magicTilesHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Save high score to local storage when it changes
  useEffect(() => {
    localStorage.setItem('magicTilesHighScore', highScore.toString());
  }, [highScore]);

  const startGame = (songId: string) => {
    setSelectedSong(songId);
    setCurrentScore(0);
    setGameState('playing');
  };

  const endGame = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
    setCurrentScore(finalScore);
    setGameState('gameOver');
  };

  const returnToSongSelection = () => {
    setGameState('selection');
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 text-white overflow-hidden p-4">
      <h1 className="mb-6 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-md">
        Magic Tiles
      </h1>

      {gameState === 'selection' && (
        <SongSelection onSelectSong={startGame} />
      )}

      {gameState === 'playing' && selectedSong && (
        <GameBoard songId={selectedSong} onGameOver={endGame} />
      )}

      {gameState === 'gameOver' && (
        <GameOver
          score={currentScore}
          highScore={highScore}
          onRestart={() => startGame(selectedSong || 'default')}
          onBackToMenu={returnToSongSelection}
        />
      )}

      <div className="mt-6 text-center text-violet-300 text-xs">
        <p>© 2025 Magic Tiles Game</p>
      </div>
    </div>
  );
};

export default App;
