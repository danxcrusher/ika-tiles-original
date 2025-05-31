import { useEffect, useState } from 'react';

interface GameOverProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onBackToMenu: () => void;
  songName?: string;
}

const GameOver: React.FC<GameOverProps> = ({
  score,
  highScore,
  onRestart,
  onBackToMenu,
  songName,
}) => {
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Check if this is a new high score
  useEffect(() => {
    if (score > highScore - 1) {
      setIsNewHighScore(true);
    }
  }, [score, highScore]);

  // Animate the score counting up
  useEffect(() => {
    if (animatedScore < score) {
      const timeout = setTimeout(() => {
        setAnimatedScore(prev => Math.min(prev + Math.ceil(score / 20), score));
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [animatedScore, score]);

  return (
    <div className="w-full max-w-md bg-violet-950/50 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center">
      <h2 className="text-3xl font-bold mb-2">Game Over</h2>
      {songName && <p className="text-violet-300 mb-4">Song: {songName}</p>}

      <div className="relative mt-8 mb-6">
        <div className="text-5xl font-bold mb-2">{animatedScore}</div>
        <div className="text-violet-300">Your Score</div>

        {isNewHighScore && (
          <div className="absolute -top-4 right-0 bg-yellow-500 text-black font-bold px-3 py-1 rounded-full transform rotate-12 animate-bounce">
            NEW RECORD!
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="text-2xl font-semibold">{highScore}</div>
        <div className="text-violet-300">High Score</div>
      </div>

      <div className="flex flex-col space-y-3">
        <button
          onClick={onRestart}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3 px-6 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Play Again
        </button>

        <button
          onClick={onBackToMenu}
          className="bg-violet-800/50 hover:bg-violet-700/60 text-white py-2 px-6 rounded-lg font-bold transition-colors"
        >
          Back to Menu
        </button>
      </div>

      <div className="mt-8 text-violet-300 text-sm">
        <p>Share your score with friends!</p>
        <div className="flex justify-center mt-2 space-x-4">
          {['🎮', '📱', '🎵', '🌟'].map((emoji, index) => (
            <button
              key={index}
              className="bg-violet-800/40 hover:bg-violet-700/60 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameOver;
