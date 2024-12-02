// src/components/MusicPlayer.tsx

import React, { useEffect, useState, createContext, useContext } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Image, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Track {
  id: number;
  title: string;
  preview: string;
  artist: {
    id: number;
    name: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
  };
}

interface MusicPlayerContextProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackPosition: number;
  playbackDuration: number;
  playTrack: (track: Track, queue?: Track[], index?: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleFavorite: (track?: Track) => void; 
  favoriteTracks: Track[];
  seekTo: (position: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextProps | null>(null);

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};

interface MusicPlayerProviderProps {
  children: React.ReactNode;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({
  children,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackPosition, setPlaybackPosition] = useState<number>(0);
  const [playbackDuration, setPlaybackDuration] = useState<number>(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>([]); // Added this

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Load favorites from AsyncStorage when the app starts
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favoritesData = await AsyncStorage.getItem("favoriteTracks");
        if (favoritesData) {
          setFavoriteTracks(JSON.parse(favoritesData));
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };

    loadFavorites();
  }, []);

  // Function to add or remove a track from favorites
  const toggleFavorite = async (track?: Track) => {
    const targetTrack = track || currentTrack;
    if (!targetTrack) return;

    let updatedFavorites;
    if (favoriteTracks.find((t) => t.id === targetTrack.id)) {
      // Remove from favorites
      updatedFavorites = favoriteTracks.filter((t) => t.id !== targetTrack.id);
    } else {
      // Add to favorites
      updatedFavorites = [...favoriteTracks, targetTrack];
    }

    setFavoriteTracks(updatedFavorites);

    try {
      await AsyncStorage.setItem(
        "favoriteTracks",
        JSON.stringify(updatedFavorites)
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Playback error: ${status.error}`);
      }
    } else {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis || 0);

      if (status.didJustFinish) {
        playNext();
      }
    }
  };

   // Internal function to play a track without modifying the queue or currentIndex
   const _playTrack = async (track: Track) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.preview },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error loading audio", error);
    }
  };

  const playTrack = async (track: Track, trackQueue?: Track[], index?: number) => {
    if (trackQueue && trackQueue.length > 0) {
      setQueue(trackQueue);
      setCurrentIndex(index ?? 0);
    } else {
      setQueue([track]);
      setCurrentIndex(0);
    }
    await _playTrack(track);
  };

  const playNext = async () => {
    if (queue.length > 0) {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        nextIndex = 0; 
      }
      const nextTrack = queue[nextIndex];
      if (nextTrack) {
        setCurrentIndex(nextIndex);
        await _playTrack(nextTrack);
      }
    }
  };

  const playPrevious = async () => {
    if (queue.length > 0) {
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1; 
      }
      const prevTrack = queue[prevIndex];
      if (prevTrack) {
        setCurrentIndex(prevIndex);
        await _playTrack(prevTrack);
      }
    }
  };

  const togglePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const seekTo = async (position: number) => {
    if (sound) {
      try {
        await sound.setPositionAsync(position);
        setPlaybackPosition(position);
      } catch (error) {
        console.error("Error seeking track:", error);
      }
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playbackPosition,
        playbackDuration,
        playTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        toggleFavorite,
        favoriteTracks,
        seekTo,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

const windowWidth = Dimensions.get("window").width;

export const MusicPlayer: React.FC = () => {
    const {
    currentTrack,
    isPlaying,
    playbackPosition,
    playbackDuration,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleFavorite,
    favoriteTracks,
    seekTo,
    } = useMusicPlayer();

  if (!currentTrack) {
    return null;
  }

  // Determine if the current track is in favorites
  const isFavorite = favoriteTracks.some(
    (track) => track.id === currentTrack.id
  );
  return (
    <View style={styles.container}>
      {/* Album Cover Image */}
      <Image
        source={{ uri: currentTrack.album.cover }}
        style={styles.albumCover}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {currentTrack.title}
        </Text>

        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={playPrevious} style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext} style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleFavorite()}
            style={styles.controlButton}
          >
            <Ionicons
              name="heart"
              size={24}
              color={isFavorite ? "red" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        {/* Slider */}
        <Slider
          style={styles.slider}
          value={playbackPosition}
          minimumValue={0}
          maximumValue={playbackDuration}
          minimumTrackTintColor="#1EB1FC"
          maximumTrackTintColor="#8ED0F9"
          thumbTintColor="#1EB1FC"
          onSlidingComplete={seekTo}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 60,
      left: 0,
      right: 0,
      backgroundColor: "#333",
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    albumCover: {
      width: 60,
      height: 60,
      marginRight: 5,
      borderRadius: 4,
    },
    controlButton: {
      padding: 5,
      marginHorizontal: 5,
    },
    playButton: {
      padding: 5,
      marginHorizontal: 5,
    },
    slider: {
      flex: 1,
    },
    infoContainer: {
        flex: 1,
      },
      songTitle: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
      },
      controlsContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      
  });
