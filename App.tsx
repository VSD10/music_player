import React, { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import { Track } from './types';

// --- HELPER FUNCTIONS ---

const parseFileName = (fileName: string): { artist: string; name:string } => {
  const cleanedName = fileName.replace(/\.[^/.]+$/, ""); // remove extension
  const parts = cleanedName.split(" - ");
  if (parts.length > 1) {
    return {
      artist: parts[0].trim(),
      name: parts.slice(1).join(" - ").trim(),
    };
  }
  return {
    artist: "Unknown Artist",
    name: cleanedName.trim(),
  };
};

const formatTime = (time: number): string => {
  if (isNaN(time)) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


// --- SVG ICONS ---

const MusicIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
  </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5.14v14.72L19.72 12 8 5.14z"/></svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
);

const SkipNextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
);

const SkipPrevIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
);

const ShuffleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l3.181-3.183a8.25 8.25 0 00-11.664 0l-3.181 3.183" /></svg>
);

const RepeatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
  </svg>
);

const VolumeUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
);

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
);


// --- UI COMPONENTS ---

interface FileLoaderProps {
  onFilesSelected: (files: FileList) => void;
}
const FileLoader: React.FC<FileLoaderProps> = ({ onFilesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <MusicIcon className="w-24 h-24 text-gray-700 mb-6" />
      <h2 className="text-3xl font-bold text-gray-200 mb-2">Aura Player</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        Select your local music files or a folder to begin.
      </p>
      <input type="file" multiple accept="audio/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" aria-hidden="true" />
      <input type="file" accept="audio/*" ref={folderInputRef} onChange={handleFileChange} className="hidden" aria-hidden="true" 
        // @ts-ignore
        webkitdirectory="" directory="" />
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-600/30">
          Select Files
        </button>
         <button onClick={() => folderInputRef.current?.click()} className="px-8 py-4 bg-[#161B22] text-gray-200 font-semibold rounded-lg hover:bg-[#21262d] transition-all duration-300 transform hover:scale-105">
          Select Folder
        </button>
      </div>
    </div>
  );
};


