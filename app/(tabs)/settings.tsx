import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/constants/localization';
import { Colors } from '@/constants/theme';
import { useLocalization } from '@/lib/i18n';

export default function SettingsScreen() {
  const { strings, language, setLanguage, deviceLanguage } = useLocalization();

  const handleSelect = useCallback(
    (value: SupportedLanguage) => {
      if (value !== language) {
        void setLanguage(value);
      }
    },
    [language, setLanguage]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{strings.settings.title}</Text>
          <Text style={styles.description}>{strings.settings.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.settings.languageSectionTitle}</Text>
          <Text style={styles.sectionSubtitle}>{strings.settings.languageSectionSubtitle}</Text>
          <Text style={styles.deviceLanguage}>
            {strings.settings.deviceLanguageLabel(strings.settings.languageOptions[deviceLanguage])}
          </Text>

          <View style={styles.options}>
            {SUPPORTED_LANGUAGES.map((value) => {
              const label = strings.settings.languageOptions[value];
              const isActive = value === language;
              return (
                <Pressable
                  key={value}
                  onPress={() => handleSelect(value)}
                  style={[styles.optionRow, isActive && styles.optionRowActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <View style={styles.optionIndicator}>
                    <Ionicons
                      name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={isActive ? Colors.light.tint : '#9ca3af'}
                    />
                  </View>
                  <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 24,
    paddingBottom: 32,
    gap: 32,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  deviceLanguage: {
    fontSize: 13,
    color: '#9ca3af',
  },
  options: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 12,
  },
  optionRowActive: {
    borderColor: Colors.light.tint,
    backgroundColor: '#f0f9ff',
  },
  optionIndicator: {
    width: 24,
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  optionLabelActive: {
    color: Colors.light.tint,
  },
});
