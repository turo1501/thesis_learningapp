"use client";

import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  X,
  Clock,
  PlayCircle,
  Loader2,
  Eye,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VideoPreviewMiniProps {
  videoUrl: string;
  chapterTitle: string;
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
  duration?: number;
  thumbnail?: string;
}

const VideoPreviewMini: React.FC<VideoPreviewMiniProps> = ({
  videoUrl,
  chapterTitle,
  isOpen,
  onClose,
  courseTitle,
  duration,
  thumbnail
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for better UX
  const [playedTime, setPlayedTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isPlaying]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Video event handlers
  const handlePlay = () => {
    setIsPlaying(true);
    setIsLoading(false);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleProgress = (state: any) => {
    setPlayedTime(state.playedSeconds);
    setProgress((state.playedSeconds / totalDuration) * 100);
  };

  const handleDuration = (duration: number) => {
    setTotalDuration(duration);
    setIsLoading(false);
  };

  const handleReady = () => {
    setIsLoading(false);
    toast.success("Video preview ready!");
  };

  const handleError = (error: any) => {
    console.error("Video error:", error);
    setIsLoading(false);
    toast.error("Unable to load video preview");
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * totalDuration;
    
    playerRef.current.seekTo(seekTime, 'seconds');
    setPlayedTime(seekTime);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "fixed z-50 bg-black/80 backdrop-blur-sm",
          isFullscreen 
            ? "inset-0" 
            : "bottom-4 right-4 w-96 h-64 rounded-xl overflow-hidden"
        )}
        onClick={isFullscreen ? undefined : (e) => e.stopPropagation()}
      >
        <Card className={cn(
          "relative h-full bg-customgreys-darkGrey border-customgreys-darkGrey/50 overflow-hidden",
          isFullscreen && "border-0 rounded-none"
        )}>
          {/* Video Header */}
          <motion.div 
            className={cn(
              "absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-3",
              (!showControls && isPlaying) && "opacity-0 pointer-events-none"
            )}
            animate={{ 
              opacity: (!showControls && isPlaying) ? 0 : 1,
              pointerEvents: (!showControls && isPlaying) ? "none" : "auto"
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <h3 className="text-white font-medium text-sm truncate">
                  {chapterTitle}
                </h3>
                {courseTitle && (
                  <p className="text-customgreys-dirtyGrey text-xs truncate">
                    {courseTitle}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs bg-primary-600/20 text-primary-400 border-primary-600/30">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Badge>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={onClose}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Video Player */}
          <div 
            className="relative h-full group cursor-pointer"
            onClick={togglePlay}
            onMouseMove={handleMouseMove}
          >
            {videoUrl ? (
              <>
                <ReactPlayer
                  ref={playerRef}
                  url={videoUrl}
                  playing={isPlaying}
                  muted={isMuted}
                  volume={volume}
                  width="100%"
                  height="100%"
                  controls={false}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onProgress={handleProgress}
                  onDuration={handleDuration}
                  onReady={handleReady}
                  onError={handleError}
                  config={{
                    file: {
                      attributes: {
                        controlsList: "nodownload",
                        poster: thumbnail
                      }
                    }
                  }}
                />

                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-customgreys-secondarybg flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
                      <p className="text-customgreys-dirtyGrey text-sm">Loading preview...</p>
                    </div>
                  </div>
                )}

                {/* Center Play Button */}
                <AnimatePresence>
                  {(!isPlaying || showControls) && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <motion.button
                        className="bg-primary-600/90 hover:bg-primary-600 text-white rounded-full p-3 shadow-lg backdrop-blur-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-0.5" />
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom Controls */}
                <motion.div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3",
                    (!showControls && isPlaying) && "opacity-0 pointer-events-none"
                  )}
                  animate={{ 
                    opacity: (!showControls && isPlaying) ? 0 : 1,
                    pointerEvents: (!showControls && isPlaying) ? "none" : "auto"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Progress Bar */}
                  <div 
                    className="w-full h-1 bg-white/20 rounded-full mb-2 cursor-pointer"
                    onClick={handleSeek}
                  >
                    <div 
                      className="h-full bg-primary-500 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                      >
                        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                      >
                        {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-white">
                      <span>{formatTime(playedTime)}</span>
                      <span>/</span>
                      <span>{formatTime(totalDuration)}</span>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="h-full bg-customgreys-secondarybg flex flex-col items-center justify-center">
                <PlayCircle className="w-12 h-12 text-customgreys-dirtyGrey mb-2" />
                <p className="text-customgreys-dirtyGrey text-sm text-center">
                  No video available for preview
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPreviewMini; 