interface TrackListProps {
  tracks: Track[];
  currentTrackIndex: number;
  onTrackSelect: (index: number) => void;
}
const TrackList: React.FC<TrackListProps> = ({ tracks, currentTrackIndex, onTrackSelect }) => (
  <div className="bg-black/30 border border-white/10 backdrop-blur-2xl rounded-2xl p-4 space-y-2 overflow-y-auto max-h-[80vh]">
    <h3 className="text-lg font-bold text-gray-300 p-3">Playlist</h3>
    {tracks.map((track, index) => (
      <button
        key={track.url}
        onClick={() => onTrackSelect(index)}
        aria-pressed={index === currentTrackIndex}
        className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-4 ${
          index === currentTrackIndex ? 'bg-purple-500/20' : 'hover:bg-white/5'
        }`}
      >
        <div className={`flex-shrink-0 text-sm font-mono ${index === currentTrackIndex ? 'text-purple-400' : 'text-gray-400'}`}>
           {(index + 1).toString().padStart(2, '0')}
        </div>
        <div>
          <p className={`font-semibold truncate ${index === currentTrackIndex ? 'text-white' : 'text-gray-300'}`}>{track.name}</p>
          <p className={`text-sm truncate ${index === currentTrackIndex ? 'text-purple-400/80' : 'text-gray-500'}`}>{track.artist}</p>
        </div>
      </button>
    ))}
  </div>
);

interface CircularProgressProps {
    progress: number;
    size: number;
    strokeWidth: number;
    onMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
    children: React.ReactNode;
    dialRef: React.RefObject<SVGSVGElement>;
}
const CircularProgress: React.FC<CircularProgressProps> = ({ progress, size, strokeWidth, children, onMouseDown, dialRef }) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg ref={dialRef} width={size} height={size} className="transform -rotate-90 cursor-pointer" onMouseDown={onMouseDown}>
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <circle cx={center} cy={center} r={radius + strokeWidth/2} fill="transparent" />
        <circle className="text-white/10" stroke="currentColor" strokeWidth={2} fill="transparent" r={radius} cx={center} cy={center} />
        <circle stroke="url(#progressGradient)" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" r={radius} cx={center} cy={center} style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  const isSeeking = useRef(false);
  const dialRef = useRef<SVGSVGElement>(null);

  const fadeAudio = useCallback((targetVolume: number, duration: number, onComplete?: () => void) => {
    if (!audioRef.current) {
      onComplete?.();
      return;
    }
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const audio = audioRef.current;
    const startVolume = audio.volume;
    const volumeChange = targetVolume - startVolume;

    if (Math.abs(volumeChange) < 0.01) {
      audio.volume = targetVolume;
      onComplete?.();
      return;
    }

    const steps = 50;
    const stepDuration = duration / steps;
    const stepVolumeChange = volumeChange / steps;
    let currentStep = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      const newVolume = startVolume + (stepVolumeChange * currentStep);
      audio.volume = Math.max(0, Math.min(1, newVolume));

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
        audio.volume = targetVolume;
        onComplete?.();
      }
    }, stepDuration);
  }, []);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Play failed", e));
      fadeAudio(volume, 500);
    } else {
      fadeAudio(0, 500, () => {
        audioRef.current?.pause();
      });
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);
  
  useEffect(() => {
    return () => {
      tracks.forEach(track => URL.revokeObjectURL(track.url));
       if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [tracks]);
  
  const seekToPosition = useCallback((clientX: number, clientY: number) => {
    if (!audioRef.current || !dialRef.current || !duration) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(clientY - centerY, clientX - centerX) + Math.PI / 2;
    
    let progress = angle / (2 * Math.PI);
    if (progress < 0) progress += 1;

    const newTime = progress * duration;
    if (isFinite(newTime)) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }
  }, [duration]);

  const handleSeekMove = useCallback((e: MouseEvent) => {
    if (!isSeeking.current) return;
    seekToPosition(e.clientX, e.clientY);
  }, [seekToPosition]);

  const handleSeekEnd = useCallback(() => {
    isSeeking.current = false;
    window.removeEventListener('mousemove', handleSeekMove);
    window.removeEventListener('mouseup', handleSeekEnd);
  }, [handleSeekMove]);

  const handleSeekStart = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    isSeeking.current = true;
    seekToPosition(e.clientX, e.clientY);
    window.addEventListener('mousemove', handleSeekMove);
    window.addEventListener('mouseup', handleSeekEnd);
  }, [seekToPosition, handleSeekMove, handleSeekEnd]);

  useEffect(() => {
      return () => { // Cleanup global listeners on unmount
          window.removeEventListener('mousemove', handleSeekMove);
          window.removeEventListener('mouseup', handleSeekEnd);
      };
  }, [handleSeekMove, handleSeekEnd]);

  const handleFilesSelected = useCallback((files: FileList) => {
    const newTracks: Track[] = Array.from(files).filter(file => file.type.startsWith('audio/')).map(file => ({ file, ...parseFileName(file.name), url: URL.createObjectURL(file) }));
    setTracks(prev => {
        prev.forEach(track => URL.revokeObjectURL(track.url));
        return newTracks;
    });
    if (newTracks.length > 0) {
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    } else {
      setCurrentTrackIndex(null);
    }
  }, []);

  const requestTrackChange = useCallback((newIndex: number) => {
    if (currentTrackIndex === newIndex) return;
  
    if (isPlaying && currentTrackIndex !== null) {
      fadeAudio(0, 500, () => {
        setCurrentTrackIndex(newIndex);
      });
    } else {
      setCurrentTrackIndex(newIndex);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }
  }, [isPlaying, currentTrackIndex, fadeAudio]);
  
  const handlePlayNext = useCallback(() => {
    if (tracks.length === 0) return;
    let nextIndex;
    if (isShuffled) {
      do { nextIndex = Math.floor(Math.random() * tracks.length); } while (tracks.length > 1 && nextIndex === currentTrackIndex);
    } else {
      nextIndex = (currentTrackIndex === null ? 0 : (currentTrackIndex + 1) % tracks.length);
    }
    requestTrackChange(nextIndex);
  }, [tracks.length, isShuffled, currentTrackIndex, requestTrackChange]);
  
  const handlePlayPrev = useCallback(() => {
    if (tracks.length === 0) return;
    const prevIndex = (currentTrackIndex === null ? 0 : (currentTrackIndex - 1 + tracks.length) % tracks.length);
    requestTrackChange(prevIndex);
  }, [tracks.length, currentTrackIndex, requestTrackChange]);

  const handlePlayPause = useCallback(() => {
    if (currentTrackIndex === null && tracks.length > 0) {
        setCurrentTrackIndex(0);
        setIsPlaying(true);
    } else if (currentTrackIndex !== null) {
        setIsPlaying(prev => !prev);
    }
  }, [currentTrackIndex, tracks.length]);

  const handleTrackSelect = useCallback((index: number) => {
    requestTrackChange(index);
  }, [requestTrackChange]);

  const handleTimeUpdate = () => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); };
  
  const handleLoadedMetadata = () => { 
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      if (isPlaying) {
        audioRef.current.volume = 0;
        audioRef.current.play().catch(e => console.error("Auto-play failed", e));
        fadeAudio(volume, 500);
      }
    } 
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one' && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
    } else if (currentTrackIndex === tracks.length - 1 && repeatMode === 'none' && !isShuffled) {
      setIsPlaying(false);
    } else {
      handlePlayNext();
    }
  };

  const toggleShuffle = () => setIsShuffled(prev => !prev);
  const cycleRepeatMode = () => {
    setRepeatMode(prev => (prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none'));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 sm:p-8 font-sans">
      <main className="max-w-7xl mx-auto">
        {tracks.length === 0 ? (
          <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
             <FileLoader onFilesSelected={handleFilesSelected} />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 bg-black/30 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-between text-center min-h-[80vh]">
                <header className="w-full flex justify-between items-center text-gray-400">
                    <h1 className="font-bold text-lg text-white">AURA</h1>
                    <button className="p-2 hover:text-white"><MenuIcon className="w-6 h-6" /></button>
                </header>

                <div className="flex-grow flex flex-col items-center justify-center w-full">
                    <div className="my-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white truncate max-w-sm sm:max-w-md">{currentTrack?.name || 'No song selected'}</h2>
                        <p className="text-lg text-gray-400 mt-2">{currentTrack?.artist || '...'}</p>
                    </div>

                    <CircularProgress size={300} strokeWidth={8} progress={(currentTime / duration) * 100 || 0} onMouseDown={handleSeekStart} dialRef={dialRef}>
                       <div className="text-center">
                          <p className="text-5xl font-mono font-bold text-white tracking-wider">{formatTime(currentTime)}</p>
                          <p className="text-gray-500 text-sm font-mono mt-1">{formatTime(duration)}</p>
                       </div>
                    </CircularProgress>

                </div>
                
                <div className="w-full max-w-lg mx-auto space-y-6">
                    <div className="flex items-center justify-around bg-black/30 border border-white/10 rounded-full py-2 px-4 backdrop-blur-xl shadow-2xl shadow-black/30">
                        <button 
                            onClick={toggleShuffle} 
                            className={`p-3 rounded-full transition-colors duration-300 ${isShuffled ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400 hover:text-white'}`} 
                            aria-label="Shuffle"
                        >
                            <ShuffleIcon className="w-6 h-6"/>
                        </button>

                        <button 
                            onClick={handlePlayPrev} 
                            className="p-3 rounded-full text-gray-300 hover:text-white transition-colors duration-300" 
                            aria-label="Previous song"
                        >
                            <SkipPrevIcon className="w-8 h-8"/>
                        </button>

                        <button 
                            onClick={handlePlayPause} 
                            className="bg-purple-600 text-white rounded-full p-5 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/40" 
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>}
                        </button>

                        <button 
                            onClick={handlePlayNext} 
                            className="p-3 rounded-full text-gray-300 hover:text-white transition-colors duration-300" 
                            aria-label="Next song"
                        >
                            <SkipNextIcon className="w-8 h-8"/>
                        </button>

                        <button 
                            onClick={cycleRepeatMode} 
                            className={`p-3 rounded-full transition-colors duration-300 relative ${repeatMode !== 'none' ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400 hover:text-white'}`} 
                            aria-label="Repeat mode"
                        >
                            <RepeatIcon className="w-6 h-6"/>
                            {repeatMode === 'one' && <span className="absolute top-1 right-1 text-[9px] bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">1</span>}
                        </button>
                    </div>

                    <div className="flex items-center gap-4 px-4">
                        <VolumeUpIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-2 appearance-none cursor-pointer accent-purple-500 bg-white/10 rounded-lg"
                            aria-label="Volume control"
                             style={{
                                backgroundSize: `${volume * 100}% 100%`,
                                backgroundImage: `linear-gradient(to right, #A855F7, #6366F1)`,
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="lg:w-[380px] flex-shrink-0">
                <TrackList tracks={tracks} currentTrackIndex={currentTrackIndex ?? -1} onTrackSelect={handleTrackSelect} />
            </div>
          </div>
        )}
      </main>
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnd}
        className="hidden"
      />
    </div>
  );
}