import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { Colors } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.ink,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { backgroundColor: Colors.card, borderTopColor: Colors.line },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen name="activity" options={{ title: 'Trajets', tabBarIcon: tabIcon('time', 'time-outline') }} />
      <Tabs.Screen name="wallet" options={{ title: 'Portefeuille', tabBarIcon: tabIcon('wallet', 'wallet-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: tabIcon('person', 'person-outline') }} />
    </Tabs>
  );
}
