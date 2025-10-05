import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useLocalization } from '@/lib/i18n';

export default function TabLayout() {
  const { strings } = useLocalization();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: '#ffffffee',
          paddingBottom: 6,
          height: 74,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: strings.tabs.home,
          tabBarLabel: strings.tabs.home,
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="walk"
        options={{
          title: strings.tabs.walk,
          tabBarLabel: strings.tabs.walk,
          tabBarIcon: ({ color, size }) => <Ionicons name="footsteps" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: strings.tabs.activity,
          tabBarLabel: strings.tabs.activity,
          tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: strings.tabs.settings,
          tabBarLabel: strings.tabs.settings,
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
