import { Tabs, Stack } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { Colors } from '@/constants/theme';
import { useTheme, ThemeProvider } from '@/app/theme-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { AuthProvider } from '../context/AuthContext';

export function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

export default function TabLayout() {
  const { theme: colorScheme } = useTheme();

  return (
    <AuthProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,

          tabBarActiveTintColor:
            Colors[colorScheme === 'oled' ? 'dark' : colorScheme ?? 'light'].tint,

          tabBarInactiveTintColor:
            Colors[colorScheme === 'oled' ? 'dark' : colorScheme ?? 'light'].text,

          tabBarStyle: {
            backgroundColor: Colors[colorScheme === 'oled' ? 'dark' : colorScheme ?? 'light'].background,
            borderTopColor: 'transparent',
          },

          tabBarItemStyle: {
            borderRadius: 16,
            marginVertical: 6,
            height: 55,
            overflow: 'hidden',
          },
          
          tabBarActiveBackgroundColor:
            colorScheme === 'dark' || colorScheme === 'oled'
              ? '#222'
              : '#e5e5e5',
        
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome5 name="heart" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color }) => <MaterialIcons name="coffee" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bag"
          options={{
            title: 'Bag',
            tabBarIcon: ({ color }) => <Feather name="shopping-bag" size={24} color={color} />,
          }}
          
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <MaterialIcons size={28} name="account-circle" color={color} />,
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}
