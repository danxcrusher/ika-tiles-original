import { useState } from 'react';

interface SongSelectionProps {
  onSelectSong: (songId: string) => void;
}

interface SongData {
  id: string;
  name: string;
  artist: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  image: string;
}

const songs: SongData[] = [
  {
    id: 'classic',
    name: 'Classical Melody',
    artist: 'Beethoven',
    difficulty: 2,
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 'pop',
    name: 'Pop Hit',
    artist: 'The Melodies',
    difficulty: 3,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
  },
  {
    id: 'rock',
    name: 'Rock Star',
    artist: 'Guitar Heroes',
    difficulty: 4,
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 'edm',
    name: 'EDM Beat',
    artist: 'DJ Tiles',
    difficulty: 5,
    image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
  {
    id: 'default',
    name: 'Practice Song',
    artist: 'Tutorial',
    difficulty: 1,
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  },
];

const SongSelection: React.FC<SongSelectionProps> = ({ onSelectSong }) => {
  const [selectedTab, setSelectedTab] = useState<'songs' | 'albums' | 'special'>('songs');

  return (
    <div className="w-full max-w-md bg-violet-950/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-around mb-6 border-b border-violet-800 pb-3">
        <button
          onClick={() => setSelectedTab('songs')}
          className={`px-4 py-2 rounded-t-lg font-bold transition-colors ${
            selectedTab === 'songs'
              ? 'bg-violet-600 text-white'
              : 'text-violet-300 hover:text-white'
          }`}
        >
          SONGS
          {selectedTab === 'songs' && <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-1 rounded-full">5</span>}
        </button>
        <button
          onClick={() => setSelectedTab('albums')}
          className={`px-4 py-2 rounded-t-lg font-bold transition-colors ${
            selectedTab === 'albums'
              ? 'bg-violet-600 text-white'
              : 'text-violet-300 hover:text-white'
          }`}
        >
          ALBUM
        </button>
        <button
          onClick={() => setSelectedTab('special')}
          className={`px-4 py-2 rounded-t-lg font-bold transition-colors ${
            selectedTab === 'special'
              ? 'bg-violet-600 text-white'
              : 'text-violet-300 hover:text-white'
          }`}
        >
          SPECIAL SONG
        </button>
      </div>

      {/* Song List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pb-2 pr-2">
        {songs.map((song) => (
          <div
            key={song.id}
            className="flex items-center bg-indigo-900/40 hover:bg-indigo-800/60 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-[1.02]"
          >
            {/* Song image */}
            <div className="h-16 w-16 shrink-0 bg-gradient-to-br from-purple-700 to-indigo-800 overflow-hidden">
              <img
                src={song.image}
                alt={song.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Song details */}
            <div className="ml-3 flex-1">
              <h3 className="font-bold text-white">{song.name}</h3>
              <p className="text-sm text-violet-300">Original by {song.artist}</p>
            </div>

            {/* Difficulty indicator */}
            <div className="mr-3 flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full mx-0.5 ${
                    i < song.difficulty ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Play button */}
            <button
              onClick={() => onSelectSong(song.id)}
              className="bg-amber-500 text-white px-4 py-2 font-bold hover:bg-amber-400 transition-colors m-2 rounded"
            >
              PLAY
            </button>
          </div>
        ))}
      </div>

      <div className="text-center mt-5 text-violet-300 text-sm">
        <p>Tap the black tiles as they fall</p>
        <p>Don't miss any black tile!</p>
      </div>
    </div>
  );
};

export default SongSelection;
