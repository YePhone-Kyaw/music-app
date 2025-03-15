import { Image, StyleSheet, Platform, ScrollView, View, TouchableOpacity, Dimensions, FlatList, Text } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';

interface Genre {
  id: string;
  name: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
}

// const HomeStack = createStackNavigator();

export default function HomeScreen() {

const [genres, setGenres] = useState<Genre[]>([]);
const router = useRouter();

const fetchGenres = async () => {
  const url = 'https://api.deezer.com/genre';

  try {
    const response = await fetch(url);
    const result = await response.json();
    const filteredGenres = result.data.filter((genre: Genre) => genre.id );
    setGenres(filteredGenres);
  } catch (error) {
    console.error('Error fetching genres: ', error);
  }
};

useEffect(() => {
fetchGenres();
}, []);

const renderGenreItem = ({ item }: { item: Genre }) => (
  <TouchableOpacity
    key={item.id}
    style={styles.genreItem}
    onPress={() =>
      router.push({
        pathname: `./${item.id}`,
        params: { genreName: item.name },
      })
    }
  >
    <Image source={{ uri: item.picture_medium }} style={styles.genreImage} />
    <View style={styles.genreNameContainer}>
      <Text style={styles.genreName}>{item.name}</Text>
    </View>
  </TouchableOpacity>
);

return (
  <View style={styles.container}>
          <ThemedText style={styles.title}>Music Genres</ThemedText>
       <FlatList
        data={genres}
        renderItem={renderGenreItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
    </View>
)
}

const windowWidth = Dimensions.get('window').width;
const genreItemSize = windowWidth / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  title: {
    fontSize: 24,
    marginTop: 24,
    fontWeight: 'bold',
  },
  listContent: {
    alignItems: 'center',
  },
  genreItem: {
    width: genreItemSize,
    height: genreItemSize,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  genreImage: {
    width: '100%',
    height: '100%',
  },
  genreNameContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  genreName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
