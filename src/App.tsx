import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
// import SongSelection from './components/SongSelection'; // Removed
import GameOver from './components/GameOver';

interface SingleSongType {
  id: string;
  audioUrl: string;
  name: string;
  artist: string;
}

// Define the single song
const ourSingleSong: SingleSongType = {
  id: 'ikadance-local',
  audioUrl: '/audio/ikadance.mp3', // Make sure ikadance.mp3 is in public/audio/
  name: 'Ikadance',
  artist: 'Local Source',
};

const App = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu'); // Added 'menu' state
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  // const [selectedSong, setSelectedSong] = useState<SingleSongType | null>(null); // We always use ourSingleSong

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

  const startGame = () => {
    // setSelectedSong(ourSingleSong); // Not needed, selectedSong is implicitly ourSingleSong
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

  const returnToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 text-white overflow-hidden p-4">
      <h1 className="mb-6 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-md">
        Magic Tiles
      </h1>

      {gameState === 'menu' && (
        <div className="text-center">
          <h2 className="text-3xl mb-4">Song: {ourSingleSong.name}</h2>
          <p className="text-xl mb-8">Artist: {ourSingleSong.artist}</p>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white py-3 px-8 rounded-lg font-bold text-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      )}

      {/* {gameState === 'selection' && (
        <SongSelection onSelectSong={startGame} />
      )} */}

      {gameState === 'playing' && ( // No longer need selectedSong check, it's always ourSingleSong
        <GameBoard songId={ourSingleSong.id} audioUrl={ourSingleSong.audioUrl} onGameOver={endGame} />
      )}

      {gameState === 'gameOver' && ( // No longer need selectedSong check
        <GameOver
          score={currentScore}
          highScore={highScore}
          onRestart={startGame} // Restart directly to playing
          onBackToMenu={returnToMenu}
          songName={ourSingleSong.name}
        />
      )}

      <div className="mt-6 text-center text-violet-300 text-xs">
        <p>© 2025 Magic Tiles Game</p>
      </div>
    </div>
  );
};

export default App;
