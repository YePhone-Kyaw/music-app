import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GenreDetails from '../../components/GenreDetails'; 
import { useLocalSearchParams } from 'expo-router';

export default function GenreDetailsScreen() {
  const { genreId, genreName } = useLocalSearchParams();

  if (!genreId || !genreName) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid genre information.</Text>
      </View>
    );
  }

  return (
    <GenreDetails genreId={genreId} genreName={genreName as string} />
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});
