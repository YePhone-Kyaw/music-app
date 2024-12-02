// src/app/(tabs)/favorites.tsx

import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { useMusicPlayer } from "../../components/MusicPlayer";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

interface Track {
  id: number;
  title: string;
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

export default function FavoritesScreen() {
  const { favoriteTracks, playTrack, toggleFavorite } = useMusicPlayer();

  const renderItem = ({ item, index }: { item: Track; index: number }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => playTrack(item, favoriteTracks, index)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.album.cover }} style={styles.albumCover} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{item.title}</Text>
        <Text style={styles.artistName}>{item.artist.name}</Text>
      </View>
    </TouchableOpacity>
  );
  

  const renderHiddenItem = ({ item }: { item: Track }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => toggleFavorite(item)}
      >
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
  

  return (
    <View style={styles.container}>
          <ThemedText style={styles.title}>Favorites</ThemedText>

      {favoriteTracks.length === 0 ? (
        <Text style={styles.emptyMessage}>No favorite tracks yet.</Text>
      ) : (
          <SwipeListView
            data={favoriteTracks}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            keyExtractor={(item) => item.id.toString()}
            rightOpenValue={-75}
            disableRightSwipe
            contentContainerStyle={{ paddingBottom: 100 }}
          />
      )}
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
  emptyMessage: {
    fontSize: 18,
    alignItems: "center",
    textAlign: "center",
    marginTop: 150,
    color: "#fff",
    textAlignVertical: "center",
  },
  trackItem: {
    marginTop: 5,
    borderRadius: 5,
    backgroundColor: "#888",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
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
  },
  artistName: {
    fontSize: 14,
    color: "#666",
  },
  rowBack: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 15,
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: 75,
  },
});
