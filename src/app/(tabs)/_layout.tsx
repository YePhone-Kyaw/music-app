import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Entypo, Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { MusicPlayer, MusicPlayerProvider } from "@/src/components/MusicPlayer";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <MusicPlayerProvider>
<Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Entypo size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Feather size={28} name="search" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          title: "Favorite",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="favorite" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="[genreId]"
        options={{
          title: "Songs",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="music" color={color} />
          ),
        }}
      />
    </Tabs>
    <MusicPlayer />
    </MusicPlayerProvider>
    
  );
}
