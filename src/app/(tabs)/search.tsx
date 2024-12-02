import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useMusicPlayer } from '../../components/MusicPlayer';
import { ThemedText } from '@/components/ThemedText';

interface DeezerTrack {
  id: number;
  title: string;
  preview?: string;
  artist: {
    id: number;
    name: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
    cover_small: string;
  };
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const { playTrack } = useMusicPlayer();

  const searchTrack = async () => {
    if (!query.trim()) return;
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setResults(data.data);
    } catch (error) {
      console.error('Error searching Deezer API:', error);
    }
  };

  const renderItem = ({ item }: { item: DeezerTrack }) => {
    if (!item.preview) {
      return (
        <View style={styles.resultItem}>
          <Image
            source={{ uri: item.album.cover_small }}
            style={styles.albumCover}
          />
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle}>{item.title}</Text>
            <Text style={styles.artistName}>{item.artist.name}</Text>
            <Text style={styles.noPreviewText}>No Preview Available</Text>
          </View>
        </View>
      );
    }

    const track = {
      id: item.id,
      title: item.title,
      preview: item.preview,
      artist: {
        id: item.artist.id,
        name: item.artist.name,
      },
      album: {
        id: item.album.id,
        title: item.album.title,
        cover: item.album.cover,
      },
    };

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => playTrack(track)}
      >
        <Image
          source={{ uri: item.album.cover_small }}
          style={styles.albumCover}
        />
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{item.title}</Text>
          <Text style={styles.artistName}>{item.artist.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Search</ThemedText>

      <TextInput
        style={styles.searchInput}
        placeholder="Search for tracks, artists, albums..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={searchTrack}
        placeholderTextColor="#ccc"
      />
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginTop: 24,
    fontWeight: 'bold',
  },
  searchInput: {
    height: 48,
    paddingHorizontal: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 24,
    marginTop: 24,
    marginBottom: 16,
    color: 'white',
    backgroundColor: 'grey',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  albumCover: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    color: '#fff',
  },
  artistName: {
    fontSize: 14,
    color: '#ccc',
  },
  noPreviewText: {
    color: '#888',
    fontSize: 12,
  },
});
