import { ComponentProps } from 'react';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

type HapticTabProps = ComponentProps<typeof Pressable> & {
  [key: string]: unknown;
};

export function HapticTab(props: HapticTabProps) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
