// src/app/(tabs)/home/[genreId].tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMusicPlayer } from './MusicPlayer';

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

export default function GenreDetailsScreen() {
  const { genreId, genreName } = useLocalSearchParams();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { playTrack } = useMusicPlayer();

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchTracks = async () => {
    const url = `https://api.deezer.com/genre/${genreId}/artists`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      console.log('API Response:', result); // Log the entire response

      if (result.data && Array.isArray(result.data)) {
        const artistIds = result.data
          .filter((artist: any) => artist && typeof artist.id === 'number')
          .map((artist: any) => artist.id);

        if (artistIds.length === 0) {
          setError('No valid artist data found.');
          setIsLoading(false);
          return;
        }

        const tracksPromises = artistIds.map(async (artistId: number, index: number) => {
          await delay(index * 100); // Add a 100ms delay between each request
          const response = await fetch(`https://api.deezer.com/artist/${artistId}/top?limit=5`);
          return response.json();
        });

        const tracksResults = await Promise.all(tracksPromises);
        const allTracks = tracksResults.flatMap((res) => res.data || []);

        // Remove duplicates
        const uniqueTracks = allTracks.reduce((acc: Track[], track: Track) => {
          if (track && !acc.find((t) => t.id === track.id)) {
            acc.push(track);
          }
          return acc;
        }, []);

        setTracks(uniqueTracks);
      } else {
        console.log('Unexpected API response structure:', result);
        setError('Unexpected data structure from API.');
      }
    } catch (error) {
      console.error('Error fetching tracks: ', error);
      setError('Failed to load tracks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (genreId) {
      fetchTracks();
    }
  }, [genreId]);

  const renderItem = ({ item, index }: { item: Track; index: number }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => {
        playTrack(item, tracks, index);
      }}
    >
      <Image source={{ uri: item.album.cover }} style={styles.albumCover} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{item.title}</Text>
        <Text style={styles.artistName}>{item.artist.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || !genreName) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Invalid genre information.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Tracks in {genreName}</Text>
      {tracks.length > 0 ? (
        <FlatList
          data={tracks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <Text style={styles.noTracksText}>No tracks found for this genre.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 25,
    color: '#fff',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  albumCover: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 4,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  artistName: {
    fontSize: 14,
    color: '#555',
  },
  noTracksText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});
